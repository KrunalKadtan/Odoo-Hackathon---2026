"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMaintenanceStatusSchema = exports.CreateMaintenanceSchema = void 0;
const zod_1 = require("zod");
exports.CreateMaintenanceSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid('Asset ID must be a valid UUID'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
});
exports.UpdateMaintenanceStatusSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=maintenance.schema.js.map