import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb, createCareerPlan, getCareerPlan, getUserCareerPlans, updateCareerPlanStatus } from "./db";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { documentsRouter } from "./documents";
import { notificationsRouter } from "./notifications";

export const appRouter = router({
  system: systemRouter,
  documents: documentsRouter,
  notifications: notificationsRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  careerGuidance: router({
    /**
     * Create a new career plan with AI-powered analysis
     */
    createPlan: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          educationLevel: z.string().min(1, "Education level is required"),
          educationField: z.string().min(1, "Education field is required"),
          careerGoals: z.string().min(10, "Career goals must be at least 10 characters"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        try {
          // Generate AI analysis
          const systemPrompt = 'You are an expert career counselor. Analyze the user profile and provide comprehensive career guidance in JSON format.';
          const userPrompt = `Please analyze this profile: Name: ${input.name}, Education Level: ${input.educationLevel}, Field: ${input.educationField}, Goals: ${input.careerGoals}`;
          
          const aiResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert career counselor. Analyze the user's profile and provide comprehensive career guidance in JSON format with the following structure:
                {
                  "careerRecommendations": ["career1", "career2", ...],
                  "careerProgression": ["step1", "step2", ...],
                  "skillGaps": ["skill1", "skill2", ...],
                  "timelineMonths": 24,
                  "summary": "brief summary of recommendations"
                }`,
              },
              {
                role: "user",
                content: `Please analyze this profile and provide career guidance:
                Name: ${input.name}
                Education Level: ${input.educationLevel}
                Field of Study: ${input.educationField}
                Career Goals: ${input.careerGoals}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "career_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    careerRecommendations: {
                      type: "array",
                      items: { type: "string" },
                      description: "Recommended career paths",
                    },
                    careerProgression: {
                      type: "array",
                      items: { type: "string" },
                      description: "Steps for career progression",
                    },
                    skillGaps: {
                      type: "array",
                      items: { type: "string" },
                      description: "Skills that need to be developed",
                    },
                    timelineMonths: {
                      type: "number",
                      description: "Estimated timeline in months",
                    },
                    summary: {
                      type: "string",
                      description: "Summary of recommendations",
                    },
                  },
                  required: ["careerRecommendations", "careerProgression", "skillGaps", "timelineMonths", "summary"],
                  additionalProperties: false,
                },
              },
            },
          });

          // Parse AI response
          let aiAnalysis;
          try {
            const content = aiResponse.choices[0]?.message?.content;
            const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
            aiAnalysis = contentStr ? JSON.parse(contentStr) : {
              careerRecommendations: [],
              careerProgression: [],
              skillGaps: [],
              timelineMonths: 24,
              summary: "Career analysis generated",
            };
          } catch {
            aiAnalysis = {
              careerRecommendations: [],
              careerProgression: [],
              skillGaps: [],
              timelineMonths: 24,
              summary: "Career analysis generated",
            };
          }

          // Create career plan in database
          const plan = await createCareerPlan(db, {
            userId: ctx.user.id,
            title: `${input.name}'s Career Plan`,
            educationLevel: input.educationLevel,
            educationField: input.educationField,
            careerGoals: input.careerGoals,
            aiAnalysis,
            status: "active",
          });

          return {
            id: plan.id,
            title: plan.title,
            status: plan.status,
          };
        } catch (error) {
          console.error("Error creating career plan:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create career plan",
          });
        }
      }),

    /**
     * Get a specific career plan with all details
     */
    getPlan: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const plan = await getCareerPlan(db, input.planId);

        if (!plan || plan.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Career plan not found",
          });
        }

        return plan;
      }),

    /**
     * Get all career plans for the current user
     */
    listPlans: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      return await getUserCareerPlans(db, ctx.user.id);
    }),

    /**
     * Update career plan status
     */
    updatePlanStatus: protectedProcedure
      .input(
        z.object({
          planId: z.number(),
          status: z.enum(["draft", "active", "completed", "archived"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const plan = await getCareerPlan(db, input.planId);

        if (!plan || plan.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Career plan not found",
          });
        }

        await updateCareerPlanStatus(db, input.planId, input.status);

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
