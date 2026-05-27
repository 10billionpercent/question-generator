"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatedPaperSchema = exports.studentInfoSchema = exports.sectionSchema = exports.questionSchema = void 0;
const zod_1 = require("zod");
exports.questionSchema = zod_1.z.object({
    text: zod_1.z.string(),
    difficulty: zod_1.z.enum(["Easy", "Medium", "Difficult"]),
    marks: zod_1.z.number().positive(),
    answerHint: zod_1.z.string().optional(),
});
exports.sectionSchema = zod_1.z.object({
    title: zod_1.z.string(),
    type: zod_1.z.string(),
    instruction: zod_1.z.string(),
    questions: zod_1.z.array(exports.questionSchema),
});
// Student info structure (just placeholders)
exports.studentInfoSchema = zod_1.z.object({
    name: zod_1.z.string().optional().default(""),
    rollNumber: zod_1.z.string().optional().default(""),
    classSection: zod_1.z.string().optional().default(""),
});
exports.generatedPaperSchema = zod_1.z.object({
    subject: zod_1.z.string(),
    classLevel: zod_1.z.string(),
    timeAllowed: zod_1.z.string(),
    maxMarks: zod_1.z.number(),
    compulsoryNote: zod_1.z.string(),
    sections: zod_1.z.array(exports.sectionSchema),
    studentInfo: exports.studentInfoSchema.optional().default({}),
    totalMarks: zod_1.z.number().optional(),
    duration: zod_1.z.string().optional(),
    pdfUrl: zod_1.z.string().optional(),
    institutionName: zod_1.z.string().optional(),
});
//# sourceMappingURL=generated-paper.schema.js.map