import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user-" + userId,
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("documents", () => {
  it("should list documents for a user", async () => {
    vi.setConfig({ testTimeout: 15000 });
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const documents = await caller.documents.list();

    expect(Array.isArray(documents)).toBe(true);
  });

  it("should reject invalid file type", async () => {
    vi.setConfig({ testTimeout: 15000 });
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.documents.upload({
        fileName: "test.txt",
        fileType: "invalid" as any,
        fileData: "dGVzdCBkYXRh",
      })
    ).rejects.toThrow();
  });
});

describe("notifications", () => {
  it("should get notification preferences", async () => {
    vi.setConfig({ testTimeout: 15000 });
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const preferences = await caller.notifications.getPreferences();

    expect(preferences).toHaveProperty("milestoneReminders");
    expect(preferences).toHaveProperty("resourceSuggestions");
    expect(preferences).toHaveProperty("progressCheckIns");
    expect(preferences).toHaveProperty("reminderFrequency");
    expect(preferences).toHaveProperty("preferredTime");
  });

  it("should update notification preferences", async () => {
    vi.setConfig({ testTimeout: 15000 });
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.updatePreferences({
      milestoneReminders: false,
      reminderFrequency: "monthly",
    });

    expect(result.success).toBe(true);
    expect(result.preferences.milestoneReminders).toBe(false);
    expect(result.preferences.reminderFrequency).toBe("monthly");
  });

  it("should schedule milestone reminder with valid plan", { timeout: 60000 }, async () => {
    const ctx = createAuthContext(200);
    const caller = appRouter.createCaller(ctx);

    // First create a career plan
    const plan = await caller.careerGuidance.createPlan({
      name: "Test User",
      educationLevel: "bachelor",
      educationField: "Computer Science",
      careerGoals: "Become a senior software engineer and lead a tech team",
    });

    // Then schedule a reminder
    const result = await caller.notifications.scheduleMilestoneReminder({
      careerPlanId: plan.id,
      milestoneTitle: "Complete First Project",
      milestoneDescription: "Finish your first major project",
      daysUntilMilestone: 30,
    });

    expect(result.success).toBe(true);
    expect(result.reminderDate).toBeDefined();
  });

  it("should reject milestone reminder for non-existent plan", async () => {
    vi.setConfig({ testTimeout: 15000 });
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.notifications.scheduleMilestoneReminder({
        careerPlanId: 99999,
        milestoneTitle: "Test",
        milestoneDescription: "Test milestone",
        daysUntilMilestone: 30,
      })
    ).rejects.toThrow("not found");
  });

  it("should send resource suggestions", { timeout: 60000 }, async () => {
    const ctx = createAuthContext(201);
    const caller = appRouter.createCaller(ctx);

    // First create a career plan
    const plan = await caller.careerGuidance.createPlan({
      name: "Test User",
      educationLevel: "master",
      educationField: "Business Administration",
      careerGoals: "Become a business executive and entrepreneur",
    });

    // Then send suggestions
    const result = await caller.notifications.sendResourceSuggestions({
      careerPlanId: plan.id,
      skills: ["Leadership", "Strategic Planning", "Financial Analysis"],
    });

    expect(result.success).toBe(true);
  });

  it("should send progress check-in", { timeout: 60000 }, async () => {
    const ctx = createAuthContext(202);
    const caller = appRouter.createCaller(ctx);

    // First create a career plan
    const plan = await caller.careerGuidance.createPlan({
      name: "Test User",
      educationLevel: "bachelor",
      educationField: "Computer Science",
      careerGoals: "Become a senior software engineer and lead a tech team",
    });

    // Then send check-in
    const result = await caller.notifications.sendProgressCheckIn({
      careerPlanId: plan.id,
      progressPercentage: 50,
      nextMilestone: "Complete advanced courses",
    });

    expect(result.success).toBe(true);
  });
});
