"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocationController = void 0;
const allocation_service_js_1 = require("./allocation.service.js");
exports.allocationController = {
    async getAll(req, res, next) {
        try {
            const status = req.query.status;
            const user = req.user; // From authenticate middleware
            const allocations = await allocation_service_js_1.allocationService.getAllAllocations({ status }, user);
            res.json({ success: true, data: allocations });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const allocation = await allocation_service_js_1.allocationService.allocateAsset(req.body);
            res.status(201).json({ success: true, data: allocation });
        }
        catch (error) {
            next(error);
        }
    },
    async returnAsset(req, res, next) {
        try {
            const allocation = await allocation_service_js_1.allocationService.returnAsset(req.params.id);
            res.json({ success: true, data: allocation });
        }
        catch (error) {
            next(error);
        }
    },
    async requestTransfer(req, res, next) {
        try {
            const allocation = await allocation_service_js_1.allocationService.requestTransfer(req.params.id);
            res.json({ success: true, data: allocation });
        }
        catch (error) {
            next(error);
        }
    },
    async approveTransfer(req, res, next) {
        try {
            const allocation = await allocation_service_js_1.allocationService.approveTransfer(req.params.id, req.body);
            res.json({ success: true, data: allocation });
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=allocation.controller.js.map