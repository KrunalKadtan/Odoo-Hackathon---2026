"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingSchema = void 0;
const zod_1 = require("zod");
exports.CreateBookingSchema = zod_1.z.object({
    resourceId: zod_1.z.string().uuid('Invalid resource ID'),
    userId: zod_1.z.string().uuid('Invalid user ID'),
    startTime: zod_1.z.string().datetime('Invalid start time'),
    endTime: zod_1.z.string().datetime('Invalid end time'),
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
    message: 'End time must be after start time',
    path: ['endTime']
});
//# sourceMappingURL=booking.schema.js.map