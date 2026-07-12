"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_js_1 = require("./audit.controller.js");
const validate_middleware_js_1 = require("../../middlewares/validate.middleware.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const audit_schema_js_1 = require("./audit.schema.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
// All authenticated users can view cycles
router.get('/', audit_controller_js_1.auditController.getAll);
router.get('/:id', audit_controller_js_1.auditController.getOne);
// Only ADMIN can create and close cycles
router.post('/', (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(audit_schema_js_1.CreateAuditCycleSchema), audit_controller_js_1.auditController.create);
router.patch('/:id/close', (0, auth_middleware_js_1.authorize)('ADMIN'), audit_controller_js_1.auditController.close);
// Only ADMIN and ASSET_MANAGER can mark items
router.patch('/:id/items/:itemId', (0, auth_middleware_js_1.authorize)('ADMIN', 'ASSET_MANAGER'), (0, validate_middleware_js_1.validate)(audit_schema_js_1.UpdateAuditItemSchema), audit_controller_js_1.auditController.updateItem);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map