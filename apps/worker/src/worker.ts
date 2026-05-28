import mongoose from "mongoose";
import { Worker, Job } from "bullmq";
import { config } from "./config";
import { GenerationJobPayload } from "@veda/shared";
import { generatePaperWithFallback } from "./services/ai-generator";
import {
  connectDB,
  saveGeneratedPaper,
  updateAssignmentStatus,
} from "./services/db";
import {
  emitProgress,
  emitCompleted,
  emitFailed,
} from "./services/socket-emitter";
import { generatePdf } from "./services/pdf-generator";
import { extractText } from "./services/extract-text";
import { addGenerationJob } from "./queues/generation.queue";

const connection = { url: config.redisUri };

process.on("uncaughtException", (err) => {
  console.error("❌ Worker uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Worker unhandled rejection:", reason);
  process.exit(1);
});

async function startWorkers() {
  try {
    console.log("🚀 Starting workers...");

    // ========== FILE EXTRACTION WORKER ==========
    interface ExtractionJobPayload {
      assignmentId: string;
      form: GenerationJobPayload;
      file?: {
        path: string;
        originalName: string;
        mimetype: string;
      };
    }

    const extractionWorker = new Worker<ExtractionJobPayload>(
      "file-extraction",
      async (job: Job<ExtractionJobPayload>) => {
        console.log(`📂 Processing extraction job ${job.id}`);

        await emitProgress(job.id!, 5, job.data.assignmentId);

        try {
          await connectDB();

          const { assignmentId, form, file } = job.data;
          let uploadedContent: string | undefined;
          const isProduction =
            (process.env.NODE_ENV || "").trim() === "production";

          if (isProduction) {
            const { UploadModel } = await import("./models/upload.model");
            const upload = await UploadModel.findOne({
              assignmentId: new mongoose.Types.ObjectId(assignmentId),
            });
            if (!upload) throw new Error("Uploaded file not found in database");
            uploadedContent = await extractText(
              upload.fileBuffer,
              upload.mimetype,
              upload.originalName,
            );
          } else {
            if (!file) throw new Error("No file provided for extraction");
            uploadedContent = await extractText(
              file.path,
              file.mimetype,
              file.originalName,
            );
          }

          await emitProgress(job.id!, 10, assignmentId);

          await addGenerationJob(
            {
              ...form,
              uploadedContent,
              assignmentId, // ensure assignmentId is in the payload
            },
            job.id!,
          );

          if (!isProduction && file) {
            const fs = await import("fs/promises");
            await fs.unlink(file.path).catch(() => undefined);
          } else if (isProduction) {
            const { UploadModel } = await import("./models/upload.model");
            await UploadModel.deleteOne({
              assignmentId: new mongoose.Types.ObjectId(assignmentId),
            });
          }

          return { success: true };
        } catch (error: any) {
          console.error(`❌ Extraction job ${job.id} failed:`, error);
          await updateAssignmentStatus(job.data.assignmentId, "failed");
          await emitFailed(
            job.id!,
            error.message || "Extraction failed",
            job.data.assignmentId,
          );
          throw error;
        }
      },
      { connection, concurrency: 3 },
    );

    // ========== PAPER GENERATION WORKER ==========
    const worker = new Worker<GenerationJobPayload>(
      config.queueName,
      async (job: Job<GenerationJobPayload>) => {
        console.log(`📥 Processing job ${job.id}`);

        const assignmentId = job.data.assignmentId; // ensure assignmentId is in the payload
        await emitProgress(job.id!, 10, assignmentId);

        try {
          const generatedPaper = await generatePaperWithFallback(
            job.data,
            (progress) => {
              emitProgress(job.id!, progress, assignmentId);
            },
          );

          const paperWithInstitution = {
            ...generatedPaper,
            institutionName: job.data.institutionName || undefined,
          };

          const paperDoc = await saveGeneratedPaper(
            job.data.assignmentId,
            job.id!,
            paperWithInstitution,
            job.data.userId,
          );

          await updateAssignmentStatus(
            job.data.assignmentId,
            "completed",
            paperDoc._id.toString(),
          );

          await emitCompleted(
            job.id!,
            paperDoc._id.toString(),
            generatedPaper,
            assignmentId,
          );

          return { success: true, paperId: paperDoc._id };
        } catch (error: any) {
          console.error(`❌ Job ${job.id} failed:`, error);
          await updateAssignmentStatus(job.data.assignmentId, "failed");
          await emitFailed(
            job.id!,
            error.message || "Generation failed",
            assignmentId,
          );
          throw error;
        }
      },
      { connection, concurrency: 5 },
    );

    console.log("👷 Worker started, listening for jobs...");

    // ========== PDF GENERATION WORKER ==========
    interface PdfJobPayload {
      paperId: string;
      assignmentId: string;
    }

    const pdfWorker = new Worker<PdfJobPayload>(
      "pdf-generation",
      async (job: Job<PdfJobPayload>) => {
        const { paperId, assignmentId } = job.data;
        console.log(`📄 Generating PDF for paper ${paperId}`);

        try {
          await connectDB();
          const { GeneratedPaperModel } =
            await import("./models/generated-paper.model");
          const paper = await GeneratedPaperModel.findById(paperId);
          if (!paper) throw new Error("Paper not found");

          const pdfBuffer = await generatePdf(paper.toObject());

          const isProduction =
            (process.env.NODE_ENV || "").trim() === "production";

          if (isProduction) {
            paper.pdfData = pdfBuffer;
            paper.pdfUrl = `/api/papers/${paper._id}/pdf`;
            await paper.save();

            await emitCompleted(
              job.id!,
              paper._id.toString(),
              {
                pdfUrl: paper.pdfUrl,
              },
              assignmentId,
            );
            console.log(`✅ PDF stored in MongoDB for paper ${paper._id}`);
          } else {
            const fs = await import("fs/promises");
            const path = await import("path");

            const pdfDir = path.resolve(__dirname, "../../../pdfs");
            await fs.mkdir(pdfDir, { recursive: true });

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const safeSubject = (paper.subject || "question-paper")
              .replace(/[^a-zA-Z0-9 ]/g, "")
              .replace(/\s+/g, "-")
              .toLowerCase();
            const pdfFilename = `${safeSubject}-${dateStr}.pdf`;
            const pdfPath = path.join(pdfDir, pdfFilename);

            await fs.writeFile(pdfPath, pdfBuffer);

            const pdfUrl = `/pdfs/${pdfFilename}`;
            paper.pdfUrl = pdfUrl;
            await paper.save();

            console.log(`Emitting completion for assignment ${assignmentId}`);

            await emitCompleted(
              job.id!,
              paper._id.toString(),
              { pdfUrl },
              assignmentId,
            );
            console.log(`✅ PDF saved: ${pdfPath}`);
          }
        } catch (error: any) {
          console.error("PDF generation failed:", error);
          await emitFailed(job.id!, error.message, assignmentId);
          throw error;
        }
      },
      { connection, concurrency: 1 },
    );

    console.log("👷 All workers started successfully");
  } catch (error) {
    console.error("❌ Failed to start workers:", error);
    process.exit(1);
  }
}

startWorkers();
