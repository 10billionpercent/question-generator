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

// ========== FILE EXTRACTION WORKER ==========
interface ExtractionJobPayload {
  assignmentId: string;
  form: GenerationJobPayload;
  file?: {
    path: string; // only in dev
    originalName: string;
    mimetype: string;
  };
}

const extractionWorker = new Worker<ExtractionJobPayload>(
  "file-extraction",
  async (job: Job<ExtractionJobPayload>) => {
    console.log(`📂 Processing extraction job ${job.id}`);

    await emitProgress(job.id!, 5);

    try {
      await connectDB();

      const { assignmentId, form, file } = job.data;
      let uploadedContent: string | undefined;
      const isProduction = (process.env.NODE_ENV || "").trim() === "production";

      if (isProduction) {
        // Production: read file buffer from MongoDB
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
        // Development: read from disk (file path provided)
        if (!file) throw new Error("No file provided for extraction");
        uploadedContent = await extractText(
          file.path,
          file.mimetype,
          file.originalName,
        );
      }

      await emitProgress(job.id!, 10);

      // Enqueue the actual generation job
      await addGenerationJob(
        {
          ...form,
          uploadedContent,
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
      await emitFailed(job.id!, error.message || "Extraction failed");
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

    await emitProgress(job.id!, 10);

    try {
      const generatedPaper = await generatePaperWithFallback(
        job.data,
        (progress) => {
          emitProgress(job.id!, progress);
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

      await emitCompleted(job.id!, paperDoc._id.toString(), generatedPaper);

      return { success: true, paperId: paperDoc._id };
    } catch (error: any) {
      console.error(`❌ Job ${job.id} failed:`, error);
      await updateAssignmentStatus(job.data.assignmentId, "failed");
      await emitFailed(job.id!, error.message || "Generation failed");
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

      const isProduction = (process.env.NODE_ENV || "").trim() === "production";

      if (isProduction) {
        // Store PDF in MongoDB
        paper.pdfData = pdfBuffer;
        paper.pdfUrl = `/api/papers/${paper._id}/pdf`;
        await paper.save();

        await emitCompleted(job.id!, paper._id.toString(), {
          pdfUrl: paper.pdfUrl,
        });
        console.log(`✅ PDF stored in MongoDB for paper ${paper._id}`);
      } else {
        // Local file system (dev)
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

        await emitCompleted(job.id!, paper._id.toString(), { pdfUrl });
        console.log(`✅ PDF saved: ${pdfPath}`);
      }
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      await emitFailed(job.id!, error.message);
      throw error;
    }
  },
  { connection, concurrency: 3 },
);
