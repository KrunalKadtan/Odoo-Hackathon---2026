"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDepartmentSchema = exports.UpdateUserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UpdateUserRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['EMPLOYEE', 'DEPT_HEAD', 'ASSET_MANAGER', 'ADMIN']),
});
exports.UpdateUserDepartmentSchema = zod_1.z.object({
    departmentId: zod_1.z.string().uuid().nullable().optional(),
});
//# sourceMappingURL=user.schema.js.map