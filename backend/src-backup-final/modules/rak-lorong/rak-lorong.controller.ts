import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLorongs = async (req: Request, res: Response) => {
    try {
        const ownerId = req.user?.ownerId || req.user?.id; // Assuming auth middleware provides this
        if (!ownerId) return res.status(403).json({ message: 'Unauthorized' });

        const lorongs = await prisma.lorong.findMany({
            where: { ownerId },
            include: {
                raks: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({ status: 'success', data: lorongs });
    } catch (error) {
        console.error('Error fetching lorongs:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch lorongs' });
    }
};

export const createLorong = async (req: Request, res: Response) => {
    try {
        const ownerId = req.user?.ownerId || req.user?.id;
        if (!ownerId) return res.status(403).json({ message: 'Unauthorized' });

        const { name, description } = req.body;

        const lorong = await prisma.lorong.create({
            data: {
                ownerId,
                name,
                description
            }
        });
        res.status(201).json({ status: 'success', data: lorong });
    } catch (error) {
        console.error('Error creating lorong:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create lorong' });
    }
};

export const createRak = async (req: Request, res: Response) => {
    try {
        const ownerId = req.user?.ownerId || req.user?.id;
        if (!ownerId) return res.status(403).json({ message: 'Unauthorized' });

        const lorongId = req.params.lorongId as string;
        const { name, description, categoryIds } = req.body;

        const rak = await prisma.rak.create({
            data: {
                lorongId,
                name,
                description,
                categories: {
                    create: (categoryIds || []).map((id: string) => ({ categoryId: id }))
                }
            },
            include: {
                categories: { include: { category: true } }
            }
        });
        res.status(201).json({ status: 'success', data: rak });
    } catch (error) {
        console.error('Error creating rak:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create rak' });
    }
};

export const deleteLorong = async (req: Request, res: Response) => {
    try {
        const ownerId = req.user?.ownerId || req.user?.id;
        if (!ownerId) return res.status(403).json({ message: 'Unauthorized' });

        const id = req.params.id as string;

        const lorong = await prisma.lorong.findUnique({ where: { id } });
        if (!lorong || lorong.ownerId !== ownerId) {
            return res.status(404).json({ message: 'Lorong not found or unauthorized' });
        }

        await prisma.lorong.delete({
            where: { id }
        });
        res.status(200).json({ status: 'success', message: 'Lorong deleted' });
    } catch (error) {
        console.error('Error deleting lorong:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete lorong' });
    }
};

export const deleteRak = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.rak.delete({
            where: { id }
        });
        res.status(200).json({ status: 'success', message: 'Rak deleted' });
    } catch (error) {
        console.error('Error deleting rak:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete rak' });
    }
};
