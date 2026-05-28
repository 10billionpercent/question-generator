"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";

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

interface QuestionRow {
  id: string;
  type: string;
  numQuestions: number;
  marks: number;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const totalQuestions = questionRows.reduce((s, r) => s + r.numQuestions, 0);
  const totalMarks = questionRows.reduce(
    (s, r) => s + r.numQuestions * r.marks,
    0,
  );

  function addRow() {
    const usedTypes = questionRows.map((r) => r.type);
    const available = QUESTION_TYPE_OPTIONS.find((t) => !usedTypes.includes(t));
    if (!available) return;
    setQuestionRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: available,
        numQuestions: 1,
        marks: 1,
      },
    ]);
  }

  function removeRow(id: string) {
    setQuestionRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRow(
    id: string,
    field: "type" | "numQuestions" | "marks",
    value: string | number,
  ) {
    setQuestionRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
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
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleNext() {
    // TODO: submit to backend
    router.push("/assignments/created");
  }

  return (
    <>
      <TopBar title="Assignment" />

      <div className="create-page">
        <div className="create-header">
          <div className="create-header-title-row">
            <span className="create-status-dot" />
            <div>
              <h1 className="create-title">Create Assignment</h1>
              <p className="create-subtitle">
                Set up a new assignment for your students
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="progress-bar-wrap">
            <div className="progress-bar" />
          </div>
        </div>

        <div className="create-card">
          <h2 className="section-title">Assignment Details</h2>
          <p className="section-sub">Basic information about your assignment</p>

          {/* File Upload */}
          <div
            className={`file-upload ${dragOver ? "drag-over" : ""} ${uploadedFile ? "has-file" : ""}`}
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
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {uploadedFile ? (
              <div className="upload-success">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="upload-filename">{uploadedFile.name}</span>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </div>
                <p className="upload-main">
                  Choose a file or drag &amp; drop it here
                </p>
                <p className="upload-hint">JPEG, PNG, upto 10MB</p>
                <button
                  className="browse-btn"
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
          <p className="upload-caption">
            Upload images of your preferred document/image
          </p>

          {/* Due Date */}
          <div className="field-group">
            <label className="field-label">Due Date</label>
            <div className="date-input-wrap">
              <input
                type="text"
                className="date-input"
                placeholder="DD-MM-YYYY"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <button className="date-icon-btn" aria-label="Pick date">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="12" y1="2" x2="12" y2="6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Question Types table */}
          <div className="qt-section">
            <div className="qt-header-row">
              <span className="qt-col-type">Question Type</span>
              <span className="qt-col-num">No. of Questions</span>
              <span className="qt-col-marks">Marks</span>
            </div>

            {questionRows.map((row) => (
              <div key={row.id} className="qt-row">
                <div className="qt-type-wrap">
                  <select
                    className="qt-type-select"
                    value={row.type}
                    onChange={(e) => updateRow(row.id, "type", e.target.value)}
                  >
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="qt-select-arrow"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                <button
                  className="qt-remove-btn"
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <div className="qt-stepper">
                  <button
                    className="qt-step-btn"
                    onClick={() => decrement(row.id, "numQuestions")}
                  >
                    −
                  </button>
                  <span className="qt-step-val">{row.numQuestions}</span>
                  <button
                    className="qt-step-btn"
                    onClick={() => increment(row.id, "numQuestions")}
                  >
                    +
                  </button>
                </div>

                <div className="qt-stepper">
                  <button
                    className="qt-step-btn"
                    onClick={() => decrement(row.id, "marks")}
                  >
                    −
                  </button>
                  <span className="qt-step-val">{row.marks}</span>
                  <button
                    className="qt-step-btn"
                    onClick={() => increment(row.id, "marks")}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            {/* Add row */}
            <button className="qt-add-btn" onClick={addRow}>
              <span className="qt-add-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              Add Question Type
            </button>

            {/* Totals */}
            <div className="qt-totals">
              <span>
                Total Questions : <strong>{totalQuestions}</strong>
              </span>
              <span>
                Total Marks : <strong>{totalMarks}</strong>
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="field-group">
            <label className="field-label">
              Additional Information{" "}
              <span className="field-label-hint">(For better output)</span>
            </label>
            <div className="textarea-wrap">
              <textarea
                className="additional-textarea"
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
              <button className="mic-btn" aria-label="Voice input">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="create-nav">
          <button className="nav-prev-btn" onClick={() => router.back()}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Previous
          </button>
          <button className="nav-next-btn" onClick={handleNext}>
            Next
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .create-page {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .create-header {
          margin-bottom: 0;
        }

        .create-header-title-row {
          display: none;
        }

        .progress-bar-wrap {
          height: 5px;
          background: #e5e5e5;
          border-radius: 4px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          width: 55%;
          background: var(--text-primary);
          border-radius: 4px;
        }

        .create-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e5e5e5;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
          margin-bottom: 0;
        }

        .section-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: -18px;
        }

        /* ---- File Upload ---- */
        .file-upload {
          border: 2px dashed #d5d5d5;
          border-radius: 14px;
          padding: 36px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          background: #fafafa;
        }

        .file-upload:hover,
        .file-upload.drag-over {
          border-color: var(--color-brand);
          background: var(--color-brand-light);
        }

        .file-upload.has-file {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .upload-icon {
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }

        .upload-main {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .upload-hint {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .browse-btn {
          margin-top: 6px;
          background: white;
          border: 1px solid #d5d5d5;
          border-radius: 8px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font);
          color: var(--text-primary);
          cursor: pointer;
          transition: background 0.12s;
        }

        .browse-btn:hover {
          background: #f5f5f5;
        }

        .upload-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .upload-filename {
          font-size: 14px;
          font-weight: 600;
          color: #16a34a;
        }

        .upload-caption {
          font-size: 12px;
          color: var(--text-tertiary);
          text-align: center;
          margin-top: -16px;
        }

        /* ---- Due Date ---- */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .field-label-hint {
          font-weight: 400;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .date-input-wrap {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
        }

        .date-input {
          flex: 1;
          border: none;
          padding: 13px 16px;
          font-size: 14px;
          color: var(--text-tertiary);
          font-family: var(--font);
          background: transparent;
        }

        .date-icon-btn {
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        /* ---- Question Type table ---- */
        .qt-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .qt-header-row {
          display: grid;
          grid-template-columns: 1fr 130px 100px;
          gap: 8px;
          padding: 0 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .qt-col-type { grid-column: 1; }
        .qt-col-num { text-align: center; }
        .qt-col-marks { text-align: center; }

        .qt-row {
          display: grid;
          grid-template-columns: 1fr 28px 130px 100px;
          gap: 8px;
          align-items: center;
        }

        .qt-type-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .qt-type-select {
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 11px 36px 11px 14px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font);
          color: var(--text-primary);
          background: white;
          cursor: pointer;
        }

        .qt-select-arrow {
          position: absolute;
          right: 12px;
          color: var(--text-secondary);
          pointer-events: none;
        }

        .qt-remove-btn {
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: background 0.12s, color 0.12s;
        }

        .qt-remove-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .qt-stepper {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          background: white;
        }

        .qt-step-btn {
          width: 34px;
          height: 40px;
          background: transparent;
          border: none;
          font-size: 18px;
          font-weight: 400;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.1s;
          flex-shrink: 0;
        }

        .qt-step-btn:hover {
          background: #f5f5f5;
        }

        .qt-step-val {
          flex: 1;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          border-left: 1px solid #e5e5e5;
          border-right: 1px solid #e5e5e5;
          min-width: 28px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qt-add-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font);
          color: var(--text-primary);
          cursor: pointer;
          padding: 4px 0;
          width: fit-content;
        }

        .qt-add-icon {
          width: 32px;
          height: 32px;
          background: var(--text-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .qt-totals {
          display: flex;
          justify-content: flex-end;
          gap: 24px;
          font-size: 14px;
          color: var(--text-secondary);
          padding-top: 4px;
        }

        .qt-totals strong {
          color: var(--text-primary);
        }

        /* ---- Additional Info ---- */
        .textarea-wrap {
          position: relative;
        }

        .additional-textarea {
          width: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 14px 48px 14px 16px;
          font-size: 13px;
          color: var(--text-primary);
          font-family: var(--font);
          resize: none;
          background: white;
          line-height: 1.6;
        }

        .additional-textarea::placeholder {
          color: var(--text-tertiary);
        }

        .mic-btn {
          position: absolute;
          bottom: 12px;
          right: 14px;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.12s;
        }

        .mic-btn:hover {
          background: #f0f0f0;
        }

        /* ---- Nav Buttons ---- */
        .create-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
        }

        .nav-prev-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1.5px solid #d5d5d5;
          border-radius: 50px;
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font);
          color: var(--text-primary);
          cursor: pointer;
          transition: background 0.12s;
        }

        .nav-prev-btn:hover {
          background: #f5f5f5;
        }

        .nav-next-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--text-primary);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 28px;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font);
          cursor: pointer;
          transition: background 0.12s;
        }

        .nav-next-btn:hover {
          background: #222;
        }

        @media (max-width: 768px) {
          .create-card {
            padding: 20px 16px;
            gap: 18px;
          }

          .qt-header-row {
            display: none;
          }

          .qt-row {
            grid-template-columns: 1fr 28px;
            grid-template-rows: auto auto;
            gap: 8px;
          }

          .qt-type-wrap {
            grid-column: 1;
          }

          .qt-remove-btn {
            grid-column: 2;
            grid-row: 1;
          }

          .qt-stepper:first-of-type {
            grid-column: 1;
            grid-row: 2;
          }

          .qt-stepper:last-of-type {
            grid-column: 2 / span 1;
            grid-row: 2;
          }

          /* Mobile: show label above each stepper */
          .qt-row::before {
            content: 'No. of Questions';
            font-size: 12px;
            font-weight: 700;
            color: var(--text-secondary);
            grid-column: 1;
            grid-row: 2;
          }
        }
      `}</style>
    </>
  );
}
