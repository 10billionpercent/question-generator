"use client";

import TopBar from "@/components/TopBar";
import { Star } from "lucide-react";

const MOCK_PAPER = {
  aiMessage:
    "Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:",
  institutionName: "Delhi Public School, Sector-4, Bokaro",
  subject: "Science",
  classLevel: "8th",
  timeAllowed: "45 minutes",
  maxMarks: 20,
  note: "All questions are compulsory unless stated otherwise.",
  sections: [
    {
      name: "Section A",
      type: "Short Answer Questions",
      instruction: "Attempt all questions. Each question carries 2 marks",
      questions: [
        {
          num: 1,
          difficulty: "Easy",
          text: "Define electroplating. Explain its purpose.",
          marks: 2,
        },
        {
          num: 2,
          difficulty: "Moderate",
          text: "What is the role of a conductor in the process of electrolysis?",
          marks: 2,
        },
        {
          num: 3,
          difficulty: "Easy",
          text: "Why does a solution of copper sulfate conduct electricity?",
          marks: 2,
        },
        {
          num: 4,
          difficulty: "Moderate",
          text: "Describe one example of the chemical effect of electric current in daily life.",
          marks: 2,
        },
        {
          num: 5,
          difficulty: "Moderate",
          text: "Explain why electric current is said to have chemical effects.",
          marks: 2,
        },
        {
          num: 6,
          difficulty: "Challenging",
          text: "How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.",
          marks: 2,
        },
        {
          num: 7,
          difficulty: "Challenging",
          text: "What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.",
          marks: 2,
        },
        {
          num: 8,
          difficulty: "Easy",
          text: "Mention the type of current used in electroplating and justify why it is used.",
          marks: 2,
        },
        {
          num: 9,
          difficulty: "Moderate",
          text: "What is the importance of electric current in the field of metallurgy?",
          marks: 2,
        },
        {
          num: 10,
          difficulty: "Challenging",
          text: "Explain with a chemical equation how copper is deposited during the electroplating of an object.",
          marks: 2,
        },
      ],
    },
  ],
  answerKey: [
    "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.",
    "A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.",
    "Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.",
    "An example is the electroplating of silver on jewelry to prevent tarnishing.",
    "Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects.",
    "Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons: 2H2O + 2e- -> H2 + 2OH- ; Na+ + OH- -> NaOH (in solution)",
    "At the cathode: water is reduced to hydrogen gas and hydroxide ions. At the anode: water is oxidized to oxygen gas and hydrogen ions.",
    "Direct current (DC) is used because it produces a consistent flow of electrons necessary for controlled deposition of metals.",
    "Electric current helps extract metals from their ores and purify metals by electrolysis in metallurgy.",
    "During copper electroplating, copper ions in solution gain electrons at the cathode and deposit as copper metal: Cu2+ + 2e- -> Cu (solid)",
  ],
};

const renderDifficultyStars = (difficulty: string) => {
  const starCount =
    difficulty === "Easy" ? 1 : difficulty === "Moderate" ? 2 : 3;
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

export default function CreatedAssignmentPage() {
  const paper = MOCK_PAPER;

  return (
    <>
      <TopBar title="Create New" showBack={false} />

      <div className="home-page">
        <div className="ai-banner">
          <p className="ai-banner-text">{paper.aiMessage}</p>
          <button
            className="download-btn"
            onClick={() => alert("PDF download triggered")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download as PDF
          </button>
        </div>

        <div className="paper-preview">
          <div className="paper-header">
            <h1 className="paper-institution">{paper.institutionName}</h1>
            <p className="paper-subject">Subject: {paper.subject}</p>
            <p className="paper-class">Class: {paper.classLevel}</p>
          </div>

          <div className="paper-meta-row">
            <span className="paper-time">
              Time Allowed: {paper.timeAllowed}
            </span>
            <span className="paper-marks">Maximum Marks: {paper.maxMarks}</span>
          </div>

          <p className="paper-note">{paper.note}</p>

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

          {paper.sections.map((section) => (
            <div key={section.name} className="paper-section">
              <h2 className="paper-section-name">{section.name}</h2>
              <p className="paper-section-type">{section.type}</p>
              <p className="paper-section-instruction">{section.instruction}</p>

              <ol className="paper-questions">
                {section.questions.map((q) => (
                  <li key={q.num} className="paper-question">
                    <span className="paper-difficulty">
                      {renderDifficultyStars(q.difficulty)}
                    </span>{" "}
                    {q.text}{" "}
                    <span className="paper-qmarks">[{q.marks} Marks]</span>
                  </li>
                ))}
              </ol>

              <p className="paper-end">End of Question Paper</p>
            </div>
          ))}

          <div className="paper-answer-key">
            <h3 className="paper-ak-title">Answer Key:</h3>
            <ol className="paper-answers">
              {paper.answerKey.map((ans, i) => (
                <li key={i} className="paper-answer">
                  {ans}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <style>{`
        .home-page {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .ai-banner {
          background: #111111;
          border-radius: 16px 16px 0 0;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ai-banner-text {
          color: white;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.6;
        }

        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: var(--text-primary);
          border: none;
          border-radius: 50px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font);
          cursor: pointer;
          align-self: flex-start;
          transition: background 0.12s;
        }

        .download-btn:hover {
          background: #f0f0f0;
        }

        .paper-preview {
          background: white;
          border-radius: 0 0 16px 16px;
          border: 1px solid #e5e5e5;
          border-top: none;
          padding: 36px 40px;
          font-family: var(--paper-font), sans-serif;
        }

        .paper-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #111;
          padding-bottom: 16px;
        }

        .paper-institution {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .paper-subject,
        .paper-class {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .paper-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 16px 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .paper-note {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .paper-student-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 24px;
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .paper-blank {
          font-weight: 400;
          color: var(--text-primary);
        }

        .paper-section {
          margin-bottom: 24px;
        }

        .paper-section-name {
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .paper-section-type {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .paper-section-instruction {
          font-size: 13px;
          font-style: italic;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }

        .paper-questions {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .paper-question {
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.6;
        }

        .paper-difficulty {
          color: var(--color-brand);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
        }

        .paper-qmarks {
          color: var(--text-secondary);
          font-size: 13px;
        }

        .paper-end {
          font-size: 14px;
          font-weight: 700;
          text-align: left;
          color: var(--text-primary);
          margin-top: 20px;
          padding-top: 16px;
        }

        .paper-answer-key {
          margin-top: 24px;
          padding-top: 20px;
        }

        .paper-ak-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .paper-answers {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .paper-answer {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .ai-banner {
            border-radius: 12px 12px 0 0;
            padding: 16px 18px;
          }

          .paper-preview {
            padding: 20px 18px;
          }

          .paper-meta-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </>
  );
}
