import { z } from "zod";

export const difficultyEnum = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof difficultyEnum>;

export const questionTypeEnum = z.enum([
  "mcq",
  "short-answer",
  "long-answer",
  "true-false",
  "fill-blanks",
]);
export type QuestionType = z.infer<typeof questionTypeEnum>;

export const assignmentFormSchema = z.object({
  title: z.string().min(1, "Title required"),
  studyMaterialUrl: z.string().url().optional(),
  dueDate: z.string().datetime().optional(),
  questionTypes: z.array(questionTypeEnum).min(1),
  totalQuestions: z.number().int().positive(),
  marksPerQuestion: z.number().int().positive(),
  additionalInstructions: z.string().optional(),
  difficultyPreference: difficultyEnum.optional(),
});
export type AssignmentForm = z.infer<typeof assignmentFormSchema>;

export const generationJobPayloadSchema = assignmentFormSchema.extend({
  assignmentId: z.string().optional(),
  uploadedContent: z.string().optional(), // extracted text from PDF/txt
});
export type GenerationJobPayload = z.infer<typeof generationJobPayloadSchema>;
