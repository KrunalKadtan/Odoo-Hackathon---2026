"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maintenance_controller_js_1 = require("./maintenance.controller.js");
const validate_middleware_js_1 = require("../../middlewares/validate.middleware.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const maintenance_schema_js_1 = require("./maintenance.schema.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
// All authenticated users can view and create
router.get('/', maintenance_controller_js_1.maintenanceController.getAll);
router.post('/', (0, validate_middleware_js_1.validate)(maintenance_schema_js_1.CreateMaintenanceSchema), maintenance_controller_js_1.maintenanceController.create);
// Only ADMIN and ASSET_MANAGER can approve/reject/complete
router.patch('/:id/approve', (0, auth_middleware_js_1.authorize)('ADMIN', 'ASSET_MANAGER'), maintenance_controller_js_1.maintenanceController.approve);
router.patch('/:id/reject', (0, auth_middleware_js_1.authorize)('ADMIN', 'ASSET_MANAGER'), maintenance_controller_js_1.maintenanceController.reject);
router.patch('/:id/complete', (0, auth_middleware_js_1.authorize)('ADMIN', 'ASSET_MANAGER'), maintenance_controller_js_1.maintenanceController.complete);
exports.default = router;
//# sourceMappingURL=maintenance.routes.js.map