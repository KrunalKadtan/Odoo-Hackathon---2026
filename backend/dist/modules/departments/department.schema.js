"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDepartmentSchema = void 0;
const zod_1 = require("zod");
exports.CreateDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Department name must be at least 2 characters'),
    headId: zod_1.z.string().uuid('Invalid user ID').optional().nullable(),
});
//# sourceMappingURL=department.schema.js.map