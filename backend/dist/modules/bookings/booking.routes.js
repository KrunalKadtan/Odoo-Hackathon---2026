"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_js_1 = require("./booking.controller.js");
const validate_middleware_js_1 = require("../../middlewares/validate.middleware.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const booking_schema_js_1 = require("./booking.schema.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
router.get('/', booking_controller_js_1.bookingController.getAll);
router.post('/', (0, validate_middleware_js_1.validate)(booking_schema_js_1.CreateBookingSchema), booking_controller_js_1.bookingController.create);
router.delete('/:id', booking_controller_js_1.bookingController.cancel);
exports.default = router;
//# sourceMappingURL=booking.routes.js.map