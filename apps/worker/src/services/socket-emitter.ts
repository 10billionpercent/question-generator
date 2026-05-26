import { publishEvent } from "./redis-pub";

export const emitProgress = (jobId: string, progress: number) =>
  publishEvent("generation-updates", {
    type: "generation_progress",
    jobId,
    progress,
  });

export const emitCompleted = (jobId: string, paperId: string, paper: any) =>
  publishEvent("generation-updates", {
    type: "generation_completed",
    jobId,
    paperId,
    paper,
  });

export const emitFailed = (jobId: string, error: string) =>
  publishEvent("generation-updates", {
    type: "generation_failed",
    jobId,
    error,
  });
