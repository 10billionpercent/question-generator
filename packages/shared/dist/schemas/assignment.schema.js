"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generationJobPayloadSchema = exports.assignmentFormSchema = exports.questionBreakdownItemSchema = exports.questionTypeEnum = exports.difficultyEnum = void 0;
const zod_1 = require("zod");
exports.difficultyEnum = zod_1.z.enum(["easy", "medium", "hard"]);
exports.questionTypeEnum = zod_1.z.enum([
    "mcq",
    "short-answer",
    "long-answer",
    "true-false",
    "fill-blanks",
]);
exports.questionBreakdownItemSchema = zod_1.z.object({
    type: exports.questionTypeEnum,
    count: zod_1.z.coerce.number().int().positive(),
    marks: zod_1.z.coerce.number().int().positive(),
});
exports.assignmentFormSchema = zod_1.z.object({
    institutionName: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1, "Title required"),
    studyMaterialUrl: zod_1.z.string().url().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    // Old flat fields (keep for backwards compatibility)
    questionTypes: zod_1.z.array(exports.questionTypeEnum).min(1).optional(),
    totalQuestions: zod_1.z.coerce.number().int().positive().optional(),
    marksPerQuestion: zod_1.z.coerce.number().int().positive().optional(),
    // New detailed breakdown
    questionBreakdown: zod_1.z.array(exports.questionBreakdownItemSchema).min(1).optional(),
    additionalInstructions: zod_1.z.string().optional(),
    difficultyPreference: exports.difficultyEnum.optional(),
    classLevel: zod_1.z.string().optional(),
});
exports.generationJobPayloadSchema = exports.assignmentFormSchema.extend({
    assignmentId: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    uploadedContent: zod_1.z.string().optional(), // extracted text from PDF/txt
});
//# sourceMappingURL=assignment.schema.js.map