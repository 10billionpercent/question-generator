import { Queue } from "bullmq";
import { config } from "../config";
import { GenerationJobPayload } from "@veda/shared";

export interface ExtractionJobPayload {
  assignmentId: string;
  form: GenerationJobPayload;
  file?: {
    path: string;
    originalName: string;
    mimetype: string;
  };
}

const connection = { url: config.redisUri };

export const extractionQueue = new Queue<ExtractionJobPayload>(
  "file-extraction",
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    },
  },
);

export const addExtractionJob = async (payload: ExtractionJobPayload) => {
  const job = await extractionQueue.add("extract-file" as any, payload, {
    jobId: payload.assignmentId,
  });
  return job;
};
