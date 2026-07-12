"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asset_controller_js_1 = require("./asset.controller.js");
const validate_middleware_js_1 = require("../../middlewares/validate.middleware.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const asset_schema_js_1 = require("./asset.schema.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
router.get('/', asset_controller_js_1.assetController.getAll);
router.get('/:id', asset_controller_js_1.assetController.getOne);
// Protected routes (Admin and Asset Manager only)
router.use((0, auth_middleware_js_1.authorize)('ADMIN', 'ASSET_MANAGER'));
router.post('/', (0, validate_middleware_js_1.validate)(asset_schema_js_1.CreateAssetSchema), asset_controller_js_1.assetController.create);
router.patch('/:id', (0, validate_middleware_js_1.validate)(asset_schema_js_1.UpdateAssetSchema), asset_controller_js_1.assetController.update);
router.delete('/:id', asset_controller_js_1.assetController.delete);
exports.default = router;
//# sourceMappingURL=asset.routes.js.map