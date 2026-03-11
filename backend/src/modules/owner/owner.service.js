function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import { prisma } from '../../common/services/prisma.service.js';
import { PasswordUtil } from '../../common/utils/password.util.js';
import { Role } from '../../common/types/auth.types.js';
import { sseService } from '../../common/services/sse.service.js';

export class OwnerService {
    /**
     * Get missing product requests for owner
     */
    async getMissingRequests(ownerId, contributorId) {
        const requests = await prisma.missingRequest.findMany({
            where: {
                ownerId: ownerId,
                // Missing requests are global, but we can filter by keywords if desired.
                // For now, we'll return all, but we could filter by items the contributor
                // has keywords for if we had that mapping.
            },
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
    async getRatings(ownerId, contributorId) {
        const ratings = await prisma.rating.findMany({
            where: {
                owner_id: ownerId,
                ...(contributorId ? {
                    // Filter ratings for sessions that involved this contributor's products
                    session_id: {
                        in: (await prisma.chatHistory.findMany({
                            where: {
                                owner_id: ownerId,
                                metadata: {
                                    path: ['products'],
                                    array_contains: { contributorId }
                                }
                            },
                            select: { session_id: true }
                        })).map(c => c.session_id).filter((s) => !!s)
                    }
                } : {})
            },
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
     * Get staff activity log
     */
    async getStaffActivity(ownerId, staffId) {
        const activities = await prisma.staffActivity.findMany({
            where: {
                ownerId,
                staffId
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to recent 100 activities
        });

        // Mark as read
        await prisma.staffActivity.updateMany({
            where: {
                ownerId,
                staffId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return {
            status: 'success',
            activities
        };
    }

    /**
     * Get chat history for owner
     */
    async getChatHistory(ownerId, contributorId) {
        const chats = await prisma.chatHistory.findMany({
            where: {
                owner_id: ownerId,
                ...(contributorId ? {
                    // Filter chat history where the metadata contain products from this contributor
                    OR: [
                        {
                            metadata: {
                                path: ['products'],
                                array_contains: { contributorId }
                            }
                        },
                        // Also include system/user messages from sessions that involve this contributor
                        {
                            session_id: {
                                in: (await prisma.chatHistory.findMany({
                                    where: {
                                        owner_id: ownerId,
                                        metadata: {
                                            path: ['products'],
                                            array_contains: { contributorId }
                                        }
                                    },
                                    select: { session_id: true }
                                })).map(c => c.session_id).filter((s) => !!s)
                            }
                        }
                    ]
                } : {})
            },
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
                businessCategory: true,
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

        if (_optionalChain([(owner), 'access', _ => _.user, 'optionalAccess', _2 => _2.isBlocked])) {
            throw new Error('This store is currently unavailable.');
        }

        return {
            status: 'success',
            owner,
        };
    }

    /**
     * Get list of public approved owners for marquee
     */
    async getPublicOwners(limit = 5) {
        const owners = await prisma.owner.findMany({
            where: { isApproved: true },
            take: limit,
            select: {
                id: true,
                name: true,
                domain: true,
                businessCategory: true,
                avatarVariant: true
            },
            orderBy: { name: 'asc' }
        });

        return {
            status: 'success',
            owners,
        };
    }

    /**
     * Get active live support sessions for owner
     */
    async getLiveSupportSessions(ownerId, contributorId) {
        // Find users who have requested staff in the last 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const rawSessions = await prisma.chatHistory.findMany({
            where: {
                owner_id: ownerId,
                timestamp: { gte: oneHourAgo },
                ...(contributorId ? {
                    // Filter sessions that involve this contributor's products
                    OR: [
                        {
                            metadata: {
                                path: ['products'],
                                array_contains: { contributorId }
                            }
                        },
                        {
                            session_id: {
                                in: (await prisma.chatHistory.findMany({
                                    where: {
                                        owner_id: ownerId,
                                        metadata: {
                                            path: ['products'],
                                            array_contains: { contributorId }
                                        }
                                    },
                                    select: { session_id: true }
                                })).map(c => c.session_id).filter((s) => !!s)
                            }
                        }
                    ]
                } : {})
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Deduplicate and FILTER OUT STAFF
        const uniqueSessionsMap = new Map();
        for (const session of rawSessions) {
            if (!session.user_id) continue; // Skip guest sessions (no user_id)
            if (_optionalChain([session, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.role]) === 'STAFF') continue; // Stop staff from supporting themselves/other staff in this list
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
     * Staff replies are ephemeral - no database storage
     */
    async respondToChat(ownerId, userId, message, staffId) {
        // Save to Database
        const chat = await prisma.chatHistory.create({
            data: {
                user_id: userId,
                owner_id: ownerId,
                message: message,
                role: 'staff',
                timestamp: new Date(),
                // @ts-ignore
                status: 'CALL_ACCEPTED',
                metadata: staffId ? { staffId } : {}
            }
        });

        // Emit to user via SSE
        sseService.broadcast(userId, 'chat_message', {
            id: chat.id,
            userId,
            ownerId,
            message: message,
            role: 'staff',
            staffId: staffId, // Include staffId so frontend can route it to correct chat
            timestamp: chat.timestamp,
            status: 'STAFF_REPLY',
            metadata: chat.metadata
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
        } else {
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
        if (data.name !== undefined) updateData.name = data.name;
        if (data.domain !== undefined) updateData.domain = data.domain;
        if (data.latitude !== undefined) updateData.latitude = data.latitude;
        if (data.longitude !== undefined) updateData.longitude = data.longitude;
        if (data.businessCategory !== undefined) updateData.businessCategory = data.businessCategory;

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
                staffRoleId: true,
                staffRole: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true
                    }
                },
                position: true,
                _count: {
                    select: {
                        staffActivities: {
                            where: { isRead: false }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' },
        });

        const formattedMembers = members.map((m) => ({
            ...m,
            unreadActivityCount: _optionalChain([m, 'access', _5 => _5._count, 'optionalAccess', _6 => _6.staffActivities]) || 0
        }));

        return {
            status: 'success',
            members: formattedMembers,
        };
    }

    async deleteMember(ownerId, memberId) {
        // Verify ownership
        const member = await prisma.user.findFirst({
            where: {
                id: memberId,
                memberOfId: ownerId
            }
        });

        if (!member) {
            throw new Error('Staff member not found or does not belong to your store');
        }

        await prisma.user.update({
            where: { id: memberId },
            data: {
                memberOfId: null,
                role: Role.USER, // Revert to regular user
                staffRoleId: null,
                position: null
            }
        });

        return {
            status: 'success',
            message: 'Staff member removed successfully'
        };
    }

    async deleteMembers(ownerId, memberIds) {
        // We use updateMany for efficiency, filtering by ownerId to ensure authorization
        const result = await prisma.user.updateMany({
            where: {
                id: { in: memberIds },
                memberOfId: ownerId
            },
            data: {
                memberOfId: null,
                role: Role.USER,
                staffRoleId: null,
                position: null
            }
        });

        return {
            status: 'success',
            message: `${result.count} staff members removed successfully`,
            count: result.count
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

    async updateMember(ownerId, memberId, data) {
        const member = await prisma.user.findFirst({
            where: { id: memberId, memberOfId: ownerId }
        });

        if (!member) {
            throw new Error('User not found in your store members');
        }

        if (data.role && data.role !== 'USER' && data.role !== 'STAFF' && data.role !== 'OWNER' && data.role !== 'CONTRIBUTOR') {
            // Basic validation
        }

        const updateData = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.position !== undefined) updateData.position = data.position;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.staffRoleId !== undefined) updateData.staffRoleId = data.staffRoleId;
        if (data.disabledMenus !== undefined) updateData.disabledMenus = data.disabledMenus;

        const updatedUser = await prisma.user.update({
            where: { id: memberId },
            data: updateData,
        });

        return {
            status: 'success',
            message: 'Member updated successfully',
            user: updatedUser,
        };
    }

    /**
     * Create a new staff account directly (Assigned to this store)
     */
    async createStaffAccount(ownerId, data) {
        const { email, password, name, phone, position, staffRoleId } = data;

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
                role: (Role).STAFF,
                memberOfId: ownerId,
                staffRoleId: staffRoleId,
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

    async getStaffRoles(ownerId) {
        const roles = await prisma.staffRole.findMany({
            where: { ownerId },
            orderBy: { name: 'asc' }
        });
        return { status: 'success', roles };
    }

    async createStaffRole(ownerId, name, permissions = null) {
        const existing = await prisma.staffRole.findFirst({
            where: { ownerId, name: { equals: name, mode: 'insensitive' } }
        });

        if (existing) {
            throw new Error('Role with this name already exists');
        }

        const role = await prisma.staffRole.create({
            data: { ownerId, name, permissions }
        });

        return { status: 'success', role };
    }

    async updateStaffRole(ownerId, roleId, data) {
        const role = await prisma.staffRole.update({
            where: { id: roleId, ownerId },
            data: data
        });

        return { status: 'success', role };
    }

    async deleteStaffRole(ownerId, roleId) {
        // Optional: Check if any staff are using this role before deleting
        // For now, we allow deletion and those staff keep the string but it won't be in the list
        await prisma.staffRole.deleteMany({
            where: { id: roleId, ownerId }
        });

        return { status: 'success', message: 'Role deleted' };
    }

    /**
     * Get owner configuration (including AI tuning)
     */
    async getOwnerConfig(ownerId) {
        const config = await prisma.ownerConfig.upsert({
            where: { owner_id: ownerId },
            create: { owner_id: ownerId },
            update: {}
        });

        return {
            status: 'success',
            config
        };
    }

    /**
     * Update owner configuration
     */
    async updateOwnerConfig(ownerId, data) {
        const updateData = {};

        if (data.showInventory !== undefined) updateData.showInventory = data.showInventory;
        if (data.showChat !== undefined) updateData.showChat = data.showChat;
        if (data.aiTemperature !== undefined) updateData.aiTemperature = parseFloat(data.aiTemperature);
        if (data.aiTopP !== undefined) updateData.aiTopP = parseFloat(data.aiTopP);
        if (data.aiTopK !== undefined) updateData.aiTopK = parseInt(data.aiTopK);
        if (data.aiMaxTokens !== undefined) updateData.aiMaxTokens = parseInt(data.aiMaxTokens);
        if (data.aiSystemPrompt !== undefined) updateData.aiSystemPrompt = data.aiSystemPrompt;
        if (data.aiGuestSystemPrompt !== undefined) updateData.aiGuestSystemPrompt = data.aiGuestSystemPrompt;
        if (data.aiTone !== undefined) updateData.aiTone = data.aiTone;
        if (data.currency !== undefined) updateData.currency = data.currency;

        const config = await prisma.ownerConfig.update({
            where: { owner_id: ownerId },
            data: updateData
        });

        return {
            status: 'success',
            config
        };
    }
}
