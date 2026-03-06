 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { prisma } from "../../common/services/prisma.service.js";

import { EmailService } from "../../common/services/email.service.js";

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

    const request = await prisma.contributorRequest.create({
        data: {
            userId,
            ownerId: dto.ownerId,
            status: "PENDING",
        },
        include: {
            user: true,
            owner: {
                include: {
                    user: true // The owner is a Store which has a user (the real owner)
                }
            }
        }
    });

    // Notify the store owner via email
    if (_optionalChain([request, 'access', _ => _.owner, 'optionalAccess', _2 => _2.user, 'optionalAccess', _3 => _3.email])) {
        try {
            await EmailService.sendContributorRequestEmail(
                request.owner.user.email,
                request.owner.user.name || 'Store Owner',
                {
                    name: request.user.name || 'Standard User',
                    email: request.user.email
                }
            );
        } catch (emailError) {
            console.error("Failed to send contributor request email:", emailError);
            // Don't fail the whole request if email fails
        }
    }

    return request;
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

export const updateContributorRequestStatus = async (
    ownerId,
    requestId,
    dto
) => {
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
    })
}

export const getContributorRequestsByUser = async (userId) => {
    return prisma.contributorRequest.findMany({
        where: { userId },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    domain: true,
                },
            },
        },
    });
};

export const deleteContributorRequest = async (userId, requestId) => {
    const request = await prisma.contributorRequest.findUnique({
        where: { id: requestId },
    });

    if (!request) {
        throw new Error("Request not found");
    }

    if (request.userId !== userId) {
        throw new Error("Unauthorized");
    }

    if (request.status !== "PENDING") {
        throw new Error("Only pending requests can be cancelled");
    }

    return prisma.contributorRequest.delete({
        where: { id: requestId },
    });
};

export const getMissingRequests = async (ownerId) => {
    return prisma.missingRequest.findMany({
        where: { ownerId },
        orderBy: { count: "desc" },
    });
};

export const bulkRemoveContributors = async (ownerId, userIds) => {
    return prisma.user.updateMany({
        where: {
            id: { in: userIds },
            memberOfId: ownerId,
            role: "CONTRIBUTOR",
        },
        data: {
            role: "USER",
            memberOfId: null,
        },
    });
};
