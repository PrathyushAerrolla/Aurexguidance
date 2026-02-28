import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb, getUserCareerPlans } from "./db";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  /**
   * Schedule a milestone reminder email
   */
  scheduleMilestoneReminder: protectedProcedure
    .input(
      z.object({
        careerPlanId: z.number(),
        milestoneTitle: z.string(),
        milestoneDescription: z.string(),
        daysUntilMilestone: z.number(),
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
        // Verify user owns this plan
        const plans = await getUserCareerPlans(db, ctx.user.id);
        const plan = plans.find((p) => p.id === input.careerPlanId);

        if (!plan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Career plan not found",
          });
        }

        // Calculate reminder date
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + input.daysUntilMilestone);

        // Send notification to owner
        await notifyOwner({
          title: `Career Milestone Reminder: ${input.milestoneTitle}`,
          content: `User ${ctx.user.name} has a milestone coming up: ${input.milestoneDescription}. Estimated date: ${reminderDate.toLocaleDateString()}`,
        });

        return {
          success: true,
          reminderDate: reminderDate.toISOString(),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error scheduling milestone reminder:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to schedule reminder",
        });
      }
    }),

  /**
   * Send learning resource suggestions
   */
  sendResourceSuggestions: protectedProcedure
    .input(
      z.object({
        careerPlanId: z.number(),
        skills: z.array(z.string()),
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
        // Verify user owns this plan
        const plans = await getUserCareerPlans(db, ctx.user.id);
        const plan = plans.find((p) => p.id === input.careerPlanId);

        if (!plan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Career plan not found",
          });
        }

        // Send notification to owner
        const skillsList = input.skills.slice(0, 5).join(", ");
        await notifyOwner({
          title: "Learning Resources Suggested",
          content: `User ${ctx.user.name} has been recommended resources for skills: ${skillsList}. They should focus on these areas to achieve their career goal.`,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error sending resource suggestions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send suggestions",
        });
      }
    }),

  /**
   * Send progress check-in notification
   */
  sendProgressCheckIn: protectedProcedure
    .input(
      z.object({
        careerPlanId: z.number(),
        progressPercentage: z.number().min(0).max(100),
        nextMilestone: z.string(),
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
        // Verify user owns this plan
        const plans = await getUserCareerPlans(db, ctx.user.id);
        const plan = plans.find((p) => p.id === input.careerPlanId);

        if (!plan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Career plan not found",
          });
        }

        // Send notification to owner
        await notifyOwner({
          title: "Career Progress Update",
          content: `User ${ctx.user.name} is ${input.progressPercentage}% through their career plan. Next milestone: ${input.nextMilestone}. Keep them motivated!`,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error sending progress check-in:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send check-in",
        });
      }
    }),

  /**
   * Get notification preferences for a user
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // Return default notification preferences
    return {
      milestoneReminders: true,
      resourceSuggestions: true,
      progressCheckIns: true,
      reminderFrequency: "weekly", // weekly, biweekly, monthly
      preferredTime: "09:00", // 24-hour format
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        milestoneReminders: z.boolean().optional(),
        resourceSuggestions: z.boolean().optional(),
        progressCheckIns: z.boolean().optional(),
        reminderFrequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
        preferredTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In a real app, this would save to database
      // For now, just return the updated preferences
      return {
        success: true,
        preferences: {
          milestoneReminders: input.milestoneReminders ?? true,
          resourceSuggestions: input.resourceSuggestions ?? true,
          progressCheckIns: input.progressCheckIns ?? true,
          reminderFrequency: input.reminderFrequency ?? "weekly",
          preferredTime: input.preferredTime ?? "09:00",
        },
      };
    }),
});
