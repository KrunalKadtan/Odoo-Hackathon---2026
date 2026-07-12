"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditController = void 0;
const audit_service_js_1 = require("./audit.service.js");
exports.auditController = {
    async getAll(req, res, next) {
        try {
            const cycles = await audit_service_js_1.auditService.getAllCycles();
            res.status(200).json({ status: 'success', data: cycles });
        }
        catch (error) {
            next(error);
        }
    },
    async getOne(req, res, next) {
        try {
            const cycle = await audit_service_js_1.auditService.getCycleById(req.params.id);
            res.status(200).json({ status: 'success', data: cycle });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const cycle = await audit_service_js_1.auditService.createCycle(req.body.name);
            res.status(201).json({ status: 'success', data: cycle });
        }
        catch (error) {
            next(error);
        }
    },
    async updateItem(req, res, next) {
        try {
            const { id, itemId } = req.params;
            const item = await audit_service_js_1.auditService.updateItem(id, itemId, req.body.status);
            res.status(200).json({ status: 'success', data: item });
        }
        catch (error) {
            next(error);
        }
    },
    async close(req, res, next) {
        try {
            const cycle = await audit_service_js_1.auditService.closeCycle(req.params.id);
            res.status(200).json({ status: 'success', data: cycle });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=audit.controller.js.map