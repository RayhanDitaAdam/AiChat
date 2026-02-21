import { prisma } from "../../common/services/prisma.service.js";
export const createContributorRequest = async (userId, dto) => {
    // Check if request already exists
    const existingRequest = await prisma.contributorRequest.findUnique({
        where: {
            userId_ownerId: {
                userId,
                ownerId: dto.ownerId,
            },
        },
    });
    if (existingRequest) {
        throw new Error("Request already exists");
    }
    return prisma.contributorRequest.create({
        data: {
            userId,
            ownerId: dto.ownerId,
            status: "PENDING",
        },
    });
};
export const getContributorRequests = async (ownerId) => {
    return prisma.contributorRequest.findMany({
        where: {
            ownerId,
            status: "PENDING",
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
};
export const updateContributorRequestStatus = async (ownerId, requestId, dto) => {
    const request = await prisma.contributorRequest.findUnique({
        where: { id: requestId },
    });
    if (!request) {
        throw new Error("Request not found");
    }
    if (request.ownerId !== ownerId) {
        throw new Error("Unauthorized");
    }
    const updatedRequest = await prisma.contributorRequest.update({
        where: { id: requestId },
        data: { status: dto.status },
    });
    if (dto.status === "APPROVED") {
        // Update user role to CONTRIBUTOR
        await prisma.user.update({
            where: { id: request.userId },
            data: {
                role: "CONTRIBUTOR",
                memberOfId: ownerId, // Link them to the shop
            },
        });
    }
    return updatedRequest;
};
export const getContributors = async (ownerId) => {
    return prisma.user.findMany({
        where: {
            memberOfId: ownerId,
            role: "CONTRIBUTOR"
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
        }
    });
};
//# sourceMappingURL=contributor.service.js.map