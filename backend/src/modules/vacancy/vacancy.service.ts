import { prisma } from '../../common/services/prisma.service.js';
import type { CreateVacancyInput, UpdateVacancyInput } from './vacancy.schema.js';
import { EmailService } from '../../common/services/email.service.js';

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
            include: {
                _count: {
                    select: { applications: true }
                }
            },
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
                },
                _count: {
                    select: { applications: true }
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

    async applyToVacancy(userId: string, vacancyId: string, reason: string) {
        const application = await (prisma as any).jobApplication.create({
            data: {
                userId,
                vacancyId,
                status: 'PENDING',
                reason,
            }
        });

        return {
            status: 'success',
            message: 'Application submitted successfully',
            application
        };
    }

    async getAllApplicantsForOwner(ownerId: string) {
        const vacancies = await (prisma as any).jobVacancy.findMany({
            where: { ownerId },
            select: { id: true, title: true }
        });
        const vacancyIds = vacancies.map((v: any) => v.id);

        const applicants = await (prisma as any).jobApplication.findMany({
            where: { vacancyId: { in: vacancyIds } },
            include: {
                user: { select: { name: true, email: true, image: true, phone: true } },
                vacancy: { select: { id: true, title: true, companyName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { status: 'success', applicants };
    }

    async getApplicantsForVacancy(ownerId: string, vacancyId: string) {
        const vacancy = await (prisma as any).jobVacancy.findFirst({
            where: { id: vacancyId, ownerId }
        });

        if (!vacancy) {
            throw new Error('Vacancy not found or access denied');
        }

        const applicants = await (prisma as any).jobApplication.findMany({
            where: { vacancyId },
            include: {
                user: {
                    select: { name: true, email: true, image: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            status: 'success',
            applicants
        };
    }

    async getUserApplications(userId: string) {
        const applications = await (prisma as any).jobApplication.findMany({
            where: { userId },
            include: {
                vacancy: {
                    include: {
                        owner: {
                            select: { name: true, domain: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            status: 'success',
            applications
        };
    }

    async updateApplicationStatus(ownerId: string, applicationId: string, status: string) {
        const application = await (prisma as any).jobApplication.findFirst({
            where: {
                id: applicationId,
                vacancy: { ownerId }
            },
            include: {
                user: true,
                vacancy: {
                    include: { owner: true }
                }
            }
        });

        if (!application) {
            throw new Error('Application not found or access denied');
        }

        const updated = await (prisma as any).jobApplication.update({
            where: { id: applicationId },
            data: { status }
        });

        // Send email notification based on status
        if ((status === 'ACCEPTED' || status === 'REJECTED') && application.user?.email) {
            try {
                await EmailService.sendApplicationStatusEmail(
                    application.user.email,
                    application.user.name,
                    application.vacancy.owner.name,
                    status,
                    application.vacancy.title
                );
            } catch (error) {
                console.error('Failed to send application status email:', error);
            }
        }

        return {
            status: 'success',
            message: 'Application status updated',
            application: updated
        };
    }
}
