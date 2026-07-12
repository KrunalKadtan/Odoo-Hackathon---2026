"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_js_1 = require("./user.controller.js");
const validate_middleware_js_1 = require("../../middlewares/validate.middleware.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const user_schema_js_1 = require("./user.schema.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
router.get('/', user_controller_js_1.userController.getAll);
router.patch('/:id/role', (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(user_schema_js_1.UpdateUserRoleSchema), user_controller_js_1.userController.updateRole);
exports.default = router;
//# sourceMappingURL=user.routes.js.map