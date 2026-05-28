import { publishEvent } from "./redis-pub";

export const emitProgress = (
  jobId: string,
  progress: number,
  assignmentId?: string,
) =>
  publishEvent("generation-updates", {
    type: "generation_progress",
    jobId,
    progress,
    assignmentId,
  });

export const emitCompleted = (
  jobId: string,
  paperId: string,
  paper: any,
  assignmentId?: string,
) =>
  publishEvent("generation-updates", {
    type: "generation_completed",
    jobId,
    paperId,
    paper,
    assignmentId,
  });

export const emitFailed = (
  jobId: string,
  error: string,
  assignmentId?: string,
) =>
  publishEvent("generation-updates", {
    type: "generation_failed",
    jobId,
    error,
    assignmentId,
  });
