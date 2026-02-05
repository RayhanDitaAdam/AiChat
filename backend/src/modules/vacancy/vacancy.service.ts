import { prisma } from '../../common/services/prisma.service.js';
import type { CreateVacancyInput, UpdateVacancyInput } from './vacancy.schema.js';

export class VacancyService {
    async createVacancy(ownerId: string, data: CreateVacancyInput) {
        const vacancy = await (prisma as any).jobVacancy.create({
            data: {
                ...data,
                ownerId,
            }
        });

        return {
            status: 'success',
            message: 'Job vacancy posted successfully',
            vacancy
        };
    }

    async getVacancies(ownerId: string) {
        const vacancies = await (prisma as any).jobVacancy.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' }
        });

        return {
            status: 'success',
            vacancies
        };
    }

    async getAllPublicVacancies() {
        const vacancies = await (prisma as any).jobVacancy.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                owner: {
                    select: { name: true, domain: true }
                }
            }
        });

        return {
            status: 'success',
            vacancies
        };
    }

    async updateVacancy(id: string, ownerId: string, data: UpdateVacancyInput) {
        const existing = await (prisma as any).jobVacancy.findFirst({
            where: { id, ownerId }
        });

        if (!existing) {
            throw new Error('Vacancy not found or access denied');
        }

        const vacancy = await (prisma as any).jobVacancy.update({
            where: { id },
            data
        });

        return {
            status: 'success',
            message: 'Vacancy updated successfully',
            vacancy
        };
    }

    async deleteVacancy(id: string, ownerId: string) {
        const existing = await (prisma as any).jobVacancy.findFirst({
            where: { id, ownerId }
        });

        if (!existing) {
            throw new Error('Vacancy not found or access denied');
        }

        await (prisma as any).jobVacancy.delete({
            where: { id }
        });

        return {
            status: 'success',
            message: 'Vacancy deleted successfully'
        };
    }
}
