import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { config } from "../config";
import {
  GenerationJobPayload,
  GeneratedPaper,
  generatedPaperSchema,
} from "@veda/shared";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const modelFallbackChain = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemma-4-26b-a4b-it",
  "gemma-4-31b-it",
];

function extractSubjectFromTitle(title: string): string {
  const match = title.match(/^(React|Next\.js|TypeScript|JavaScript|Node)/i);
  return match ? match[0] : "Computer Science";
}

function inferClassLevel(title: string): string {
  if (title.toLowerCase().includes("advanced")) return "Advanced";
  if (title.toLowerCase().includes("intermediate")) return "Intermediate";
  return "Beginner";
}

function calculateTime(totalQ: number, marksPerQ: number): string {
  const totalMarks = totalQ * marksPerQ;
  if (totalMarks <= 20) return "45 minutes";
  if (totalMarks <= 40) return "1 hour";
  return "1.5 hours";
}

function getPrompt(payload: GenerationJobPayload): string {
  const {
    title,
    totalQuestions,
    marksPerQuestion,
    difficultyPreference,
    additionalInstructions,
    uploadedContent,
    classLevel,
  } = payload;

  const difficultyMap: Record<string, string[]> = {
    easy: ["Easy"],
    medium: ["Easy", "Medium"],
    hard: ["Medium", "Difficult"],
  };
  const allowedDifficulties = difficultyMap[difficultyPreference || "medium"];

  return `
You are an expert exam paper creator. Generate a question paper that exactly matches the format below.

**Topic / Subject:** ${title}
${uploadedContent ? `The questions MUST be based solely on the following study material:\n"${uploadedContent}"\n` : ""}
**Target Class:** ${classLevel} else "General"
**Total Questions:** ${totalQuestions}
**Marks per Question:** ${marksPerQuestion}
**Difficulty Preference:** ${difficultyPreference || "medium"} (choose from ${allowedDifficulties.join(", ")})
**Additional Instructions:** ${additionalInstructions || "None"}
${uploadedContent ? `**Study Material / Content:**\n${uploadedContent}\n` : ""}

Output **only valid JSON** (no markdown, no extra text) following this exact schema:

{
  "subject": "string (e.g., English)",
  "classLevel": "string (e.g., 5th)",
  "timeAllowed": "string (e.g., 45 minutes)",
  "maxMarks": number (total marks = totalQuestions * marksPerQuestion),
  "compulsoryNote": "string (usually 'All questions are compulsory unless stated otherwise.')",
  "sections": [
    {
      "title": "Section A",
      "type": "Short Answer Questions",
      "instruction": "Attempt all questions. Each question carries X marks",
      "questions": [
        {
          "text": "Question text here",
          "difficulty": "Easy" | "Medium" | "Difficult",
          "marks": number (must equal marksPerQuestion),
          "answerHint": "brief answer explanation"
        }
      ]
    }
  ]
}

**Rules:**
- You may create 1 to 3 sections. Distribute the ${totalQuestions} questions evenly across sections.
- Each question must have **difficulty** one of: Easy, Medium, Difficult. Use the allowed difficulties: ${allowedDifficulties.join(", ")}.
- Each question must have **marks** exactly ${marksPerQuestion}.
- **Every question must include an "answerHint"** – a short answer (1-2 sentences) for the answer key.
- The **instruction** in each section must include the marks per question (e.g., "Each question carries ${marksPerQuestion} marks").
- The **type** should describe the question style (e.g., "Short Answer Questions", "Long Answer", "Multiple Choice").
- The **subject** and **classLevel** should be realistic based on the title. If title is "English - Class 5", extract "English" and "5th".
- The **timeAllowed** should be reasonable (e.g., 45 minutes for 20 marks, 1 hour for 30 marks).
- The **compulsoryNote** should be as shown unless additionalInstructions say otherwise.
- Do NOT include any extra fields. Return ONLY the JSON object.
`.trim();
}

async function tryGenerate(
  modelName: string,
  prompt: string,
): Promise<GeneratedPaper> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const jsonText = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(jsonText);
  return generatedPaperSchema.parse(parsed);
}

export async function generatePaperWithFallback(
  payload: GenerationJobPayload,
  onProgress: (percent: number) => void,
): Promise<GeneratedPaper> {
  const prompt = getPrompt(payload);
  let lastError: Error | undefined;

  for (let i = 0; i < modelFallbackChain.length; i++) {
    const model = modelFallbackChain[i];
    try {
      onProgress(20 + i * 15);
      console.log(`🔧 Trying model: ${model}`);
      const paper = await tryGenerate(model, prompt);

      // Apply defaults for missing metadata
      const finalPaper: GeneratedPaper = {
        subject: paper.subject || extractSubjectFromTitle(payload.title),
        classLevel: paper.classLevel || inferClassLevel(payload.title),
        timeAllowed:
          paper.timeAllowed ||
          calculateTime(payload.totalQuestions, payload.marksPerQuestion),
        maxMarks:
          paper.maxMarks || payload.totalQuestions * payload.marksPerQuestion,
        compulsoryNote:
          paper.compulsoryNote ||
          "All questions are compulsory unless stated otherwise.",
        sections: paper.sections,
        studentInfo: paper.studentInfo || {},
        totalMarks: paper.totalMarks,
        duration: paper.duration,
        pdfUrl: paper.pdfUrl,
      };

      onProgress(90);
      return finalPaper;
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err.message);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All AI models failed");
}
