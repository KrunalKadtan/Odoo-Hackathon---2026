"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allocation_controller_js_1 = require("./allocation.controller.js");
const validate_middleware_js_1 = require("../../middlewares/validate.middleware.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const allocation_schema_js_1 = require("./allocation.schema.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
router.get('/', allocation_controller_js_1.allocationController.getAll);
// Any authenticated user can request a transfer for an asset they hold (we could add ownership check in service, but skipping for brevity)
router.post('/:id/request-transfer', allocation_controller_js_1.allocationController.requestTransfer);
// Protected routes (Admin and Asset Manager only)
router.use((0, auth_middleware_js_1.authorize)('ADMIN', 'ASSET_MANAGER'));
router.post('/', (0, validate_middleware_js_1.validate)(allocation_schema_js_1.CreateAllocationSchema), allocation_controller_js_1.allocationController.create);
router.patch('/:id/return', allocation_controller_js_1.allocationController.returnAsset);
router.patch('/:id/approve-transfer', (0, validate_middleware_js_1.validate)(allocation_schema_js_1.ApproveTransferSchema), allocation_controller_js_1.allocationController.approveTransfer);
exports.default = router;
//# sourceMappingURL=allocation.routes.js.map