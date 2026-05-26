import { z } from "zod";
export declare const questionSchema: z.ZodObject<{
    text: z.ZodString;
    difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
    marks: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    text: string;
    difficulty: "easy" | "medium" | "hard";
    marks: number;
}, {
    text: string;
    difficulty: "easy" | "medium" | "hard";
    marks: number;
}>;
export type Question = z.infer<typeof questionSchema>;
export declare const sectionSchema: z.ZodObject<{
    title: z.ZodString;
    instruction: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
        marks: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        text: string;
        difficulty: "easy" | "medium" | "hard";
        marks: number;
    }, {
        text: string;
        difficulty: "easy" | "medium" | "hard";
        marks: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    instruction: string;
    questions: {
        text: string;
        difficulty: "easy" | "medium" | "hard";
        marks: number;
    }[];
}, {
    title: string;
    instruction: string;
    questions: {
        text: string;
        difficulty: "easy" | "medium" | "hard";
        marks: number;
    }[];
}>;
export type Section = z.infer<typeof sectionSchema>;
export declare const generatedPaperSchema: z.ZodObject<{
    studentInfo: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        rollNumber: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date?: string | undefined;
        name?: string | undefined;
        rollNumber?: string | undefined;
    }, {
        date?: string | undefined;
        name?: string | undefined;
        rollNumber?: string | undefined;
    }>;
    sections: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        instruction: z.ZodString;
        questions: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
            marks: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            text: string;
            difficulty: "easy" | "medium" | "hard";
            marks: number;
        }, {
            text: string;
            difficulty: "easy" | "medium" | "hard";
            marks: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        instruction: string;
        questions: {
            text: string;
            difficulty: "easy" | "medium" | "hard";
            marks: number;
        }[];
    }, {
        title: string;
        instruction: string;
        questions: {
            text: string;
            difficulty: "easy" | "medium" | "hard";
            marks: number;
        }[];
    }>, "many">;
    totalMarks: z.ZodNumber;
    duration: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    studentInfo: {
        date?: string | undefined;
        name?: string | undefined;
        rollNumber?: string | undefined;
    };
    sections: {
        title: string;
        instruction: string;
        questions: {
            text: string;
            difficulty: "easy" | "medium" | "hard";
            marks: number;
        }[];
    }[];
    totalMarks: number;
    duration?: string | undefined;
}, {
    studentInfo: {
        date?: string | undefined;
        name?: string | undefined;
        rollNumber?: string | undefined;
    };
    sections: {
        title: string;
        instruction: string;
        questions: {
            text: string;
            difficulty: "easy" | "medium" | "hard";
            marks: number;
        }[];
    }[];
    totalMarks: number;
    duration?: string | undefined;
}>;
export type GeneratedPaper = z.infer<typeof generatedPaperSchema>;
//# sourceMappingURL=generated-paper.schema.d.ts.map