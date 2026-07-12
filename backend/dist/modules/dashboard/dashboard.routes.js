"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_js_1 = require("./dashboard.controller.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
router.get('/kpis', dashboard_controller_js_1.dashboardController.getStats);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map