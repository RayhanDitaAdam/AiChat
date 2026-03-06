import prisma from "../../common/services/prisma.service.js";

export class AdminService {
  async getStats(days = 7) {
    const p = prisma;
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [userCount, ownerCount, chatCount, productCount, chatHistory] =
      await Promise.all([
        p.user.count(),
        p.owner.count(),
        p.chatHistory.count({ where: { role: "user" } }),
        p.product.count(),
        p.chatHistory.findMany({
          where: {
            role: "user",
            timestamp: { gte: startDate },
          },
          select: { timestamp: true },
        }),
      ]);

    // Aggregate chats by date
    const chatAggregation = chatHistory.reduce((acc, curr) => {
      const date = curr.timestamp.toLocaleDateString("sv-SE");
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});

    // Fill in zeroes for gaps
    const history = [];
    const iterDate = new Date(startDate);
    while (iterDate <= now) {
      const dateStr = iterDate.toLocaleDateString("sv-SE");
      history.push({
        date: dateStr,
        count: chatAggregation[dateStr] || 0,
      });
      iterDate.setDate(iterDate.getDate() + 1);
    }

    return {
      users: userCount,
      owners: ownerCount,
      totalChats: chatCount,
      totalProducts: productCount,
      history,
    };
  }

  async getMissingRequests() {
    return prisma.missingRequest.findMany({
      include: {
        owner: {
          select: { name: true, domain: true },
        },
      },
      orderBy: { count: "desc" },
    });
  }

  async getOwners() {
    const p = prisma;
    const users = await p.user.findMany({
      where: { role: "OWNER" },
      include: {
        owner: {
          include: {
            config: true,
          },
        },
      },
    });

    return users.map((u) => {
      if (u.owner) {
        return {
          ...u.owner,
          user: {
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            isBlocked: u.isBlocked,
            image: u.image,
            avatarVariant: u.avatarVariant,
          },
        };
      }
      return {
        id: u.id, // Use user ID if no owner record
        name: u.name || "Unnamed Owner",
        domain: "N/A",
        isApproved: false,
        businessCategory: "N/A",
        user: {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isBlocked: u.isBlocked,
          image: u.image,
          avatarVariant: u.avatarVariant,
        },
      };
    });
  }

  async updateOwnerCategory(ownerId, businessCategory) {
    return prisma.owner.update({
      where: { id: ownerId },
      data: { businessCategory },
    });
  }

