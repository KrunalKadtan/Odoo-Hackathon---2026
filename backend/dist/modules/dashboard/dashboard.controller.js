"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_js_1 = require("./dashboard.service.js");
exports.dashboardController = {
    getStats: async (req, res, next) => {
        try {
            const data = await dashboard_service_js_1.dashboardService.getDashboardData({
                id: req.user.id,
                role: req.user.role,
            });
            res.status(200).json({ status: 'success', data });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=dashboard.controller.js.map