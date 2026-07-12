"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const validate_middleware_js_1 = require("../../middlewares/validate.middleware.js");
const auth_schema_js_1 = require("./auth.schema.js");
const router = (0, express_1.Router)();
router.post('/signup', (0, validate_middleware_js_1.validate)(auth_schema_js_1.SignupSchema), auth_controller_js_1.authController.signup);
router.post('/login', (0, validate_middleware_js_1.validate)(auth_schema_js_1.LoginSchema), auth_controller_js_1.authController.login);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map