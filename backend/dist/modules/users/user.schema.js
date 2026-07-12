"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UpdateUserRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE']),
});
//# sourceMappingURL=user.schema.js.map