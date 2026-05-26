import { Queue } from "bullmq";
import { config } from "../config";

interface PdfJobPayload {
  paperId: string;
  assignmentId: string;
}

const connection = { url: config.redisUri };

export const pdfQueue = new Queue<PdfJobPayload>("pdf-generation", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 5000 },
  },
});

export const addPdfJob = async (payload: PdfJobPayload) => {
  const job = await pdfQueue.add("generate-pdf" as any, payload);
  return job;
};
