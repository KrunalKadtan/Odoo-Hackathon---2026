"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const AppError_js_1 = require("../../utils/AppError.js");
exports.bookingService = {
    async getAllBookings(query) {
        const where = {
            status: 'CONFIRMED'
        };
        if (query.resourceId) {
            where.resourceId = query.resourceId;
        }
        if (query.date) {
            const startDate = new Date(query.date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(query.date);
            endDate.setHours(23, 59, 59, 999);
            where.startTime = {
                gte: startDate,
                lte: endDate,
            };
        }
        return prisma_js_1.prisma.booking.findMany({
            where,
            include: {
                resource: { select: { id: true, name: true, category: true } },
                user: { select: { id: true, name: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    },
    async createBooking(data) {
        const resource = await prisma_js_1.prisma.asset.findUnique({ where: { id: data.resourceId } });
        if (!resource)
            throw new AppError_js_1.AppError('Resource not found', 404);
        if (resource.status !== 'AVAILABLE')
            throw new AppError_js_1.AppError('Resource is not available for booking', 422);
        const user = await prisma_js_1.prisma.user.findUnique({ where: { id: data.userId } });
        if (!user)
            throw new AppError_js_1.AppError('User not found', 404);
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        // Use a serializable transaction to prevent race conditions when checking overlaps
        return prisma_js_1.prisma.$transaction(async (tx) => {
            // Check for overlapping bookings
            const overlapping = await tx.booking.findFirst({
                where: {
                    resourceId: data.resourceId,
                    status: 'CONFIRMED',
                    OR: [
                        {
                            // New booking starts inside an existing booking
                            startTime: { lte: start },
                            endTime: { gt: start }
                        },
                        {
                            // New booking ends inside an existing booking
                            startTime: { lt: end },
                            endTime: { gte: end }
                        },
                        {
                            // New booking completely surrounds an existing booking
                            startTime: { gte: start },
                            endTime: { lte: end }
                        }
                    ]
                }
            });
            if (overlapping) {
                throw new AppError_js_1.AppError('The resource is already booked during this time slot', 409);
            }
            return tx.booking.create({
                data: {
                    resourceId: data.resourceId,
                    userId: data.userId,
                    startTime: start,
                    endTime: end,
                    status: 'CONFIRMED',
                },
                include: {
                    resource: true,
                    user: true,
                },
            });
        }, {
            isolationLevel: 'Serializable', // Prevents race conditions mathematically
        });
    },
    async cancelBooking(id) {
        const booking = await prisma_js_1.prisma.booking.findUnique({ where: { id } });
        if (!booking)
            throw new AppError_js_1.AppError('Booking not found', 404);
        if (booking.status === 'CANCELLED')
            throw new AppError_js_1.AppError('Booking already cancelled', 400);
        return prisma_js_1.prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    },
};
//# sourceMappingURL=booking.service.js.map