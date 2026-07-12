"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_js_1 = require("./department.controller.js");
const validate_middleware_js_1 = require("../../middlewares/validate.middleware.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const department_schema_js_1 = require("./department.schema.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
router.get('/', department_controller_js_1.departmentController.getAll);
router.post('/', (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(department_schema_js_1.CreateDepartmentSchema), department_controller_js_1.departmentController.create);
router.patch('/:id', (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(department_schema_js_1.UpdateDepartmentSchema), department_controller_js_1.departmentController.update);
exports.default = router;
//# sourceMappingURL=department.routes.js.map