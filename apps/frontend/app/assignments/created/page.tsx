"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import TopBar from "@/components/TopBar";
import { Star } from "lucide-react";
import { generatePDF } from "@/services/assignmentService";

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
      // Reload after a short delay to show the updated paper
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
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your assignment...</p>
        </div>
        <style>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 16px; }
          .spinner { width: 40px; height: 40px; border: 4px solid #e5e5e5; border-top-color: var(--color-brand); border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </>
    );
  }

  if (error || !paper) {
    return (
      <>
        <TopBar title="Create New" showBack={false} />
        <div className="error-container">
          <p>❌ {error || "Paper not found"}</p>
          <button onClick={() => router.push("/")}>Go to Dashboard</button>
        </div>
        <style>{`
          .error-container { text-align: center; padding: 60px 20px; }
          button { margin-top: 20px; padding: 10px 24px; background: var(--text-primary); color: white; border: none; border-radius: 40px; cursor: pointer; }
        `}</style>
      </>
    );
  }

  const aiMessage = `Here is your generated question paper for ${paper.subject} (${paper.classLevel}).`;

  return (
    <>
      <TopBar title="Create New" showBack={false} />

      <div className="home-page">
        <div className="ai-banner">
          <p className="ai-banner-text">{aiMessage}</p>
          <div className="button-group">
            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={pdfGenerating}
            >
              {pdfGenerating ? "Generating PDF..." : "Download as PDF"}
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
            </button>
            <button
              className="download-btn regenerate-btn"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? "Regenerating..." : "Regenerate"}
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
            </button>
          </div>
        </div>

        <div className="paper-preview">
          <div className="paper-header">
            <h1 className="paper-institution">
              {paper.institutionName || "VedaAI Institute"}
            </h1>
            <p className="paper-subject">Subject: {paper.subject}</p>
            <p className="paper-class">Class: {paper.classLevel}</p>
          </div>

          <div className="paper-meta-row">
            <span className="paper-time">
              Time Allowed: {paper.timeAllowed}
            </span>
            <span className="paper-marks">Maximum Marks: {paper.maxMarks}</span>
          </div>

          <p className="paper-note">{paper.compulsoryNote}</p>

          <div className="paper-student-info">
            <p>
              Name: <span className="paper-blank">______________________</span>
            </p>
            <p>
              Roll Number: <span className="paper-blank">________________</span>
            </p>
            <p>
              Class: {paper.classLevel} Section:{" "}
              <span className="paper-blank">__________</span>
            </p>
          </div>

          {paper.sections.map((section, idx) => (
            <div key={idx} className="paper-section">
              <h2 className="paper-section-name">{section.title}</h2>
              <p className="paper-section-type">{section.type}</p>
              <p className="paper-section-instruction">{section.instruction}</p>
              <ol className="paper-questions">
                {section.questions.map((q, qIdx) => (
                  <li key={qIdx} className="paper-question">
                    <span className="paper-difficulty">
                      {renderDifficultyStars(q.difficulty)}
                    </span>{" "}
                    {q.text}{" "}
                    <span className="paper-qmarks">[{q.marks} Marks]</span>
                    {q.options && q.options.length > 0 && (
                      <div className="paper-options">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="paper-option">
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
          <p className="paper-end">End of Question Paper</p>

          <div className="paper-answer-key">
            <h3 className="paper-ak-title">Answer Key:</h3>
            <ol className="paper-answers">
              {paper.sections.flatMap((section) =>
                section.questions.map((q, idx) => (
                  <li key={idx} className="paper-answer">
                    {q.answerHint || "No hint provided"}
                  </li>
                )),
              )}
            </ol>
          </div>
        </div>
      </div>

      <style>{`
        .home-page { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; }
        .ai-banner { background: #111111; border-radius: 16px 16px 0 0; padding: 24px 28px; display: flex; flex-direction: column; gap: 14px; }
        .ai-banner-text { color: white; font-size: 15px; font-weight: 400; line-height: 1.6; }
        .button-group { display: flex; gap: 12px; flex-wrap: wrap; }
        .download-btn { display: inline-flex; align-items: center; gap: 8px; background: white; color: var(--text-primary); border: none; border-radius: 50px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.12s; }
        .download-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .download-btn:hover:not(:disabled) { background: #f0f0f0; }
        .regenerate-btn { background: #2a2a2a; color: white; }
        .regenerate-btn:hover:not(:disabled) { background: #3a3a3a; }
        .paper-preview { font-family: var(--paper-font); background: white; border-radius: 0 0 16px 16px; border: 1px solid #e5e5e5; border-top: none; padding: 36px 40px; }
        .paper-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #111; padding-bottom: 16px; }
        .paper-institution { font-size: 20px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; }
        .paper-subject, .paper-class { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-top: 4px; }
        .paper-meta-row { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; font-size: 14px; font-weight: 500; color: var(--text-primary); }
        .paper-note { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
        .paper-student-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px; font-size: 14px; color: var(--text-primary); font-weight: 500; }
        .paper-blank { font-weight: 400; color: var(--text-primary); }
        .paper-section { margin-bottom: 24px; }
        .paper-section-name { font-size: 18px; font-weight: 700; text-align: center; color: var(--text-primary); margin-bottom: 4px; }
        .paper-section-type { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
        .paper-section-instruction { font-size: 13px; font-style: italic; color: var(--text-secondary); margin-bottom: 14px; }
        .paper-questions { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
        .paper-question { font-size: 14px; color: var(--text-primary); line-height: 1.6; margin-bottom: 12px; }
        .paper-difficulty { color: var(--color-brand); font-weight: 700; font-size: 13px; letter-spacing: 1px; }
        .paper-qmarks { color: var(--text-secondary); font-size: 13px; }
        .paper-options { margin-top: 4px; margin-left: 20px; font-size: 13px; }
        .paper-option { margin-bottom: 2px; }
        .paper-end { font-size: 14px; font-weight: 700; text-align: left; color: var(--text-primary); margin-top: 20px; padding-top: 16px; }
        .paper-answer-key { margin-top: 24px; padding-top: 20px; }
        .paper-ak-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
        .paper-answers { padding-left: 20px; display: flex; flex-direction: column; gap: 10px; }
        .paper-answer { font-size: 13px; line-height: 1.7; }
        @media (max-width: 768px) {
          .ai-banner { border-radius: 12px 12px 0 0; padding: 16px 18px; }
          .paper-preview { padding: 20px 18px; }
          .paper-meta-row { flex-direction: column; align-items: flex-start; gap: 4px; }
          .button-group { flex-direction: column; }
        }
      `}</style>
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <TopBar title="Create New" showBack={false} />
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your assignment...</p>
      </div>
      <style>{`
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 16px; }
        .spinner { width: 40px; height: 40px; border: 4px solid #e5e5e5; border-top-color: var(--color-brand); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
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
