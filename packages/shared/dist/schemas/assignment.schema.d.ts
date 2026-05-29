import { z } from "zod";
export declare const difficultyEnum: z.ZodEnum<["easy", "medium", "hard"]>;
export type Difficulty = z.infer<typeof difficultyEnum>;
export declare const questionTypeEnum: z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks", "diagram-graph", "numerical", "match-following"]>;
export type QuestionType = z.infer<typeof questionTypeEnum>;
export declare const questionBreakdownItemSchema: z.ZodObject<{
    type: z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks", "diagram-graph", "numerical", "match-following"]>;
    count: z.ZodNumber;
    marks: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
    count: number;
    marks: number;
}, {
    type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
    count: number;
    marks: number;
}>;
export type QuestionBreakdownItem = z.infer<typeof questionBreakdownItemSchema>;
export declare const assignmentFormSchema: z.ZodObject<{
    institutionName: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    studyMaterialUrl: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    questionTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks", "diagram-graph", "numerical", "match-following"]>, "many">>;
    totalQuestions: z.ZodOptional<z.ZodNumber>;
    marksPerQuestion: z.ZodOptional<z.ZodNumber>;
    questionBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks", "diagram-graph", "numerical", "match-following"]>;
        count: z.ZodNumber;
        marks: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
        count: number;
        marks: number;
    }, {
        type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
        count: number;
        marks: number;
    }>, "many">>;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    difficultyPreference: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard"]>>;
    classLevel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    institutionName?: string | undefined;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    questionTypes?: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following")[] | undefined;
    totalQuestions?: number | undefined;
    marksPerQuestion?: number | undefined;
    questionBreakdown?: {
        type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
        count: number;
        marks: number;
    }[] | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    classLevel?: string | undefined;
}, {
    title: string;
    institutionName?: string | undefined;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    questionTypes?: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following")[] | undefined;
    totalQuestions?: number | undefined;
    marksPerQuestion?: number | undefined;
    questionBreakdown?: {
        type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
        count: number;
        marks: number;
    }[] | undefined;
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
    questionTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks", "diagram-graph", "numerical", "match-following"]>, "many">>;
    totalQuestions: z.ZodOptional<z.ZodNumber>;
    marksPerQuestion: z.ZodOptional<z.ZodNumber>;
    questionBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["mcq", "short-answer", "long-answer", "true-false", "fill-blanks", "diagram-graph", "numerical", "match-following"]>;
        count: z.ZodNumber;
        marks: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
        count: number;
        marks: number;
    }, {
        type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
        count: number;
        marks: number;
    }>, "many">>;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    difficultyPreference: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard"]>>;
    classLevel: z.ZodOptional<z.ZodString>;
} & {
    assignmentId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    uploadedContent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    institutionName?: string | undefined;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    questionTypes?: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following")[] | undefined;
    totalQuestions?: number | undefined;
    marksPerQuestion?: number | undefined;
    questionBreakdown?: {
        type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
        count: number;
        marks: number;
    }[] | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    classLevel?: string | undefined;
    assignmentId?: string | undefined;
    userId?: string | undefined;
    uploadedContent?: string | undefined;
}, {
    title: string;
    institutionName?: string | undefined;
    studyMaterialUrl?: string | undefined;
    dueDate?: string | undefined;
    questionTypes?: ("mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following")[] | undefined;
    totalQuestions?: number | undefined;
    marksPerQuestion?: number | undefined;
    questionBreakdown?: {
        type: "mcq" | "short-answer" | "long-answer" | "true-false" | "fill-blanks" | "diagram-graph" | "numerical" | "match-following";
        count: number;
        marks: number;
    }[] | undefined;
    additionalInstructions?: string | undefined;
    difficultyPreference?: "easy" | "medium" | "hard" | undefined;
    classLevel?: string | undefined;
    assignmentId?: string | undefined;
    userId?: string | undefined;
    uploadedContent?: string | undefined;
}>;
export type GenerationJobPayload = z.infer<typeof generationJobPayloadSchema>;
//# sourceMappingURL=assignment.schema.d.ts.map