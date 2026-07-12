"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_js_1 = require("./middlewares/error.middleware.js");
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const department_routes_js_1 = __importDefault(require("./modules/departments/department.routes.js"));
const user_routes_js_1 = __importDefault(require("./modules/users/user.routes.js"));
const asset_routes_js_1 = __importDefault(require("./modules/assets/asset.routes.js"));
const allocation_routes_js_1 = __importDefault(require("./modules/allocations/allocation.routes.js"));
const booking_routes_js_1 = __importDefault(require("./modules/bookings/booking.routes.js"));
const maintenance_routes_js_1 = __importDefault(require("./modules/maintenance/maintenance.routes.js"));
const audit_routes_js_1 = __importDefault(require("./modules/audits/audit.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./modules/dashboard/dashboard.routes.js"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1/auth', auth_routes_js_1.default);
app.use('/api/v1/departments', department_routes_js_1.default);
app.use('/api/v1/users', user_routes_js_1.default);
app.use('/api/v1/assets', asset_routes_js_1.default);
app.use('/api/v1/allocations', allocation_routes_js_1.default);
app.use('/api/v1/bookings', booking_routes_js_1.default);
app.use('/api/v1/maintenance', maintenance_routes_js_1.default);
app.use('/api/v1/audits', audit_routes_js_1.default);
app.use('/api/v1/dashboard', dashboard_routes_js_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use(error_middleware_js_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map