"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import TopBar from "@/components/TopBar";
import {
  createAssignmentWithFile,
  UploadResponse,
  AssignmentFormData,
} from "@/services/assignmentService";
import { GeneratedPaper } from "@veda/shared";
import { useUserStore } from "@/stores/userStore";
import styles from "./createAssignmentPage.module.css";
import DatePicker from "@/components/DatePicker";

// Socket event types
interface GenerationProgressEvent {
  type: "generation_progress";
  jobId: string;
  progress: number;
  stage?: "extracting" | "generating" | "pdf";
  message?: string;
  assignmentId: string;
}

interface GenerationCompletedEvent {
  type: "generation_completed";
  jobId: string;
  paperId: string;
  paper?: GeneratedPaper;
  pdfUrl?: string;
  assignmentId: string;
}

interface GenerationFailedEvent {
  type: "generation_failed";
  jobId: string;
  error: string;
  assignmentId: string;
}

interface GenerationStartedEvent {
  type: "generation_started";
  jobId: string;
  assignmentId: string;
}

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Fill in the Blanks",
  "True/False",
  "Match the Following",
];

const typeMapping: Record<string, string> = {
  "Multiple Choice Questions": "mcq",
  "Short Questions": "short-answer",
  "Long Questions": "long-answer",
  "Diagram/Graph-Based Questions": "diagram-graph",
  "Numerical Problems": "numerical",
  "Fill in the Blanks": "fill-blanks",
  "True/False": "true-false",
  "Match the Following": "mcq",
};

interface QuestionRow {
  id: string;
  type: string;
  numQuestions: number;
  marks: number;
}

