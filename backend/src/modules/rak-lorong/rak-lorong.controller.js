 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLorongs = async (req, res) => {
    try {
        const ownerId = _optionalChain([req, 'access', _ => _.user, 'optionalAccess', _2 => _2.ownerId]) || _optionalChain([req, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.id]); // Assuming auth middleware provides this
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

export const createLorong = async (req, res) => {
    try {
        const ownerId = _optionalChain([req, 'access', _5 => _5.user, 'optionalAccess', _6 => _6.ownerId]) || _optionalChain([req, 'access', _7 => _7.user, 'optionalAccess', _8 => _8.id]);
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

export const createRak = async (req, res) => {
    try {
        const ownerId = _optionalChain([req, 'access', _9 => _9.user, 'optionalAccess', _10 => _10.ownerId]) || _optionalChain([req, 'access', _11 => _11.user, 'optionalAccess', _12 => _12.id]);
        if (!ownerId) return res.status(403).json({ message: 'Unauthorized' });

        const lorongId = req.params.lorongId ;
        const { name, description, categoryIds } = req.body;

        const rak = await prisma.rak.create({
            data: {
                lorongId,
                name,
                description,
                categories: {
                    create: (categoryIds || []).map((id) => ({ categoryId: id }))
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

export const deleteLorong = async (req, res) => {
    try {
        const ownerId = _optionalChain([req, 'access', _13 => _13.user, 'optionalAccess', _14 => _14.ownerId]) || _optionalChain([req, 'access', _15 => _15.user, 'optionalAccess', _16 => _16.id]);
        if (!ownerId) return res.status(403).json({ message: 'Unauthorized' });

        const id = req.params.id ;

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

export const deleteRak = async (req, res) => {
    try {
        const id = req.params.id ;
        await prisma.rak.delete({
            where: { id }
        });
        res.status(200).json({ status: 'success', message: 'Rak deleted' });
    } catch (error) {
        console.error('Error deleting rak:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete rak' });
    }
};
