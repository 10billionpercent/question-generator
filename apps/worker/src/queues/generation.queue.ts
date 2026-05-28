import { Queue } from "bullmq";
import { config } from "../config";
import { GenerationJobPayload } from "@veda/shared";

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
  jobId?: string,
) => {
  const opts: any = {};
  if (jobId) opts.jobId = jobId;

  const job = await generationQueue.add("generate-paper" as any, payload, opts);
  return job;
};
