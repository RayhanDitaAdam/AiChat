import type { Request, Response } from 'express';
import { BuildingService } from './building.service.js';

const buildingService = new BuildingService();

export class BuildingController {
    async createSubLocation(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await buildingService.createSubLocation(req.user.ownerId, req.body);
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getSubLocations(req: Request, res: Response) {
        try {
            const ownerId = (req.params.ownerId as string) || req.user?.ownerId || req.user?.memberOfId;
            if (!ownerId) {
                return res.status(400).json({ status: 'error', message: 'Owner ID missing' });
            }
            const result = await buildingService.getSubLocations(ownerId);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateSubLocation(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const { id } = req.params;
            const result = await buildingService.updateSubLocation(id as string, req.user.ownerId, req.body);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async deleteSubLocation(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const { id } = req.params;
            const result = await buildingService.deleteSubLocation(id as string, req.user.ownerId);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
