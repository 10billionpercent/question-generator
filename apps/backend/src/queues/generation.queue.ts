import { Queue } from "bullmq";
import { config } from "../config";
import { GenerationJobPayload } from "@veda/shared";

// Use an object with `url` instead of plain string
const connection = { url: config.redisUri };

export const generationQueue = new Queue<GenerationJobPayload>(
  config.queueName,
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    },
  },
);

export const addGenerationJob = async (
  payload: GenerationJobPayload,
  assignmentId?: string,
) => {
  const opts: any = {};
  if (assignmentId) opts.jobId = assignmentId;

  // Use explicit job name (TypeScript sometimes infers the wrong type)
  const job = await generationQueue.add("generate-paper" as any, payload, opts);
  return job;
};
