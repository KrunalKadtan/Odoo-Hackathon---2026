"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAssetSchema = exports.CreateAssetSchema = void 0;
const zod_1 = require("zod");
exports.CreateAssetSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Asset name must be at least 2 characters'),
    category: zod_1.z.string().min(2, 'Category is required'),
    serialNo: zod_1.z.string().optional().nullable(),
    purchaseDate: zod_1.z.string().datetime().optional().nullable(),
    value: zod_1.z.number().nonnegative().optional().nullable(),
    departmentId: zod_1.z.string().uuid().optional().nullable(),
});
exports.UpdateAssetSchema = exports.CreateAssetSchema.partial().extend({
    status: zod_1.z.enum(['AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'LOST', 'DISPOSED']).optional(),
});
//# sourceMappingURL=asset.schema.js.map