  async createOwner(data) {
    const p = prisma;

    // 1. Check if user or domain exists
    const existingUser = await p.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new Error("User with this email already exists");

    const existingOwner = await p.owner.findUnique({
      where: { domain: data.domain },
    });
    if (existingOwner) throw new Error("Store domain already exists");

    // 2. Setup IDs and Password
    const hashedPassword = await (
      await import("../../common/utils/password.util.js")
    ).PasswordUtil.hash(data.password || "heart123");

    // 3. Create User and Owner in transaction
    return p.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: "OWNER",
          isEmailVerified: true,
        },
      });

      const owner = await tx.owner.create({
        data: {
          name: data.name,
          domain: data.domain,
          user: { connect: { id: user.id } },
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { ownerId: owner.id },
      });

      return { user, owner };
    });
  }

  async deleteOwner(ownerId) {
    const p = prisma;

    // Find user associated with this owner to clean up
    const owner = await p.owner.findUnique({
      where: { id: ownerId },
      include: { user: true },
    });

    if (!owner) throw new Error("Owner not found");

    return p.$transaction(async (tx) => {
      // Delete associated data first
      await tx.ownerConfig.deleteMany({ where: { owner_id: ownerId } });
      await tx.product.deleteMany({ where: { owner_id: ownerId } });

      // Delete Owner
      await tx.owner.delete({ where: { id: ownerId } });

      // Delete User if exists
      if (owner.user) {
        await tx.user.delete({ where: { id: owner.user.id } });
      }

      return { success: true };
    });
  }

  async updateOwner(ownerId, data) {
    const p = prisma;
    const owner = await p.owner.findUnique({
      where: { id: ownerId },
      include: { user: true },
    });

    if (!owner) throw new Error("Owner not found");

    return p.$transaction(async (tx) => {
      if (
        data.name !== undefined ||
        data.domain !== undefined ||
        data.isApproved !== undefined
      ) {
        await tx.owner.update({
          where: { id: ownerId },
          data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.domain !== undefined && { domain: data.domain }),
            ...(data.isApproved !== undefined && {
              isApproved: data.isApproved,
            }),
          },
        });
      }

      if (data.isBlocked !== undefined && owner.user) {
        await tx.user.update({
          where: { id: owner.user.id },
          data: { isBlocked: data.isBlocked },
        });
      }

      return { success: true };
    });
  }

  async approveOwner(ownerId, isApproved) {
    return prisma.owner.update({
      where: { id: ownerId },
      data: { isApproved },
    });
  }

  async updateOwnerConfig(ownerId, config) {
    return prisma.ownerConfig.upsert({
      where: { owner_id: ownerId },
      create: {
        owner_id: ownerId,
        showInventory: config.showInventory ?? true,
        showChat: config.showChat ?? true,
      },
      update: config,
    });
  }

  async getSystemConfig() {
    return prisma.systemConfig.upsert({
      where: { id: "global" },
      create: { id: "global" },
      update: {},
    });
  }

  async updateSystemConfig(config) {
    const p = prisma;

    if (config.companyName) {
      const currentConfig = await p.systemConfig.findUnique({
        where: { id: "global" },
      });
      const oldName = currentConfig?.companyName || "HeartAI";
      const newName = config.companyName;

      if (oldName !== newName) {
        // Update System AI Prompt
        if (
          currentConfig?.aiSystemPrompt &&
          currentConfig.aiSystemPrompt.includes(oldName)
        ) {
          config.aiSystemPrompt = (
            config.aiSystemPrompt || currentConfig.aiSystemPrompt
          )
            .split(oldName)
            .join(newName);
        }

        if (
          currentConfig?.aiGuestSystemPrompt &&
          currentConfig.aiGuestSystemPrompt.includes(oldName)
        ) {
          config.aiGuestSystemPrompt = (
            config.aiGuestSystemPrompt || currentConfig.aiGuestSystemPrompt
          )
            .split(oldName)
            .join(newName);
        }

        // Also clear AI cache so old name doesn't persist
        p.aICache.deleteMany({}).catch(console.error);
      }
    }

    return p.systemConfig.update({
      where: { id: "global" },
      data: config,
    });
  }

  async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        disabledMenus: true,
        isBlocked: true,
        memberOf: {
          select: { name: true },
        },
        owner: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateUserMenus(userId, disabledMenus) {
    return prisma.user.update({
      where: { id: userId },
      data: { disabledMenus },
    });
  }

  async toggleUserBlock(userId, isBlocked) {
    return prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    });
  }

  async getAdmins() {
    return prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isBlocked: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteAdmin(userId, superAdminId, ipAddress) {
    // Enforce that only ADMIN role can be deleted via this method
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Only ADMIN accounts can be removed by Super Admin");
    }

    const p = prisma;
    return p.$transaction(async (tx) => {
      // Log first while user exists to satisfy foreign key constraint
      await tx.auditLog.create({
        data: {
          superAdminId,
          targetAdminId: userId,
          action: "DELETE_ADMIN",
          ipAddress,
          details: { id: userId }, // We'll fetch basic info before delete if needed, or just ID
        },
      });

      const deletedUser = await tx.user.delete({
        where: { id: userId },
      });

      return deletedUser;
    });
  }

  async createAdmin(data, superAdminId, ipAddress) {
    const p = prisma;
    const hashedPassword = await (
      await import("../../common/utils/password.util.js")
    ).PasswordUtil.hash(data.password || "admin123");

    return p.$transaction(async (tx) => {
      const newAdmin = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: "ADMIN",
          isEmailVerified: true,
        },
      });

      await tx.auditLog.create({
        data: {
          superAdminId,
          targetAdminId: newAdmin.id,
          action: "CREATE_ADMIN",
          ipAddress,
          details: { email: newAdmin.email, name: newAdmin.name },
        },
      });

      return newAdmin;
    });
  }

  async updateAdmin(userId, data, superAdminId, ipAddress) {
    const p = prisma;
    const user = await p.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Only ADMIN accounts can be updated via this action");
    }

    return p.$transaction(async (tx) => {
      const updatedAdmin = await tx.user.update({
        where: { id: userId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.isBlocked !== undefined && { isBlocked: data.isBlocked }),
        },
      });

      await tx.auditLog.create({
        data: {
          superAdminId,
          targetAdminId: userId,
          action: "UPDATE_ADMIN",
          ipAddress,
          details: data,
        },
      });

      return updatedAdmin;
    });
  }
}
