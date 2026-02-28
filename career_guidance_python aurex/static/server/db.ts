import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, careerPlans, InsertCareerPlan, CareerPlan, documents, skills, planShares, planVersions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Create or update user with email/password authentication
 */
export async function createOrUpdateUser(data: {
  email: string;
  name?: string;
  age?: number;
  passwordHash?: string;
  loginMethod?: string;
  emailVerified?: boolean;
  openId?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return;
  }

  try {
    const values = {
      email: data.email,
      name: data.name || null,
      age: data.age || null,
      passwordHash: data.passwordHash || null,
      loginMethod: data.loginMethod || "email",
      emailVerified: data.emailVerified || false,
      openId: data.openId || null,
      lastSignedIn: new Date(),
    };

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: {
        name: data.name || undefined,
        age: data.age || undefined,
        passwordHash: data.passwordHash || undefined,
        emailVerified: data.emailVerified || undefined,
        lastSignedIn: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to create/update user:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update user theme preference
 */
export async function updateUserTheme(userId: number, theme: "light" | "dark"): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set({ theme }).where(eq(users.id, userId));
}

/**
 * Create a new career plan
 */
export async function createCareerPlan(
  db: ReturnType<typeof drizzle>,
  data: Omit<InsertCareerPlan, 'createdAt' | 'updatedAt'> & { userId: number }
): Promise<CareerPlan> {
  const result = await db.insert(careerPlans).values({
    ...data,
    aiAnalysis: data.aiAnalysis || {},
  });

  const planId = result[0]?.insertId;
  if (!planId) {
    throw new Error("Failed to create career plan");
  }

  const plan = await db.select().from(careerPlans).where(eq(careerPlans.id, planId as number)).limit(1);
  if (!plan || plan.length === 0) {
    throw new Error("Failed to retrieve created career plan");
  }

  return plan[0];
}

/**
 * Get a career plan by ID
 */
export async function getCareerPlan(
  db: ReturnType<typeof drizzle>,
  planId: number
): Promise<CareerPlan | undefined> {
  const result = await db.select().from(careerPlans).where(eq(careerPlans.id, planId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all career plans for a user
 */
export async function getUserCareerPlans(
  db: ReturnType<typeof drizzle>,
  userId: number
): Promise<CareerPlan[]> {
  return await db.select().from(careerPlans).where(eq(careerPlans.userId, userId));
}

/**
 * Update career plan status
 */
export async function updateCareerPlanStatus(
  db: ReturnType<typeof drizzle>,
  planId: number,
  status: "draft" | "active" | "completed" | "archived"
): Promise<void> {
  await db.update(careerPlans).set({ status }).where(eq(careerPlans.id, planId));
}

/**
 * Update career plan progress
 */
export async function updateCareerPlanProgress(
  db: ReturnType<typeof drizzle>,
  planId: number,
  progress: number
): Promise<void> {
  await db.update(careerPlans).set({ progress: progress.toString() }).where(eq(careerPlans.id, planId));
}

/**
 * Update career plan with AI analysis results
 */
export async function updateCareerPlanAnalysis(
  db: ReturnType<typeof drizzle>,
  planId: number,
  data: {
    aiAnalysis?: Record<string, unknown>;
    mindmapData?: Record<string, unknown>;
    timelineData?: Record<string, unknown>;
    skillsRecommendation?: Record<string, unknown>;
    resourcesRecommendation?: Record<string, unknown>;
    userTimelineMonths?: number;
  }
): Promise<void> {
  await db.update(careerPlans).set(data).where(eq(careerPlans.id, planId));
}

/**
 * Insert a document
 */
export async function insertDocument(
  db: ReturnType<typeof drizzle>,
  data: {
    userId: number;
    careerPlanId?: number | null;
    fileName: string;
    fileType: string;
    fileKey: string;
    fileUrl: string;
    fileSize: number;
  }
) {
  const result = await db.insert(documents).values(data);
  const docId = result[0]?.insertId;
  if (!docId) throw new Error("Failed to insert document");
  
  const doc = await db.select().from(documents).where(eq(documents.id, docId as number)).limit(1);
  return doc[0];
}

/**
 * Get documents by user
 */
export async function getDocumentsByUser(
  db: ReturnType<typeof drizzle>,
  userId: number
) {
  return await db.select().from(documents).where(eq(documents.userId, userId));
}

/**
 * Delete a document
 */
export async function deleteDocument(
  db: ReturnType<typeof drizzle>,
  documentId: number
): Promise<void> {
  await db.delete(documents).where(eq(documents.id, documentId));
}

/**
 * Get skills for a career plan
 */
export async function getSkillsByPlan(
  db: ReturnType<typeof drizzle>,
  planId: number
) {
  return await db.select().from(skills).where(eq(skills.careerPlanId, planId));
}

/**
 * Update skill completion status
 */
export async function updateSkillCompletion(
  db: ReturnType<typeof drizzle>,
  skillId: number,
  isCompleted: boolean
): Promise<void> {
  await db.update(skills).set({
    isCompleted,
    completedAt: isCompleted ? new Date() : null,
  }).where(eq(skills.id, skillId));
}

/**
 * Create a plan share
 */
export async function createPlanShare(
  db: ReturnType<typeof drizzle>,
  data: {
    careerPlanId: number;
    shareToken: string;
    sharedBy: number;
    shareType: "link" | "email" | "social";
    expiresAt?: Date;
  }
) {
  const result = await db.insert(planShares).values(data);
  const shareId = result[0]?.insertId;
  if (!shareId) throw new Error("Failed to create plan share");
  
  const share = await db.select().from(planShares).where(eq(planShares.id, shareId as number)).limit(1);
  return share[0];
}

/**
 * Get plan share by token
 */
export async function getPlanShareByToken(
  db: ReturnType<typeof drizzle>,
  token: string
) {
  const result = await db.select().from(planShares).where(eq(planShares.shareToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a plan version
 */
export async function createPlanVersion(
  db: ReturnType<typeof drizzle>,
  data: {
    careerPlanId: number;
    versionNumber: number;
    changes?: Record<string, unknown>;
  }
) {
  const result = await db.insert(planVersions).values(data);
  const versionId = result[0]?.insertId;
  if (!versionId) throw new Error("Failed to create plan version");
  
  const version = await db.select().from(planVersions).where(eq(planVersions.id, versionId as number)).limit(1);
  return version[0];
}
