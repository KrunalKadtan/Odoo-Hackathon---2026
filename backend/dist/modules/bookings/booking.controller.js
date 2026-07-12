"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const booking_service_js_1 = require("./booking.service.js");
exports.bookingController = {
    async getAll(req, res, next) {
        try {
            const resourceId = req.query.resourceId;
            const date = req.query.date;
            const bookings = await booking_service_js_1.bookingService.getAllBookings({ resourceId, date });
            res.json({ success: true, data: bookings });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const booking = await booking_service_js_1.bookingService.createBooking(req.body);
            res.status(201).json({ success: true, data: booking });
        }
        catch (error) {
            next(error);
        }
    },
    async cancel(req, res, next) {
        try {
            const booking = await booking_service_js_1.bookingService.cancelBooking(req.params.id);
            res.json({ success: true, data: booking });
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=booking.controller.js.map