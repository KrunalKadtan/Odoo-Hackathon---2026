"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveTransferSchema = exports.CreateAllocationSchema = void 0;
const zod_1 = require("zod");
exports.CreateAllocationSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid('Invalid asset ID'),
    userId: zod_1.z.string().uuid('Invalid user ID'),
});
exports.ApproveTransferSchema = zod_1.z.object({
    newUserId: zod_1.z.string().uuid('Invalid user ID'),
});
//# sourceMappingURL=allocation.schema.js.map