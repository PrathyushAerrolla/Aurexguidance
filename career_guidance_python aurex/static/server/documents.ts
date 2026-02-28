import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb, insertDocument, getDocumentsByUser, deleteDocument } from "./db";
import { storagePut, storageGet } from "./storage";
import { TRPCError } from "@trpc/server";

export const documentsRouter = router({
  /**
   * Upload a document (resume, certificate, portfolio item)
   */
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileType: z.enum(["resume", "certificate", "portfolio"]),
        fileData: z.string(), // Base64 encoded file data
        careerPlanId: z.number().optional(),
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
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, "base64");

        // Determine MIME type
        let mimeType = "application/octet-stream";
        if (input.fileName.endsWith(".pdf")) {
          mimeType = "application/pdf";
        } else if (input.fileName.endsWith(".doc") || input.fileName.endsWith(".docx")) {
          mimeType = "application/msword";
        } else if (input.fileName.endsWith(".jpg") || input.fileName.endsWith(".jpeg")) {
          mimeType = "image/jpeg";
        } else if (input.fileName.endsWith(".png")) {
          mimeType = "image/png";
        }

        // Upload to S3
        const fileKey = `${ctx.user.id}/documents/${input.fileType}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, mimeType);

        // Save to database
        const document = await insertDocument(db, {
          userId: ctx.user.id,
          careerPlanId: input.careerPlanId,
          fileName: input.fileName,
          fileType: input.fileType,
          fileKey,
          fileUrl: url,
          fileSize: buffer.length,
        });

        return {
          id: document.id,
          fileName: document.fileName,
          fileUrl: document.fileUrl,
          uploadedAt: document.uploadedAt,
        };
      } catch (error) {
        console.error("Error uploading document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload document",
        });
      }
    }),

  /**
   * Get all documents for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    return await getDocumentsByUser(db, ctx.user.id);
  }),

  /**
   * Get a presigned URL for downloading a document
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        // Get document from DB to verify ownership
        const documents = await getDocumentsByUser(db, ctx.user.id);
        const document = documents.find((d) => d.id === input.documentId);

        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Get presigned URL (valid for 1 hour)
        const { url } = await storageGet(document.fileKey);

        return { url };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error getting download URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get download URL",
        });
      }
    }),

  /**
   * Delete a document
   */
  delete: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        // Get document to verify ownership
        const documents = await getDocumentsByUser(db, ctx.user.id);
        const document = documents.find((d) => d.id === input.documentId);

        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Delete from database
        await deleteDocument(db, input.documentId);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete document",
        });
      }
    }),
});
