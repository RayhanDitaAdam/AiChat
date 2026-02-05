import { prisma } from '../../common/services/prisma.service.js';

export class BuildingService {
    async createSubLocation(ownerId: string, data: any) {
        const subLocation = await (prisma as any).subLocation.create({
            data: {
                ...data,
                ownerId,
            }
        });

        return {
            status: 'success',
            message: 'Sub-location created successfully',
            subLocation
        };
    }

    async getSubLocations(ownerId: string) {
        const subLocations = await (prisma as any).subLocation.findMany({
            where: { ownerId },
            include: {
                _count: {
                    select: { tasks: true }
                }
            }
        });

        return {
            status: 'success',
            subLocations
        };
    }

    async updateSubLocation(id: string, ownerId: string, data: any) {
        const existing = await (prisma as any).subLocation.findFirst({
            where: { id, ownerId }
        });

        if (!existing) {
            throw new Error('Sub-location not found or access denied');
        }

        const subLocation = await (prisma as any).subLocation.update({
            where: { id },
            data
        });

        return {
            status: 'success',
            message: 'Sub-location updated successfully',
            subLocation
        };
    }

    async deleteSubLocation(id: string, ownerId: string) {
        const existing = await (prisma as any).subLocation.findFirst({
            where: { id, ownerId }
        });

        if (!existing) {
            throw new Error('Sub-location not found or access denied');
        }

        await (prisma as any).subLocation.delete({
            where: { id }
        });

        return {
            status: 'success',
            message: 'Sub-location deleted successfully'
        };
    }
}
