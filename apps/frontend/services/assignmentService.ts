const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface AssignmentFormData {
  title: string;
  questionTypes: string[]; // e.g., ["mcq", "short-answer"]
  totalQuestions: number;
  marksPerQuestion: number;
  institutionName?: string;
  studyMaterialUrl?: string; // optional – if you prefer URL instead of file
  dueDate?: string; // ISO datetime
  additionalInstructions?: string;
  difficultyPreference?: "easy" | "medium" | "hard";
  classLevel?: string;
}

export interface UploadResponse {
  message: string;
  jobId: string;
  assignmentId: string;
}

/**
 * Create an assignment with an uploaded file (PDF / text).
 * Uses multipart/form-data.
 */
export async function createAssignmentWithFile(
  formData: AssignmentFormData,
  file: File,
): Promise<UploadResponse> {
  const fd = new FormData();

  // Append all text fields
  Object.entries(formData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "questionTypes" && Array.isArray(value)) {
      // Send each type as separate field with array notation – matches curl
      value.forEach((type) => {
        fd.append(`${key}[]`, type);
      });
    } else {
      fd.append(key, String(value));
    }
  });

  fd.append("file", file);

  const res = await fetch(`${API_BASE}/api/generation/upload`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function createAssignmentJson(
  formData: AssignmentFormData,
): Promise<{ jobId: string; assignmentId: string }> {
  const res = await fetch(`${API_BASE}/api/generation/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generatePDF(
  paperId: string,
): Promise<{ message: string; jobId: string }> {
  const res = await fetch(`${API_BASE}/api/papers/${paperId}/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}
