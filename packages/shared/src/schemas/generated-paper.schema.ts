import { z } from "zod";

export const questionSchema = z.object({
  text: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Difficult"]),
  marks: z.number().positive(),
  answerHint: z.string().optional(),
});

export const sectionSchema = z.object({
  title: z.string(),
  type: z.string(),
  instruction: z.string(),
  questions: z.array(questionSchema),
});

// Student info structure (just placeholders)
export const studentInfoSchema = z.object({
  name: z.string().optional().default(""),
  rollNumber: z.string().optional().default(""),
  classSection: z.string().optional().default(""),
});

export const generatedPaperSchema = z.object({
  subject: z.string(),
  classLevel: z.string(),
  timeAllowed: z.string(),
  maxMarks: z.number(),
  compulsoryNote: z.string(),
  sections: z.array(sectionSchema),
  studentInfo: studentInfoSchema.optional().default({}),
  totalMarks: z.number().optional(),
  duration: z.string().optional(),
  pdfUrl: z.string().optional(),
});

export type GeneratedPaper = z.infer<typeof generatedPaperSchema>;
