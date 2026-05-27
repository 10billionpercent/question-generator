import { z } from "zod";
export declare const difficultyEnum: z.ZodEnum<["easy", "medium", "hard"]>;
export type Difficulty = z.infer<typeof difficultyEnum>;
export declare const questionTypeEnum: z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks"]>;
export type QuestionType = z.infer<typeof questionTypeEnum>;
export declare const assignmentFormSchema: z.ZodObject<{
    institutionName: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    studyMaterialUrl: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    questionTypes: z.ZodArray<z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks"]>, "many">;
    totalQuestions: z.ZodNumber;
    marksPerQuestion: z.ZodNumber;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    difficultyPreference: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard"]>>;
    classLevel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    questionTypes: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks")[];
    totalQuestions: number;
    marksPerQuestion: number;
    institutionName?: string | undefined;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    classLevel?: string | undefined;
}, {
    title: string;
    questionTypes: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks")[];
    totalQuestions: number;
    marksPerQuestion: number;
    institutionName?: string | undefined;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    classLevel?: string | undefined;
}>;
export type AssignmentForm = z.infer<typeof assignmentFormSchema>;
export declare const generationJobPayloadSchema: z.ZodObject<{
    institutionName: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    studyMaterialUrl: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    questionTypes: z.ZodArray<z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks"]>, "many">;
    totalQuestions: z.ZodNumber;
    marksPerQuestion: z.ZodNumber;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    difficultyPreference: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard"]>>;
    classLevel: z.ZodOptional<z.ZodString>;
} & {
    assignmentId: z.ZodOptional<z.ZodString>;
    uploadedContent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    questionTypes: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks")[];
    totalQuestions: number;
    marksPerQuestion: number;
    institutionName?: string | undefined;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    classLevel?: string | undefined;
    assignmentId?: string | undefined;
    uploadedContent?: string | undefined;
}, {
    title: string;
    questionTypes: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks")[];
    totalQuestions: number;
    marksPerQuestion: number;
    institutionName?: string | undefined;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    classLevel?: string | undefined;
    assignmentId?: string | undefined;
    uploadedContent?: string | undefined;
}>;
export type GenerationJobPayload = z.infer<typeof generationJobPayloadSchema>;
//# sourceMappingURL=assignment.schema.d.ts.map