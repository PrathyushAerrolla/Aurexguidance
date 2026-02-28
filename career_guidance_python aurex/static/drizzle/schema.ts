import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table with email/password authentication support
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  age: int("age"),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  theme: mysqlEnum("theme", ["light", "dark"]).default("light").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Career plans table with timeline and progress tracking
 */
export const careerPlans = mysqlTable("careerPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  educationLevel: varchar("educationLevel", { length: 100 }).notNull(),
  educationField: varchar("educationField", { length: 255 }).notNull(),
  careerGoals: text("careerGoals").notNull(),
  userTimelineMonths: int("userTimelineMonths"),
  aiAnalysis: json("aiAnalysis").notNull(),
  mindmapData: json("mindmapData"),
  timelineData: json("timelineData"),
  skillsRecommendation: json("skillsRecommendation"),
  resourcesRecommendation: json("resourcesRecommendation"),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0.00"),
  status: mysqlEnum("status", ["draft", "active", "completed", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CareerPlan = typeof careerPlans.$inferSelect;
export type InsertCareerPlan = typeof careerPlans.$inferInsert;

/**
 * Milestones table with completion tracking
 */
export const milestones = mysqlTable("milestones", {
  id: int("id").autoincrement().primaryKey(),
  careerPlanId: int("careerPlanId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetDate: timestamp("targetDate").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  notificationSent: boolean("notificationSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

/**
 * Skills table with completion tracking
 */
export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  careerPlanId: int("careerPlanId").notNull(),
  skillName: varchar("skillName", { length: 255 }).notNull(),
  skillType: mysqlEnum("skillType", ["technical", "soft"]).notNull(),
  proficiencyLevel: mysqlEnum("proficiencyLevel", ["beginner", "intermediate", "advanced", "expert"]).default("beginner").notNull(),
  importance: mysqlEnum("importance", ["critical", "important", "nice_to_have"]).default("important").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  learningResources: json("learningResources"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

/**
 * Documents table for career-related files
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  careerPlanId: int("careerPlanId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Email notifications table
 */
export const emailNotifications = mysqlTable("emailNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  careerPlanId: int("careerPlanId").notNull(),
  milestoneId: int("milestoneId"),
  notificationType: mysqlEnum("notificationType", ["milestone_reminder", "resource_suggestion", "progress_checkin"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("pending").notNull(),
});

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;

/**
 * Plan versions table for tracking changes
 */
export const planVersions = mysqlTable("planVersions", {
  id: int("id").autoincrement().primaryKey(),
  careerPlanId: int("careerPlanId").notNull(),
  versionNumber: int("versionNumber").notNull(),
  changes: json("changes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlanVersion = typeof planVersions.$inferSelect;
export type InsertPlanVersion = typeof planVersions.$inferInsert;

/**
 * Plan shares table for sharing and access control
 */
export const planShares = mysqlTable("planShares", {
  id: int("id").autoincrement().primaryKey(),
  careerPlanId: int("careerPlanId").notNull(),
  shareToken: varchar("shareToken", { length: 255 }).notNull().unique(),
  sharedBy: int("sharedBy").notNull(),
  shareType: mysqlEnum("shareType", ["link", "email", "social"]).default("link").notNull(),
  expiresAt: timestamp("expiresAt"),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlanShare = typeof planShares.$inferSelect;
export type InsertPlanShare = typeof planShares.$inferInsert;
