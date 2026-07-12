import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { CreateBookingInput } from './booking.schema.js';
import { Prisma } from '@prisma/client';

export const bookingService = {
  async getAllBookings(query: { resourceId?: string; date?: string }) {
    const where: Prisma.BookingWhereInput = {
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

    return prisma.booking.findMany({
      where,
      include: {
        resource: { select: { id: true, name: true, category: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  },

  async createBooking(data: CreateBookingInput) {
    const resource = await prisma.asset.findUnique({ where: { id: data.resourceId } });
    if (!resource) throw new AppError('Resource not found', 404);
    if (resource.status !== 'AVAILABLE') throw new AppError('Resource is not available for booking', 422);

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new AppError('User not found', 404);

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    // Use a serializable transaction to prevent race conditions when checking overlaps
    return prisma.$transaction(async (tx) => {
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
        throw new AppError('The resource is already booked during this time slot', 409);
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

  async cancelBooking(id: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status === 'CANCELLED') throw new AppError('Booking already cancelled', 400);

    return prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  },
};
