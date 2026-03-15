import prisma from '../../common/services/prisma.service.js';
import { LoyaltyEngine } from '../reward/loyalty.engine.js';
import { TableQuery } from '../../common/utils/table-query.util.js';

export const getMembers = async (search, query = {}) => {
    const { skip, take, orderBy, where: tableWhere } = TableQuery.parseAll(query, {
        schemaMapping: {
            points: { type: 'number' },
            createdAt: { type: 'date' }
        }
    });

    const where = {
        AND: [
            {
                OR: [
                    { role: 'USER' },
                    { registrationType: 'MEMBER' }
                ]
            },
            tableWhere,
            ...(search ? [{
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                    { customerId: { contains: search, mode: 'insensitive' } }
                ]
            }] : [])
        ]
    };

    const [members, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            skip,
            take,
            orderBy: orderBy || { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                name: true,
                phone: true,
                email: true,
                points: true,
                dob: true,
                createdAt: true
            }
        }),
        prisma.user.count({ where })
    ]);

    return {
        status: 'success',
        members,
        pagination: {
            total,
            pageIndex: parseInt(query.pageIndex) || 0,
            pageSize: parseInt(query.pageSize) || 10,
            pageCount: Math.ceil(total / (parseInt(query.pageSize) || 10))
        }
    };
};

export const getMemberDetail = async (id) => {
    return await prisma.user.findFirst({
        where: { id },
        include: {
            posPointHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
            myTransactions: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { items: { include: { product: true } } }
            }
        }
    });
};

export const identifyMember = async (identifier) => {
    return await LoyaltyEngine.identifyMember(identifier);
};
