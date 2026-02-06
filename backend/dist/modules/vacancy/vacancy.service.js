import { prisma } from '../../common/services/prisma.service.js';
export class VacancyService {
    async createVacancy(ownerId, data) {
        const vacancy = await prisma.jobVacancy.create({
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
    async getVacancies(ownerId) {
        const vacancies = await prisma.jobVacancy.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' }
        });
        return {
            status: 'success',
            vacancies
        };
    }
    async getAllPublicVacancies() {
        const vacancies = await prisma.jobVacancy.findMany({
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
    async updateVacancy(id, ownerId, data) {
        const existing = await prisma.jobVacancy.findFirst({
            where: { id, ownerId }
        });
        if (!existing) {
            throw new Error('Vacancy not found or access denied');
        }
        const vacancy = await prisma.jobVacancy.update({
            where: { id },
            data
        });
        return {
            status: 'success',
            message: 'Vacancy updated successfully',
            vacancy
        };
    }
    async deleteVacancy(id, ownerId) {
        const existing = await prisma.jobVacancy.findFirst({
            where: { id, ownerId }
        });
        if (!existing) {
            throw new Error('Vacancy not found or access denied');
        }
        await prisma.jobVacancy.delete({
            where: { id }
        });
        return {
            status: 'success',
            message: 'Vacancy deleted successfully'
        };
    }
}
//# sourceMappingURL=vacancy.service.js.map