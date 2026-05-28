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

export const questionBreakdownItemSchema = z.object({
  type: questionTypeEnum,
  count: z.coerce.number().int().positive(),
  marks: z.coerce.number().int().positive(),
});
export type QuestionBreakdownItem = z.infer<typeof questionBreakdownItemSchema>;

export const assignmentFormSchema = z.object({
  institutionName: z.string().optional(),
  title: z.string().min(1, "Title required"),
  studyMaterialUrl: z.string().url().optional(),
  dueDate: z.string().datetime().optional(),
  // Old flat fields (keep for backwards compatibility)
  questionTypes: z.array(questionTypeEnum).min(1).optional(),
  totalQuestions: z.coerce.number().int().positive().optional(),
  marksPerQuestion: z.coerce.number().int().positive().optional(),
  // New detailed breakdown
  questionBreakdown: z.array(questionBreakdownItemSchema).min(1).optional(),
  additionalInstructions: z.string().optional(),
  difficultyPreference: difficultyEnum.optional(),
  classLevel: z.string().optional(),
});

export type AssignmentForm = z.infer<typeof assignmentFormSchema>;

export const generationJobPayloadSchema = assignmentFormSchema.extend({
  assignmentId: z.string().optional(),
  userId: z.string().optional(),
  uploadedContent: z.string().optional(), // extracted text from PDF/txt
});
export type GenerationJobPayload = z.infer<typeof generationJobPayloadSchema>;