type GenerationStatus =
  | "idle"
  | "uploading"
  | "extracting"
  | "generating"
  | "pdf"
  | "completed"
  | "failed";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUserStore(); // get user data for institution name

  // Form states
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [classLevel, setClassLevel] = useState("");

  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { id: "1", type: "Multiple Choice Questions", numQuestions: 4, marks: 1 },
    { id: "2", type: "Short Questions", numQuestions: 3, marks: 2 },
    {
      id: "3",
      type: "Diagram/Graph-Based Questions",
      numQuestions: 5,
      marks: 5,
    },
    { id: "4", type: "Numerical Problems", numQuestions: 5, marks: 5 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progressMessage, setProgressMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const totalQuestions = questionRows.reduce((s, r) => s + r.numQuestions, 0);
  const totalMarks = questionRows.reduce(
    (s, r) => s + r.numQuestions * r.marks,
    0,
  );

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  function addRow() {
    const usedTypes = questionRows.map((r) => r.type);
    const available = QUESTION_TYPE_OPTIONS.find((t) => !usedTypes.includes(t));
    if (!available) return;
    setQuestionRows((prev) => [
      ...prev,
      { id: Date.now().toString(), type: available, numQuestions: 1, marks: 1 },
    ]);
  }

  function removeRow(id: string) {
    setQuestionRows((prev) => prev.filter((r) => r.id !== id));
  }

  function increment(id: string, field: "numQuestions" | "marks") {
    setQuestionRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: r[field] + 1 } : r)),
    );
  }

  function decrement(id: string, field: "numQuestions" | "marks") {
    setQuestionRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, [field]: Math.max(1, r[field] - 1) } : r,
      ),
    );
  }

  function handleFile(file: File) {
    setUploadedFile(file);
    setErrorMsg("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function buildFormData(): { formData: AssignmentFormData; file: File } {
    if (!uploadedFile) {
      throw new Error("Please upload a file");
    }

    // Map UI rows to questionBreakdown array
    const questionBreakdown = questionRows.map((row) => ({
      type: typeMapping[row.type] || "mcq",
      count: row.numQuestions,
      marks: row.marks,
    }));

    const formPayload: AssignmentFormData = {
      title: assignmentTitle.trim() || "Untitled Assignment",
      classLevel: classLevel.trim() || "General",
      institutionName: user?.institutionName || "VedaAI",
      questionBreakdown,
      additionalInstructions: additionalInfo || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      difficultyPreference: "medium",
    };

    return { formData: formPayload, file: uploadedFile };
  }

  async function handleNext() {
    if (!uploadedFile) {
      setErrorMsg("Please upload a study material file.");
      return;
    }
    if (totalQuestions === 0) {
      setErrorMsg("At least one question is required.");
      return;
    }

    setIsSubmitting(true);
    setStatus("uploading");
    setProgressMessage("Uploading file and creating assignment...");
    setErrorMsg("");

    try {
      const { formData, file } = buildFormData();
      const response: UploadResponse = await createAssignmentWithFile(
        formData,
        file,
      );
      const { assignmentId } = response;
      console.log("Assignment created:", assignmentId);

      const socketUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const socket = io(socketUrl);
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected, subscribing to", assignmentId);
        socket.emit("subscribe_to_assignment", assignmentId);
      });

      socket.on("generation_progress", (data: GenerationProgressEvent) => {
        console.log("Progress:", data);
        setProgressMessage(data.message || "Processing...");
        setProgressPercent(data.progress || 0);
        if (data.stage === "extracting") setStatus("extracting");
        else if (data.stage === "generating") setStatus("generating");
        else if (data.stage === "pdf") setStatus("pdf");
      });

      socket.on("generation_completed", (data: GenerationCompletedEvent) => {
        console.log(
          "🔔 generation_completed FULL DATA:",
          JSON.stringify(data, null, 2),
        );
        const idToUse = data.assignmentId;
        console.log("Redirecting with ASSIGNMENT ID:", idToUse);
        setStatus("completed");
        setProgressMessage("Assignment generated successfully!");
        setPdfUrl(data.paper?.pdfUrl || data.pdfUrl || null);
        setIsSubmitting(false);
        router.push(`/assignments/created?paperId=${idToUse}`);
      });

      socket.on("generation_failed", (data: GenerationFailedEvent) => {
        console.error("Generation failed:", data.error);
        setStatus("failed");
        setErrorMsg(data.error || "Generation failed. Please try again.");
        setIsSubmitting(false);
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      socket.on("generation_started", (_: GenerationStartedEvent) => {
        setStatus("extracting");
        setProgressMessage("Extracting text from file...");
      });

      const timeout = setTimeout(() => {
        if (status !== "completed" && isSubmitting) {
          setErrorMsg(
            "Request timed out. Please check your network and try again.",
          );
          setIsSubmitting(false);
          setStatus("failed");
        }
      }, 120000);

      const cleanup = () => clearTimeout(timeout);
      socket.once("generation_completed", cleanup);
      socket.once("generation_failed", cleanup);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create assignment. Check console.";
      setErrorMsg(message);
      setIsSubmitting(false);
      setStatus("failed");
    }
  }

  function handleDownload() {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  }

  function handleGoToAssignments() {
    router.push("/");
  }

  return (
    <>
      <TopBar title="Assignment" />
      <div className={styles["create-page"]}>
        <div className={styles["create-header"]}>
          <div className={styles["create-header-title-row"]}>
            <span className={styles["create-status-dot"]} />
            <div>
              <h1 className={styles["create-title"]}>Create Assignment</h1>
              <p className={styles["create-subtitle"]}>
                Set up a new assignment for your students
              </p>
            </div>
          </div>
          <div className={styles["progress-bar-wrap"]}>
            <div className={styles["progress-bar"]} />
          </div>
        </div>

        <div className={styles["create-card"]}>
          <h2 className={styles["section-title"]}>Assignment Details</h2>
          <p className={styles["section-sub"]}>
            Basic information about your assignment
          </p>

          {/* Title input */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>Assignment Title</label>
            <input
              type="text"
              className={styles["text-input"]}
              placeholder="e.g., Cloud Computing Quiz"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
            />
          </div>

          {/* Class Level input */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>Class / Level</label>
            <input
              type="text"
              className={styles["text-input"]}
              placeholder="e.g., BE 6th Sem, Grade 10, etc."
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div
            className={`${styles["file-upload"]} ${dragOver ? styles["drag-over"] : ""} ${uploadedFile ? styles["has-file"] : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {uploadedFile ? (
              <div className={styles["upload-success"]}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className={styles["upload-filename"]}>
                  {uploadedFile.name}
                </span>
              </div>
            ) : (
              <>
                <div className={styles["upload-icon"]}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </div>
                <p className={styles["upload-main"]}>
                  Choose a file or drag &amp; drop it here
                </p>
                <p className={styles["upload-hint"]}>
                  PDF and TXT up to 10MB
                </p>
                <button
                  className={styles["browse-btn"]}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
          <p className={styles["upload-caption"]}>
            Upload study material (PDF or text)
          </p>

          {/* Due Date */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>Due Date</label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="DD-MM-YYYY"
            />
          </div>

          {/* Question Types table */}
          <div className={styles["qt-section"]}>
            <div className={styles["qt-header"]}>
              <span>Question Type</span>
            </div>
            {questionRows.map((row) => (
              <div key={row.id} className={styles["qt-row"]}>
                <div className={styles["qt-row-header"]}>
                  <p className={styles["qt-type-text"]}>{row.type}</p>
                </div>
                <div className={styles["qt-controls"]}>
                  <div className={styles["qt-stepper-group"]}>
                    <label>No. of Questions</label>
                    <div className={styles["qt-stepper"]}>
                      <button
                        type="button"
                        onClick={() => decrement(row.id, "numQuestions")}
                      >
                        −
                      </button>
                      <span>{row.numQuestions}</span>
                      <button
                        type="button"
                        onClick={() => increment(row.id, "numQuestions")}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={styles["qt-stepper-group"]}>
                    <label>Marks</label>
                    <div className={styles["qt-stepper"]}>
                      <button
                        type="button"
                        onClick={() => decrement(row.id, "marks")}
                      >
                        −
                      </button>
                      <span>{row.marks}</span>
                      <button
                        type="button"
                        onClick={() => increment(row.id, "marks")}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className={styles["qt-remove-btn"]}
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button className={styles["qt-add-btn"]} onClick={addRow}>
              <span className={styles["qt-add-icon"]}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              Add Question Type
            </button>
            <div className={styles["qt-totals"]}>
              <span>
                Total Questions : <strong>{totalQuestions}</strong>
              </span>
              <span>
                Total Marks : <strong>{totalMarks}</strong>
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>
              Additional Information{" "}
              <span className={styles["field-label-hint"]}>
                (For better output)
              </span>
            </label>
            <div className={styles["textarea-wrap"]}>
              <textarea
                className={styles["additional-textarea"]}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
              <button className={styles["mic-btn"]} aria-label="Voice input">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          {isSubmitting && (
            <div className={styles["status-card"]}>
              {progressPercent > 0 && (
                <div className={styles["progress-container"]}>
                  <div
                    className={styles["progress-bar-fill"]}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
              <div className={styles["status-text"]}>
                <strong>{progressMessage}</strong>
                <span className={styles["status-stage"]}>
                  {status} ({progressPercent}%)
                </span>
              </div>
            </div>
          )}
          {errorMsg && (
            <div className={styles["error-message"]}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
            </div>
          )}
          {status === "completed" && pdfUrl && (
            <div className={styles["success-card"]}>
              <p>✅ Assignment generated successfully!</p>
              <div className={styles["success-buttons"]}>
                <button
                  onClick={handleDownload}
                  className={styles["download-btn"]}
                >
                  📄 Download PDF
                </button>
                <button
                  onClick={handleGoToAssignments}
                  className={styles["dashboard-btn"]}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {status !== "completed" && (
          <div className={styles["create-nav"]}>
            <button
              className={styles["nav-prev-btn"]}
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Previous
            </button>
            <button
              className={styles["nav-next-btn"]}
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Next"}
              {!isSubmitting && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
