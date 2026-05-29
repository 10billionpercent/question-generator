"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import TopBar from "@/components/TopBar";
import { Star } from "lucide-react";
import { generatePDF } from "@/services/assignmentService";
import styles from "./createdAssignment.module.css";

// Interfaces unchanged
interface QuestionOption {
  label: string;
  text: string;
}

interface Question {
  text: string;
  difficulty: string;
  marks: number;
  answerHint?: string;
  options?: QuestionOption[];
}

interface Section {
  title: string;
  type: string;
  instruction: string;
  questions: Question[];
}

interface GeneratedPaper {
  _id: string;
  subject: string;
  classLevel: string;
  timeAllowed: string;
  maxMarks: number;
  compulsoryNote: string;
  sections: Section[];
  institutionName?: string;
  pdfUrl?: string;
}

interface GenerationCompletedEvent {
  type: "generation_completed";
  jobId: string;
  paperId: string;
  assignmentId: string;
  pdfUrl?: string;
}

interface GenerationFailedEvent {
  type: "generation_failed";
  jobId: string;
  error: string;
  assignmentId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const renderDifficultyStars = (difficulty: string) => {
  const diffLower = difficulty.toLowerCase();
  let starCount = 1;
  if (diffLower === "medium") starCount = 2;
  else if (diffLower === "hard" || diffLower === "difficult") starCount = 3;
  return Array.from({ length: starCount }).map((_, i) => (
    <Star
      key={i}
      size={14}
      className="difficulty-star"
      fill="currentColor"
      stroke="none"
    />
  ));
};

function CreatedAssignmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paperId = searchParams.get("paperId");

  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Fetch paper data
  useEffect(() => {
    if (!paperId) {
      setError("No paper ID provided");
      setLoading(false);
      return;
    }

    let retries = 0;
    const maxRetries = 5;
    const retryDelay = 1000;

    const fetchPaper = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/papers/${paperId}`);
        if (res.status === 404 && retries < maxRetries) {
          retries++;
          console.log(`Paper not found, retry ${retries}/${maxRetries}...`);
          setTimeout(fetchPaper, retryDelay);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPaper(data);
        setLoading(false);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load paper";
        setError(message);
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId]);

  // Socket for PDF generation updates
  useEffect(() => {
    if (!paperId || loading) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected in created page, subscribing to", paperId);
      socket.emit("subscribe_to_assignment", paperId);
    });

    socket.on(
      "generation_completed",
      async (data: GenerationCompletedEvent) => {
        console.log("Received generation_completed in created page:", data);
        if (data.assignmentId === paperId) {
          try {
            const res = await fetch(`${API_BASE}/api/papers/${paperId}`);
            if (res.ok) {
              const updatedPaper = await res.json();
              setPaper(updatedPaper);
              setPdfGenerating(false);
              if (updatedPaper.pdfUrl) {
                const url = updatedPaper.pdfUrl.startsWith("http")
                  ? updatedPaper.pdfUrl
                  : `${API_BASE}${updatedPaper.pdfUrl}`;
                window.open(url, "_blank");
              }
            }
          } catch (err) {
            console.error("Failed to refetch paper after PDF generation", err);
          }
        }
      },
    );

    socket.on("generation_failed", (data: GenerationFailedEvent) => {
      if (data.assignmentId === paperId) {
        console.error("PDF generation failed", data.error);
        setPdfGenerating(false);
        alert("PDF generation failed. Please try again.");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [paperId, loading]);

  const handleDownload = async () => {
    if (!paperId) return;

    if (paper?.pdfUrl) {
      const url = paper.pdfUrl.startsWith("http")
        ? paper.pdfUrl
        : `${API_BASE}${paper.pdfUrl}`;
      window.open(url, "_blank");
      return;
    }

    if (pdfGenerating) {
      alert("PDF is already being generated. Please wait...");
      return;
    }

    setPdfGenerating(true);
    try {
      await generatePDF(paperId);
      console.log("PDF generation job started");
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to start PDF generation";
      alert(message);
      setPdfGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!paperId) return;
    setRegenerating(true);
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(
        `${API_BASE}/api/assignments/${paperId}/regenerate`,
        {
          method: "POST",
          headers,
        },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Regeneration failed");
      }
      console.log("Regeneration started");
      alert("Regeneration started. The new version will appear shortly.");
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to start regeneration";
      alert(message);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Create New" showBack={false} />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your assignment...</p>
        </div>
      </>
    );
  }

  if (error || !paper) {
    return (
      <>
        <TopBar title="Create New" showBack={false} />
        <div className={styles.errorContainer}>
          <p>❌ {error || "Paper not found"}</p>
          <button onClick={() => router.push("/")}>Go to Dashboard</button>
        </div>
      </>
    );
  }

  const aiMessage = `Here is your generated question paper for ${paper.subject} (${paper.classLevel}).`;

  return (
    <>
      <TopBar title="Create New" showBack={false} />

      <div className={styles.homePage}>
        <div className={styles.aiBanner}>
          <p className={styles.aiBannerText}>{aiMessage}</p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.downloadBtn}
              onClick={handleDownload}
              disabled={pdfGenerating}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {pdfGenerating ? "Generating PDF..." : "Download as PDF"}
            </button>
            <button
              className={`${styles.downloadBtn} ${styles.regenerateBtn}`}
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
              </svg>
              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        </div>

        <div className={styles.paperPreview}>
          <div className={styles.paperHeader}>
            <h1 className={styles.paperInstitution}>
              {paper.institutionName || "VedaAI Institute"}
            </h1>
            <p className={styles.paperSubject}>Subject: {paper.subject}</p>
            <p className={styles.paperClass}>Class: {paper.classLevel}</p>
          </div>

          <div className={styles.paperMetaRow}>
            <span className={styles.paperTime}>
              Time Allowed: {paper.timeAllowed}
            </span>
            <span className={styles.paperMarks}>
              Maximum Marks: {paper.maxMarks}
            </span>
          </div>

          <p className={styles.paperNote}>{paper.compulsoryNote}</p>

          <div className={styles.paperStudentInfo}>
            <p>
              Name:{" "}
              <span className={styles.paperBlank}>______________________</span>
            </p>
            <p>
              Roll Number:{" "}
              <span className={styles.paperBlank}>________________</span>
            </p>
            <p>
              Class: {paper.classLevel} Section:{" "}
              <span className={styles.paperBlank}>__________</span>
            </p>
          </div>

          {paper.sections.map((section, idx) => (
            <div key={idx} className={styles.paperSection}>
              <h2 className={styles.paperSectionName}>{section.title}</h2>
              <p className={styles.paperSectionType}>{section.type}</p>
              <p className={styles.paperSectionInstruction}>
                {section.instruction}
              </p>
              <ol className={styles.paperQuestions}>
                {section.questions.map((q, qIdx) => (
                  <li key={qIdx} className={styles.paperQuestion}>
                    <span className={styles.paperDifficulty}>
                      {renderDifficultyStars(q.difficulty)}
                    </span>{" "}
                    {q.text}{" "}
                    <span className={styles.paperQmarks}>
                      [{q.marks} Marks]
                    </span>
                    {q.options && q.options.length > 0 && (
                      <div className={styles.paperOptions}>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className={styles.paperOption}>
                            {opt.label}) {opt.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <p className={styles.paperEnd}>End of Question Paper</p>

          <div className={styles.paperAnswerKey}>
            <h3 className={styles.paperAkTitle}>Answer Key:</h3>
            <ol className={styles.paperAnswers}>
              {paper.sections.flatMap((section) =>
                section.questions.map((q, idx) => (
                  <li key={idx} className={styles.paperAnswer}>
                    {q.answerHint || "No hint provided"}
                  </li>
                )),
              )}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <TopBar title="Create New" showBack={false} />
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your assignment...</p>
      </div>
    </>
  );
}

export default function CreatedAssignmentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreatedAssignmentContent />
    </Suspense>
  );
}
