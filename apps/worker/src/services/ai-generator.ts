import { GoogleGenerativeAI } from "@google/generative-ai";
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

// Simple fallback only when the AI doesn't return a value – no regex
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

**User provided title:** "${title}"
**User provided class level:** ${classLevel || "(not specified)"}
**Total Questions:** ${totalQuestions}
**Marks per Question:** ${marksPerQuestion}
**Difficulty Preference:** ${difficultyPreference || "medium"} (choose from ${allowedDifficulties.join(", ")})
**Additional Instructions:** ${additionalInstructions || "None"}
${uploadedContent ? `**Study Material / Content:**\n"${uploadedContent}"\n` : ""}

**IMPORTANT:**
- If the user's title does not clearly identify a subject (e.g., "Question Paper from Upload", "Test", "Exam"), **analyze the provided study material and generate a concise, meaningful subject** (e.g., "Data Structures", "Ancient Civilizations").
- If the user's class level is missing or vague, **infer an appropriate class level** from the study material or default to "General".
- The questions MUST be based on the study material if provided, otherwise on the title.
- Every question MUST include an "answerHint" – a short answer or key point (1-2 sentences).

Output **only valid JSON** (no markdown, no extra text) following this exact schema:

{
  "subject": "string (e.g., English, React Hooks)",
  "classLevel": "string (e.g., 5th, BE 6th Sem, General)",
  "timeAllowed": "string (e.g., 45 minutes)",
  "maxMarks": number (total marks = ${totalQuestions} * ${marksPerQuestion} = ${totalQuestions * marksPerQuestion}),
  "compulsoryNote": "string (e.g., 'All questions are compulsory unless stated otherwise.')",
  "sections": [
    {
      "title": "Section A",
      "type": "Short Answer Questions",
      "instruction": "Attempt all questions. Each question carries ${marksPerQuestion} marks",
      "questions": [
        {
          "text": "Question text here",
          "difficulty": "Easy" | "Medium" | "Difficult",
          "marks": number (must equal ${marksPerQuestion}),
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
- Each question must include an **"answerHint"**.
- The **instruction** in each section must mention the marks per question (e.g., "Each question carries ${marksPerQuestion} marks").
- The **type** field should describe the question style (e.g., "Short Answer Questions", "Long Answer", "Multiple Choice").
- The **timeAllowed** should be reasonable (e.g., 45 minutes for 20 marks).
- Return ONLY the JSON object, no other text.
`.trim();
}

async function tryGenerate(
  modelName: string,
  prompt: string,
): Promise<GeneratedPaper> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
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

      // Apply safe defaults only if AI missed these fields (no regex)
      const finalPaper: GeneratedPaper = {
        subject: paper.subject || payload.title,
        classLevel: paper.classLevel || "General",
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
