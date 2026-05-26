"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatedPaperSchema = exports.sectionSchema = exports.questionSchema = void 0;
const zod_1 = require("zod");
const assignment_schema_1 = require("./assignment.schema");
exports.questionSchema = zod_1.z.object({
    text: zod_1.z.string(),
    difficulty: assignment_schema_1.difficultyEnum,
    marks: zod_1.z.number().int().positive(),
});
exports.sectionSchema = zod_1.z.object({
    title: zod_1.z.string(),
    instruction: zod_1.z.string(),
    questions: zod_1.z.array(exports.questionSchema),
});
exports.generatedPaperSchema = zod_1.z.object({
    studentInfo: zod_1.z.object({
        name: zod_1.z.string().optional(),
        rollNumber: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
    }),
    sections: zod_1.z.array(exports.sectionSchema),
    totalMarks: zod_1.z.number().int().positive(),
    duration: zod_1.z.string().optional(),
});
//# sourceMappingURL=generated-paper.schema.js.map