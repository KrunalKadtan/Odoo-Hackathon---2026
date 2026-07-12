"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAuditItemSchema = exports.CreateAuditCycleSchema = void 0;
const zod_1 = require("zod");
exports.CreateAuditCycleSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Audit cycle name must be at least 3 characters'),
});
exports.UpdateAuditItemSchema = zod_1.z.object({
    status: zod_1.z.enum(['VERIFIED', 'MISSING']),
});
//# sourceMappingURL=audit.schema.js.map