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

const connection = { url: config.redisUri };

const worker = new Worker<GenerationJobPayload>(
  config.queueName,
  async (job: Job<GenerationJobPayload>) => {
    console.log(`📥 Processing job ${job.id}`);

    // Emit progress
    await emitProgress(job.id!, 10);

    try {
      const generatedPaper = await generatePaperWithFallback(
        job.data,
        (progress) => {
          emitProgress(job.id!, progress);
        },
      );

      // Save to MongoDB
      const paperDoc = await saveGeneratedPaper(
        job.data.assignmentId,
        job.id!,
        generatedPaper,
      );

      // Update assignment status
      await updateAssignmentStatus(
        job.data.assignmentId,
        "completed",
        paperDoc._id.toString(),
      );

      // Emit completion
      await emitCompleted(job.id!, paperDoc._id.toString(), generatedPaper);

      return { success: true, paperId: paperDoc._id };
    } catch (error: any) {
      console.error(`❌ Job ${job.id} failed:`, error);
      await updateAssignmentStatus(job.data.assignmentId, "failed");
      await emitFailed(job.id!, error.message || "Generation failed");
      throw error; // retry?
    }
  },
  { connection, concurrency: 5 },
);

console.log("👷 Worker started, listening for jobs...");

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

      const fs = await import("fs/promises");
      const path = await import("path");

      // Save to project root /pdfs
      const pdfDir = path.resolve(__dirname, "../../../pdfs");
      await fs.mkdir(pdfDir, { recursive: true });

      // Generate a clean, human‑readable filename (subject + date)
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const safeSubject = (paper.subject || "question-paper")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      const pdfFilename = `${safeSubject}-${dateStr}.pdf`;

      const pdfPath = path.join(pdfDir, pdfFilename);
      await fs.writeFile(pdfPath, pdfBuffer);

      // Update paper document
      const pdfUrl = `/pdfs/${pdfFilename}`;
      paper.pdfUrl = pdfUrl;
      await paper.save();

      await emitCompleted(job.id!, paper._id.toString(), { pdfUrl });
      console.log(`✅ PDF saved: ${pdfPath}`);
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      await emitFailed(job.id!, error.message);
      throw error;
    }
  },
  { connection, concurrency: 3 },
);
