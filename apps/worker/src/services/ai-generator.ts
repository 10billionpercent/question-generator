import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { config } from "../config";
import {
  GenerationJobPayload,
  GeneratedPaper,
  generatedPaperSchema,
} from "@veda/shared";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const modelFallbackChain = [
  "gemini-2.5-flash",        // most capable free Flash
  "gemini-3.1-flash-lite",   // lower‑tier but high RPD
  "gemini-3-flash",
  "gemini-2.5-flash-lite",   // extra lite if others exhausted
  "gemma-4-26b",             // Gemma models (unlimited TPM!)
  "gemma-4-31b",
];

function getPrompt(payload: GenerationJobPayload): string {
  const {
    title,
    totalQuestions,
    marksPerQuestion,
    difficultyPreference,
    additionalInstructions,
    uploadedContent,
  } = payload;
  return `
You are an expert exam paper creator. Generate a structured question paper based on the following details.

Topic/Title: ${title}
Total Questions: ${totalQuestions}
Marks per Question: ${marksPerQuestion}
Difficulty Preference: ${difficultyPreference || "medium"}
Additional Instructions: ${additionalInstructions || "None"}
${uploadedContent ? `Study Material: ${uploadedContent}` : ""}

Output the paper in the following strict JSON format (no markdown, only JSON):

{
  "studentInfo": {
    "name": "",
    "rollNumber": "",
    "date": ""
  },
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        { "text": "Question text here", "difficulty": "easy", "marks": 5 }
      ]
    }
  ],
  "totalMarks": 100,
  "duration": "2 hours"
}

Rules:
- The "sections" array can have 1-3 sections.
- Questions must be exactly ${totalQuestions} total across all sections.
- Marks per question must match ${marksPerQuestion}.
- difficulty must be one of: "easy", "medium", "hard".
- Return ONLY the JSON object, no other text.
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
  // Strip possible markdown code fences
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
      onProgress(20 + i * 15); // progress between 20-80
      console.log(`🔧 Trying model: ${model}`);
      const paper = await tryGenerate(model, prompt);
      onProgress(90);
      return paper;
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err.message);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All AI models failed");
}
