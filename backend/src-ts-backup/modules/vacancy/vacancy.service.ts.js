import { prisma } from "../../common/services/prisma.service.js";
import { EmailService } from "../../common/services/email.service.js";

export class VacancyService {
  async createVacancy(ownerId, data) {
    const vacancy = await prisma.jobVacancy.create({
      data: {
        ...data,
        ownerId,
      },
    });

    return {
      status: "success",
      message: "Job vacancy posted successfully",
      vacancy,
    };
  }

  async getVacancies(ownerId) {
    const vacancies = await prisma.jobVacancy.findMany({
      where: { ownerId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      status: "success",
      vacancies,
    };
  }

  async getAllPublicVacancies() {
    const vacancies = await prisma.jobVacancy.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { name: true, domain: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return {
      status: "success",
      vacancies,
    };
  }

  async updateVacancy(id, ownerId, data) {
    const existing = await prisma.jobVacancy.findFirst({
      where: { id, ownerId },
    });

    if (!existing) {
      throw new Error("Vacancy not found or access denied");
    }

    const vacancy = await prisma.jobVacancy.update({
      where: { id },
      data,
    });

    return {
      status: "success",
      message: "Vacancy updated successfully",
      vacancy,
    };
  }

  async deleteVacancy(id, ownerId) {
    const existing = await prisma.jobVacancy.findFirst({
      where: { id, ownerId },
    });

    if (!existing) {
      throw new Error("Vacancy not found or access denied");
    }

    await prisma.jobVacancy.delete({
      where: { id },
    });

    return {
      status: "success",
      message: "Vacancy deleted successfully",
    };
  }

  async applyToVacancy(userId, vacancyId, reason) {
    const application = await prisma.jobApplication.create({
      data: {
        userId,
        vacancyId,
        status: "PENDING",
        reason,
      },
    });

    return {
      status: "success",
      message: "Application submitted successfully",
      application,
    };
  }

  async getAllApplicantsForOwner(ownerId) {
    const vacancies = await prisma.jobVacancy.findMany({
      where: { ownerId },
      select: { id: true, title: true },
    });
    const vacancyIds = vacancies.map((v) => v.id);

    const applicants = await prisma.jobApplication.findMany({
      where: { vacancyId: { in: vacancyIds } },
      include: {
        user: { select: { name: true, email: true, image: true, phone: true } },
        vacancy: { select: { id: true, title: true, companyName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { status: "success", applicants };
  }

  async getApplicantsForVacancy(ownerId, vacancyId) {
    const vacancy = await prisma.jobVacancy.findFirst({
      where: { id: vacancyId, ownerId },
    });

    if (!vacancy) {
      throw new Error("Vacancy not found or access denied");
    }

    const applicants = await prisma.jobApplication.findMany({
      where: { vacancyId },
      include: {
        user: {
          select: { name: true, email: true, image: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      status: "success",
      applicants,
    };
  }

  async getUserApplications(userId) {
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        vacancy: {
          include: {
            owner: {
              select: { name: true, domain: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      status: "success",
      applications,
    };
  }

  async updateApplicationStatus(ownerId, applicationId, status) {
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        vacancy: { ownerId },
      },
      include: {
        user: true,
        vacancy: {
          include: { owner: true },
        },
      },
    });

    if (!application) {
      throw new Error("Application not found or access denied");
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    // Send email notification based on status
    if (
      (status === "ACCEPTED" || status === "REJECTED") &&
      application.user?.email
    ) {
      try {
        await EmailService.sendApplicationStatusEmail(
          application.user.email,
          application.user.name,
          application.vacancy.owner.name,
          status,
          application.vacancy.title,
        );
      } catch (error) {
        console.error("Failed to send application status email:", error);
      }
    }

    return {
      status: "success",
      message: "Application status updated",
      application: updated,
    };
  }
}
