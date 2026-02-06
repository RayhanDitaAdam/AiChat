import { prisma } from '../../common/services/prisma.service.js';
import { PasswordUtil } from '../../common/utils/password.util.js';
import { Role } from '../../common/types/auth.types.js';
export class OwnerService {
    /**
     * Get missing product requests for owner
     */
    async getMissingRequests(ownerId) {
        const requests = await prisma.missingRequest.findMany({
            where: { owner_id: ownerId },
            orderBy: { count: 'desc' },
        });
        return {
            status: 'success',
            requests,
        };
    }
    /**
     * Get ratings for owner
     */
    async getRatings(ownerId) {
        const ratings = await prisma.rating.findMany({
            where: { owner_id: ownerId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { id: 'desc' },
        });
        return {
            status: 'success',
            ratings,
        };
    }
    /**
     * Get chat history for owner
     */
    async getChatHistory(ownerId) {
        const chats = await prisma.chatHistory.findMany({
            where: { owner_id: ownerId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
        });
        return {
            status: 'success',
            chats,
        };
    }
    /**
     * Get owner details by domain (Public)
     */
    async getOwnerByDomain(domain) {
        const owner = await prisma.owner.findUnique({
            where: { domain },
            select: {
                id: true,
                name: true,
                domain: true,
                config: {
                    select: { showChat: true }
                },
                user: {
                    select: { isBlocked: true }
                }
            },
        });
        if (!owner) {
            throw new Error('Owner not found');
        }
        if (owner.user?.isBlocked) {
            throw new Error('This store is currently unavailable.');
        }
        return {
            status: 'success',
            owner,
        };
    }
    /**
     * Get active live support sessions for owner
     */
    async getLiveSupportSessions(ownerId) {
        // Find users who have requested staff in the last 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const rawSessions = await prisma.chatHistory.findMany({
            where: {
                owner_id: ownerId,
                timestamp: { gte: oneHourAgo }
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { timestamp: 'desc' }
        });
        // Deduplicate by user_id in JS - Keep the LATEST record for each user
        const uniqueSessionsMap = new Map();
        for (const session of rawSessions) {
            if (!uniqueSessionsMap.has(session.user_id)) {
                uniqueSessionsMap.set(session.user_id, session);
            }
        }
        const sessions = Array.from(uniqueSessionsMap.values());
        return {
            status: 'success',
            sessions
        };
    }
    /**
     * Respond to a user in live chat
     */
    async respondToChat(ownerId, userId, message) {
        const chat = await prisma.chatHistory.create({
            data: {
                owner_id: ownerId,
                user_id: userId,
                message: message,
                role: 'staff',
                // @ts-ignore
                status: 'STAFF_REPLY'
            }
        });
        return {
            status: 'success',
            chat
        };
    }
    /**
     * Get chat history for a specific user in live support
     */
    async getLiveChatHistory(ownerId, userId, since) {
        let dateLimit;
        if (since && since.trim() !== '') {
            dateLimit = new Date(since);
            if (isNaN(dateLimit.getTime())) {
                dateLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
            }
        }
        else {
            dateLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
        }
        const chats = await prisma.chatHistory.findMany({
            where: {
                owner_id: ownerId,
                user_id: userId,
                timestamp: { gt: dateLimit }
            },
            orderBy: { timestamp: 'asc' }
        });
        return {
            status: 'success',
            chats
        };
    }
    /**
     * Update store settings for owner
     */
    async updateStoreSettings(ownerId, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.domain !== undefined)
            updateData.domain = data.domain;
        if (data.latitude !== undefined)
            updateData.latitude = data.latitude;
        if (data.longitude !== undefined)
            updateData.longitude = data.longitude;
        const owner = await prisma.owner.update({
            where: { id: ownerId },
            data: updateData,
        });
        return {
            status: 'success',
            owner,
        };
    }
    /**
     * Find stores within a specific radius (km)
     */
    async findNearbyStores(lat, lng, radiusKm = 5) {
        // Simple approximation: 1 degree latitude ~= 111km
        // 1 degree longitude ~= 111km * cos(latitude)
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
        const owners = await prisma.owner.findMany({
            where: {
                latitude: {
                    gte: lat - latDelta,
                    lte: lat + latDelta,
                },
                longitude: {
                    gte: lng - lngDelta,
                    lte: lng + lngDelta,
                },
            },
            select: {
                id: true,
                name: true,
                domain: true,
                latitude: true,
                longitude: true,
            }
        });
        // Filter more accurately using Haversine
        const storesWithDistance = owners.map(o => {
            const dLat = (o.latitude - lat) * Math.PI / 180;
            const dLng = (o.longitude - lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(o.latitude * Math.PI / 180) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = 6371 * c; // Earth radius in km
            return { ...o, distance };
        }).filter(o => o.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);
        return {
            status: 'success',
            stores: storesWithDistance,
        };
    }
    async getStoreMembers(ownerId) {
        const members = await prisma.user.findMany({
            where: { memberOfId: ownerId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                phone: true,
                customerId: true,
            },
            orderBy: { name: 'asc' },
        });
        return {
            status: 'success',
            members,
        };
    }
    async updateMemberRole(ownerId, memberId, role) {
        const member = await prisma.user.findFirst({
            where: { id: memberId, memberOfId: ownerId }
        });
        if (!member) {
            throw new Error('User not found in your store members');
        }
        if (role !== 'USER' && role !== 'STAFF') {
            throw new Error('Invalid role. Only USER and STAFF are allowed for members.');
        }
        const data = { role: role };
        if (role === 'USER') {
            data.position = null; // Clear position if demoted
        }
        const updatedUser = await prisma.user.update({
            where: { id: memberId },
            data,
        });
        return {
            status: 'success',
            message: `User role updated to ${role}`,
            user: updatedUser,
        };
    }
    /**
     * Create a new staff account directly (Assigned to this store)
     */
    async createStaffAccount(ownerId, data) {
        const { email, password, name, phone, position } = data;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Generate customer ID
        const randomDigits = Math.floor(1000000 + Math.random() * 9000000).toString();
        const customerId = `STAFF-${randomDigits}`;
        // Hash password
        const hashedPassword = await PasswordUtil.hash(password);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                position,
                role: Role.STAFF,
                memberOfId: ownerId,
                customerId,
                qrCode: customerId,
            }
        });
        return {
            status: 'success',
            message: 'Staff account created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                customerId: newUser.customerId,
            }
        };
    }
}
//# sourceMappingURL=owner.service.js.map