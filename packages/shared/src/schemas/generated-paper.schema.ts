import { z } from "zod";
import { difficultyEnum } from "./assignment.schema";

export const questionSchema = z.object({
  text: z.string(),
  difficulty: difficultyEnum,
  marks: z.number().int().positive(),
});
export type Question = z.infer<typeof questionSchema>;

export const sectionSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  questions: z.array(questionSchema),
});
export type Section = z.infer<typeof sectionSchema>;

export const generatedPaperSchema = z.object({
  studentInfo: z.object({
    name: z.string().optional(),
    rollNumber: z.string().optional(),
    date: z.string().optional(),
  }),
  sections: z.array(sectionSchema),
  totalMarks: z.number().int().positive(),
  duration: z.string().optional(),
});
export type GeneratedPaper = z.infer<typeof generatedPaperSchema>;
