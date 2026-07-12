"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetController = void 0;
const asset_service_js_1 = require("./asset.service.js");
exports.assetController = {
    async getAll(req, res, next) {
        try {
            const { search, status, category } = req.query;
            const assets = await asset_service_js_1.assetService.getAllAssets({
                search: search,
                status: status,
                category: category,
            });
            res.status(200).json({ status: 'success', data: assets });
        }
        catch (error) {
            next(error);
        }
    },
    async getOne(req, res, next) {
        try {
            const user = req.user;
            const asset = await asset_service_js_1.assetService.getAssetById(req.params.id, user);
            res.status(200).json({ status: 'success', data: asset });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const asset = await asset_service_js_1.assetService.createAsset(req.body);
            res.status(201).json({ status: 'success', data: asset });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const asset = await asset_service_js_1.assetService.updateAsset(req.params.id, req.body);
            res.status(200).json({ status: 'success', data: asset });
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            await asset_service_js_1.assetService.deleteAsset(req.params.id);
            res.status(204).json({ status: 'success', data: null });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=asset.controller.js.map