import { z } from "zod";
export declare const questionSchema: z.ZodObject<{
    text: z.ZodString;
    difficulty: z.ZodEnum<["Easy", "Medium", "Difficult"]>;
    marks: z.ZodNumber;
    answerHint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text: string;
    difficulty: "Easy" | "Medium" | "Difficult";
    marks: number;
    answerHint?: string | undefined;
}, {
    text: string;
    difficulty: "Easy" | "Medium" | "Difficult";
    marks: number;
    answerHint?: string | undefined;
}>;
export declare const sectionSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodString;
    instruction: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        difficulty: z.ZodEnum<["Easy", "Medium", "Difficult"]>;
        marks: z.ZodNumber;
        answerHint: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        difficulty: "Easy" | "Medium" | "Difficult";
        marks: number;
        answerHint?: string | undefined;
    }, {
        text: string;
        difficulty: "Easy" | "Medium" | "Difficult";
        marks: number;
        answerHint?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: string;
    title: string;
    instruction: string;
    questions: {
        text: string;
        difficulty: "Easy" | "Medium" | "Difficult";
        marks: number;
        answerHint?: string | undefined;
    }[];
}, {
    type: string;
    title: string;
    instruction: string;
    questions: {
        text: string;
        difficulty: "Easy" | "Medium" | "Difficult";
        marks: number;
        answerHint?: string | undefined;
    }[];
}>;
export declare const studentInfoSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    rollNumber: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    classSection: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    rollNumber: string;
    classSection: string;
}, {
    name?: string | undefined;
    rollNumber?: string | undefined;
    classSection?: string | undefined;
}>;
export declare const generatedPaperSchema: z.ZodObject<{
    subject: z.ZodString;
    classLevel: z.ZodString;
    timeAllowed: z.ZodString;
    maxMarks: z.ZodNumber;
    compulsoryNote: z.ZodString;
    sections: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        type: z.ZodString;
        instruction: z.ZodString;
        questions: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            difficulty: z.ZodEnum<["Easy", "Medium", "Difficult"]>;
            marks: z.ZodNumber;
            answerHint: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            difficulty: "Easy" | "Medium" | "Difficult";
            marks: number;
            answerHint?: string | undefined;
        }, {
            text: string;
            difficulty: "Easy" | "Medium" | "Difficult";
            marks: number;
            answerHint?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: string;
        title: string;
        instruction: string;
        questions: {
            text: string;
            difficulty: "Easy" | "Medium" | "Difficult";
            marks: number;
            answerHint?: string | undefined;
        }[];
    }, {
        type: string;
        title: string;
        instruction: string;
        questions: {
            text: string;
            difficulty: "Easy" | "Medium" | "Difficult";
            marks: number;
            answerHint?: string | undefined;
        }[];
    }>, "many">;
    studentInfo: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        rollNumber: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        classSection: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        rollNumber: string;
        classSection: string;
    }, {
        name?: string | undefined;
        rollNumber?: string | undefined;
        classSection?: string | undefined;
    }>>>;
    totalMarks: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodString>;
    pdfUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    subject: string;
    classLevel: string;
    timeAllowed: string;
    maxMarks: number;
    compulsoryNote: string;
    sections: {
        type: string;
        title: string;
        instruction: string;
        questions: {
            text: string;
            difficulty: "Easy" | "Medium" | "Difficult";
            marks: number;
            answerHint?: string | undefined;
        }[];
    }[];
    studentInfo: {
        name: string;
        rollNumber: string;
        classSection: string;
    };
    totalMarks?: number | undefined;
    duration?: string | undefined;
    pdfUrl?: string | undefined;
}, {
    subject: string;
    classLevel: string;
    timeAllowed: string;
    maxMarks: number;
    compulsoryNote: string;
    sections: {
        type: string;
        title: string;
        instruction: string;
        questions: {
            text: string;
            difficulty: "Easy" | "Medium" | "Difficult";
            marks: number;
            answerHint?: string | undefined;
        }[];
    }[];
    studentInfo?: {
        name?: string | undefined;
        rollNumber?: string | undefined;
        classSection?: string | undefined;
    } | undefined;
    totalMarks?: number | undefined;
    duration?: string | undefined;
    pdfUrl?: string | undefined;
}>;
export type GeneratedPaper = z.infer<typeof generatedPaperSchema>;
//# sourceMappingURL=generated-paper.schema.d.ts.map