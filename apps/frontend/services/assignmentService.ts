const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface QuestionBreakdownItem {
  type: string; // e.g., "mcq", "short-answer"
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  classLevel: string;
  institutionName?: string;
  questionBreakdown: QuestionBreakdownItem[];
  additionalInstructions?: string;
  dueDate?: string; // ISO datetime
  difficultyPreference?: "easy" | "medium" | "hard";
}

export interface UploadResponse {
  message: string;
  jobId: string;
  assignmentId: string;
}

/**
 * Create an assignment with an uploaded file (PDF / text).
 * Sends multipart/form-data matching the curl example:
 * - file
 * - title
 * - classLevel
 * - institutionName
 * - questionBreakdown[0][type]=mcq
 * - questionBreakdown[0][count]=3
 * - questionBreakdown[0][marks]=1
 * - etc.
 */
export async function createAssignmentWithFile(
  formData: AssignmentFormData,
  file: File,
): Promise<UploadResponse> {
  const fd = new FormData();

  // Basic fields
  fd.append("title", formData.title);
  fd.append("classLevel", formData.classLevel);
  if (formData.institutionName)
    fd.append("institutionName", formData.institutionName);
  if (formData.additionalInstructions)
    fd.append("additionalInstructions", formData.additionalInstructions);
  if (formData.dueDate) fd.append("dueDate", formData.dueDate);
  if (formData.difficultyPreference)
    fd.append("difficultyPreference", formData.difficultyPreference);

  // Question breakdown – send as array of objects with indexed fields
  formData.questionBreakdown.forEach((item, idx) => {
    fd.append(`questionBreakdown[${idx}][type]`, item.type);
    fd.append(`questionBreakdown[${idx}][count]`, String(item.count));
    fd.append(`questionBreakdown[${idx}][marks]`, String(item.marks));
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

export async function generatePDF(
  paperId: string,
): Promise<{ message: string; jobId: string }> {
  const res = await fetch(`${API_BASE}/api/papers/${paperId}/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}
