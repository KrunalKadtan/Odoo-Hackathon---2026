import { Request, Response, NextFunction } from 'express';
import { bookingService } from './booking.service.js';

export const bookingController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const resourceId = req.query.resourceId as string;
      const date = req.query.date as string;
      const bookings = await bookingService.getAllBookings({ resourceId, date });
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.createBooking(req.body);
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.cancelBooking(req.params.id as string);
      res.json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }
};
