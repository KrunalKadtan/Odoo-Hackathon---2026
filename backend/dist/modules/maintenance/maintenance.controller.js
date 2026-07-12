"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceController = void 0;
const maintenance_service_js_1 = require("./maintenance.service.js");
exports.maintenanceController = {
    async getAll(req, res, next) {
        try {
            const user = req.user;
            const requests = await maintenance_service_js_1.maintenanceService.getAllRequests(user);
            res.status(200).json({ status: 'success', data: requests });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const user = req.user;
            const request = await maintenance_service_js_1.maintenanceService.createRequest(req.body, user.id);
            res.status(201).json({ status: 'success', data: request });
        }
        catch (error) {
            next(error);
        }
    },
    async approve(req, res, next) {
        try {
            const user = req.user;
            const request = await maintenance_service_js_1.maintenanceService.approveRequest(req.params.id, user.id);
            res.status(200).json({ status: 'success', data: request });
        }
        catch (error) {
            next(error);
        }
    },
    async reject(req, res, next) {
        try {
            const user = req.user;
            const request = await maintenance_service_js_1.maintenanceService.rejectRequest(req.params.id, user.id);
            res.status(200).json({ status: 'success', data: request });
        }
        catch (error) {
            next(error);
        }
    },
    async complete(req, res, next) {
        try {
            const user = req.user;
            const request = await maintenance_service_js_1.maintenanceService.completeRequest(req.params.id, user.id);
            res.status(200).json({ status: 'success', data: request });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=maintenance.controller.js.map