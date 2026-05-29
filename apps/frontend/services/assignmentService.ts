// services/assignmentService.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface QuestionBreakdownItem {
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  classLevel: string;
  institutionName?: string;
  questionBreakdown: QuestionBreakdownItem[];
  additionalInstructions?: string;
  dueDate?: string;
  difficultyPreference?: "easy" | "medium" | "hard";
}

export interface UploadResponse {
  message: string;
  jobId: string;
  assignmentId: string;
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function createAssignmentWithFile(
  formData: AssignmentFormData,
  file: File,
): Promise<UploadResponse> {
  const token = getToken();
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

  // Question breakdown
  formData.questionBreakdown.forEach((item, idx) => {
    fd.append(`questionBreakdown[${idx}][type]`, item.type);
    fd.append(`questionBreakdown[${idx}][count]`, String(item.count));
    fd.append(`questionBreakdown[${idx}][marks]`, String(item.marks));
  });

  fd.append("file", file);

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/generation/upload`, {
    method: "POST",
    headers,
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
  const token = getToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/papers/${paperId}/pdf`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Add this function to assignmentService.ts (after generatePDF)
export async function deleteAssignment(
  assignmentId: string,
): Promise<{ message: string }> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  const res = await fetch(`${API_BASE}/api/assignments/${assignmentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Delete failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}
