export interface ServerToClientEvents {
  generation_started: (data: { jobId: string }) => void;
  generation_progress: (data: { jobId: string; progress: number }) => void;
  generation_completed: (data: {
    jobId: string;
    paperId: string;
    paper: any;
  }) => void;
  generation_failed: (data: { jobId: string; error: string }) => void;
}

export interface ClientToServerEvents {
  subscribe_to_job: (jobId: string) => void;
}
