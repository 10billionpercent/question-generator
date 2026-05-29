import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import {
  GenerationJobPayload,
  GeneratedPaper,
  generatedPaperSchema,
} from "@veda/shared";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const modelTimeoutMs = Number(process.env.AI_MODEL_TIMEOUT_MS || 20000);

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
    totalQuestions: rawTotal = 0,
    marksPerQuestion: rawMarks = 0,
    difficultyPreference,
    additionalInstructions,
    uploadedContent,
    classLevel,
    questionBreakdown,
  } = payload;

  const totalQuestions = rawTotal || 0;
  const marksPerQuestion = rawMarks || 0;

  // Build section instructions with type‑specific hints
  let sectionInstructions = "";
  if (questionBreakdown && questionBreakdown.length > 0) {
    sectionInstructions = `**Question Breakdown:**\n${questionBreakdown
      .map((item, idx) => {
        let hint = "";
        switch (item.type) {
          case "diagram-graph":
            hint =
              " (provide a detailed textual description of a diagram/graph within the question)";
            break;
          case "numerical":
            hint =
              " (present a numerical problem with a step‑by‑step solution in the answerHint)";
            break;
          case "match-following":
            hint =
              " (present two columns of items to match, include the correct pairs in answerHint)";
            break;
          case "true-false":
            hint =
              " (state whether the statement is true or false, include correct answer in answerHint)";
            break;
          case "fill-blanks":
            hint =
              " (provide a sentence with missing words, list the missing words in answerHint)";
            break;
          default:
            break;
        }
        return `- Section ${String.fromCharCode(65 + idx)}: ${item.type} – ${item.count} questions, ${item.marks} marks each${hint}`;
      })
      .join("\n")}\n\n`;
  }

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
${sectionInstructions}
**Total Questions:** ${totalQuestions}
**Marks per Question:** ${marksPerQuestion} (used as default if not specified per section)
**Difficulty Preference:** ${difficultyPreference || "medium"} (choose from ${allowedDifficulties.join(", ")})
**Additional Instructions:** ${additionalInstructions || "None"}
${uploadedContent ? `**Study Material / Content:**\n"${uploadedContent}"\n` : ""}

**IMPORTANT:**
- You MUST create exactly one section for each item in the Question Breakdown above.
- The number of questions in each section MUST match the count given, and each question MUST have exactly the marks specified for that section.
- The **type** field in the section should be derived from the breakdown (e.g., "Multiple Choice Questions", "Short Answer Questions").
- The **instruction** should reflect the marks per question.
- Every question MUST include an "answerHint" – a short answer or key point (1-2 sentences).

**For multiple‑choice questions, every question object MUST contain an
"options" array with exactly 4 items.**

Example of a complete MCQ question object:
{
  "text": "What is the capital of France?",
  "difficulty": "Easy",
  "marks": 1,
  "answerHint": "Paris",
  "options": [
    { "label": "a", "text": "London" },
    { "label": "b", "text": "Berlin" },
    { "label": "c", "text": "Paris" },
    { "label": "d", "text": "Madrid" }
  ]
}

For non‑MCQ questions, "options" should be omitted or an empty array.

Output **only valid JSON** (no markdown, no extra text) following this schema:

{
  "subject": "string",
  "classLevel": "string",
  "timeAllowed": "string",
  "maxMarks": number (sum of all section marks),
  "compulsoryNote": "string",
  "sections": [
    {
      "title": "Section A",
      "type": "...",
      "instruction": "Attempt all questions. Each question carries X marks",
      "questions": [
        { "text": "...", "difficulty": "Easy"|"Medium"|"Difficult", "marks": X, "answerHint": "..." , "options": [....]}
      ]
    }
  ]
}

**Rules:**
- - You MUST create EXACTLY one section for each item in the Question Breakdown above. No extra sections are allowed.
- Each question must have **difficulty** one of: Easy, Medium, Difficult. Use the allowed difficulties: ${allowedDifficulties.join(", ")}.
- Each question must have **marks** exactly ${marksPerQuestion}.
- Each question must include an **"answerHint"**. You MUST give 4 options if the question is multiple choice.
- The **instruction** in each section must mention the marks per question (e.g., "Each question carries ${marksPerQuestion} marks").
- The **type** field should describe the question style (e.g., "Short Answer Questions", "Long Answer", "Multiple Choice").
- The **timeAllowed** should be reasonable (e.g., 45 minutes for 20 marks).
- For **diagram‑graph** questions, include a detailed textual description of the diagram/graph (no image needed).
- For **numerical** problems, give a complete step‑by‑step solution in the answer hint.
- For **match‑the‑following** questions, present two lists of items to be matched and give the correct matching pairs in the answer hint.
- Return ONLY the JSON object, no other text.
`.trim();
}

async function tryGenerate(
  modelName: string,
  prompt: string,
): Promise<GeneratedPaper> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise<never>((_resolve, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(`Model ${modelName} timed out after ${modelTimeoutMs}ms`),
          ),
        modelTimeoutMs,
      );
    }),
  ]);
  const text = result.response.text();
  console.log("Raw AI response text:", text);
  const jsonText = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(jsonText);
  return generatedPaperSchema.parse(parsed);
}

export async function generatePaperWithFallback(
  payload: GenerationJobPayload,
  onProgress: (percent: number) => void,
): Promise<GeneratedPaper> {
  const prompt = getPrompt(payload);
  console.log(
    `AI prompt size: ${prompt.length} chars; uploaded content: ${payload.uploadedContent?.length || 0} chars`,
  );
  let lastError: Error | undefined;

  for (let i = 0; i < modelFallbackChain.length; i++) {
    const model = modelFallbackChain[i];
    const startedAt = Date.now();
    try {
      onProgress(20 + i * 15);
      console.log(`🔧 Trying model: ${model}`);
      const paper = await tryGenerate(model, prompt);
      console.log(`Model ${model} succeeded in ${Date.now() - startedAt}ms`);

      const computedMaxMarks = paper.sections.reduce(
        (sum, section) =>
          sum + section.questions.reduce((s, q) => s + q.marks, 0),
        0,
      );

      // Apply safe defaults only if AI missed these fields (no regex)
      const finalPaper: GeneratedPaper = {
        subject: paper.subject || payload.title,
        classLevel: paper.classLevel || "General",
        timeAllowed:
          paper.timeAllowed ||
          calculateTime(
            payload.totalQuestions || 0,
            payload.marksPerQuestion || 0,
          ),
        maxMarks:
          computedMaxMarks ||
          (payload.totalQuestions || 0) * (payload.marksPerQuestion || 0),
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
      console.warn(
        `Model ${model} failed after ${Date.now() - startedAt}ms:`,
        err.message,
      );
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All AI models failed");
}
