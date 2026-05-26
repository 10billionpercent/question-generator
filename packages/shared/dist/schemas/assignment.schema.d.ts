import { z } from "zod";
export declare const difficultyEnum: z.ZodEnum<["easy", "medium", "hard"]>;
export type Difficulty = z.infer<typeof difficultyEnum>;
export declare const questionTypeEnum: z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks"]>;
export type QuestionType = z.infer<typeof questionTypeEnum>;
export declare const assignmentFormSchema: z.ZodObject<{
    title: z.ZodString;
    studyMaterialUrl: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    questionTypes: z.ZodArray<z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks"]>, "many">;
    totalQuestions: z.ZodNumber;
    marksPerQuestion: z.ZodNumber;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    difficultyPreference: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard"]>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    questionTypes: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks")[];
    totalQuestions: number;
    marksPerQuestion: number;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
}, {
    title: string;
    questionTypes: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks")[];
    totalQuestions: number;
    marksPerQuestion: number;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
}>;
export type AssignmentForm = z.infer<typeof assignmentFormSchema>;
export declare const generationJobPayloadSchema: z.ZodObject<{
    title: z.ZodString;
    studyMaterialUrl: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    questionTypes: z.ZodArray<z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks"]>, "many">;
    totalQuestions: z.ZodNumber;
    marksPerQuestion: z.ZodNumber;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    difficultyPreference: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard"]>>;
} & {
    assignmentId: z.ZodOptional<z.ZodString>;
    uploadedContent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    questionTypes: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks")[];
    totalQuestions: number;
    marksPerQuestion: number;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    assignmentId?: string | undefined;
    uploadedContent?: string | undefined;
}, {
    title: string;
    questionTypes: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks")[];
    totalQuestions: number;
    marksPerQuestion: number;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    assignmentId?: string | undefined;
    uploadedContent?: string | undefined;
}>;
export type GenerationJobPayload = z.infer<typeof generationJobPayloadSchema>;
//# sourceMappingURL=assignment.schema.d.ts.map