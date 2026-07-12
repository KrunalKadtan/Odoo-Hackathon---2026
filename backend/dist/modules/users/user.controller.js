"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_js_1 = require("./user.service.js");
exports.userController = {
    async getAll(req, res, next) {
        try {
            const users = await user_service_js_1.userService.getAllUsers();
            res.status(200).json({ status: 'success', data: users });
        }
        catch (error) {
            next(error);
        }
    },
    async updateRole(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_js_1.userService.updateUserRole(id, req.body);
            res.status(200).json({ status: 'success', data: user });
        }
        catch (error) {
            next(error);
        }
    },
    async updateDepartment(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_js_1.userService.updateUserDepartment(id, req.body);
            res.status(200).json({ status: 'success', data: user });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=user.controller.js.map