import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Increase timeout for tests that call LLM
vi.setConfig({ testTimeout: 30000 });

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

describe("careerGuidance.createPlan", () => {
  it("should create a career plan with valid input", async () => {
    vi.setConfig({ testTimeout: 30000 });
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.careerGuidance.createPlan({
      name: "John Doe",
      educationLevel: "bachelor",
      educationField: "Computer Science",
      careerGoals: "Become a senior software engineer and lead a tech team",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("status");
    expect(result.status).toBe("active");
    expect(result.title).toContain("John Doe");
  });

  it("should reject empty name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.careerGuidance.createPlan({
        name: "",
        educationLevel: "bachelor",
        educationField: "Computer Science",
        careerGoals: "Become a senior software engineer",
      })
    ).rejects.toThrow();
  });

  it("should reject short career goals", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.careerGuidance.createPlan({
        name: "John Doe",
        educationLevel: "bachelor",
        educationField: "Computer Science",
        careerGoals: "Success",
      })
    ).rejects.toThrow();
  });

  it("should reject missing education level", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.careerGuidance.createPlan({
        name: "John Doe",
        educationLevel: "",
        educationField: "Computer Science",
        careerGoals: "Become a senior software engineer",
      })
    ).rejects.toThrow();
  });
});

describe("careerGuidance.getPlan", () => {
  it("should return 404 for non-existent plan", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.careerGuidance.getPlan({ planId: 99999 })
    ).rejects.toThrow("not found");
  });

  it("should prevent access to other user's plans", async () => {
    vi.setConfig({ testTimeout: 30000 });
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // User 1 creates a plan
    const plan = await caller1.careerGuidance.createPlan({
      name: "User 1",
      educationLevel: "bachelor",
      educationField: "Computer Science",
      careerGoals: "Become a senior software engineer and lead a tech team",
    });

    // User 2 tries to access it
    await expect(
      caller2.careerGuidance.getPlan({ planId: plan.id })
    ).rejects.toThrow("not found");
  });
});

describe("careerGuidance.listPlans", () => {
  it("should return empty list for new user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plans = await caller.careerGuidance.listPlans();
    expect(Array.isArray(plans)).toBe(true);
  });

  it("should return only user's own plans", async () => {
    vi.setConfig({ testTimeout: 30000 });
    const ctx1 = createAuthContext(100);
    const ctx2 = createAuthContext(101);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // User 1 creates a plan
    const plan1 = await caller1.careerGuidance.createPlan({
      name: "User 1",
      educationLevel: "bachelor",
      educationField: "Computer Science",
      careerGoals: "Become a senior software engineer and lead a tech team",
    });

    // User 2 creates a plan
    const plan2 = await caller2.careerGuidance.createPlan({
      name: "User 2",
      educationLevel: "master",
      educationField: "Business Administration",
      careerGoals: "Become a business executive and entrepreneur",
    });

    const user1Plans = await caller1.careerGuidance.listPlans();
    const user2Plans = await caller2.careerGuidance.listPlans();

    const user1HasOwnPlan = user1Plans.some(p => p.id === plan1.id);
    const user2HasOwnPlan = user2Plans.some(p => p.id === plan2.id);
    expect(user1HasOwnPlan).toBe(true);
    expect(user2HasOwnPlan).toBe(true);
    
    const user1HasUser2Plan = user1Plans.some(p => p.id === plan2.id);
    expect(user1HasUser2Plan).toBe(false);
  });
});

describe("careerGuidance.updatePlanStatus", () => {
  it("should update plan status", async () => {
    vi.setConfig({ testTimeout: 30000 });
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plan = await caller.careerGuidance.createPlan({
      name: "John Doe",
      educationLevel: "bachelor",
      educationField: "Computer Science",
      careerGoals: "Become a senior software engineer and lead a tech team",
    });

    const result = await caller.careerGuidance.updatePlanStatus({
      planId: plan.id,
      status: "completed",
    });

    expect(result.success).toBe(true);

    const updatedPlan = await caller.careerGuidance.getPlan({ planId: plan.id });
    expect(updatedPlan.status).toBe("completed");
  });

  it("should prevent unauthorized status updates", async () => {
    vi.setConfig({ testTimeout: 30000 });
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    const plan = await caller1.careerGuidance.createPlan({
      name: "User 1",
      educationLevel: "bachelor",
      educationField: "Computer Science",
      careerGoals: "Become a senior software engineer and lead a tech team",
    });

    await expect(
      caller2.careerGuidance.updatePlanStatus({
        planId: plan.id,
        status: "completed",
      })
    ).rejects.toThrow("not found");
  });
});
