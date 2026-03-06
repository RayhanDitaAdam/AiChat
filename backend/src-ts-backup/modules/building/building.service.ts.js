import { prisma } from "../../common/services/prisma.service.js";

export class BuildingService {
  async createSubLocation(ownerId, data) {
    const subLocation = await prisma.subLocation.create({
      data: {
        ...data,
        ownerId,
      },
    });

    return {
      status: "success",
      message: "Sub-location created successfully",
      subLocation,
    };
  }

  async getSubLocations(ownerId) {
    const subLocations = await prisma.subLocation.findMany({
      where: { ownerId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return {
      status: "success",
      subLocations,
    };
  }

  async updateSubLocation(id, ownerId, data) {
    const existing = await prisma.subLocation.findFirst({
      where: { id, ownerId },
    });

    if (!existing) {
      throw new Error("Sub-location not found or access denied");
    }

    const subLocation = await prisma.subLocation.update({
      where: { id },
      data,
    });

    return {
      status: "success",
      message: "Sub-location updated successfully",
      subLocation,
    };
  }

  async deleteSubLocation(id, ownerId) {
    const existing = await prisma.subLocation.findFirst({
      where: { id, ownerId },
    });

    if (!existing) {
      throw new Error("Sub-location not found or access denied");
    }

    await prisma.subLocation.delete({
      where: { id },
    });

    return {
      status: "success",
      message: "Sub-location deleted successfully",
    };
  }
}
