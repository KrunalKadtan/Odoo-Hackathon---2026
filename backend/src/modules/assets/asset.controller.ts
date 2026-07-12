import { Request, Response, NextFunction } from 'express';
import { assetService } from './asset.service.js';

export const assetController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, category } = req.query;
      const assets = await assetService.getAllAssets({
        search: search as string,
        status: status as string,
        category: category as string,
      });
      res.status(200).json({ status: 'success', data: assets });
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const asset = await assetService.getAssetById(req.params.id as string, user);
      res.status(200).json({ status: 'success', data: asset });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.createAsset(req.body);
      res.status(201).json({ status: 'success', data: asset });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.updateAsset(req.params.id as string, req.body);
      res.status(200).json({ status: 'success', data: asset });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await assetService.deleteAsset(req.params.id as string);
      res.status(204).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  },
};
