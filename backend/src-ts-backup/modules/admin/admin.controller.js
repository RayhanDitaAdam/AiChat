import { AdminService } from "./admin.service.js";

export class AdminController {
  adminService = new AdminService();

  async getStats(req, res) {
    try {
      let days = req.query.days ? parseInt(req.query.days) : 7;
      if (isNaN(days)) days = 7;
      const stats = await this.adminService.getStats(days);
      res.json({ status: "success", data: stats });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getMissingRequests(req, res) {
    try {
      const requests = await this.adminService.getMissingRequests();
      res.json({ status: "success", data: requests });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getOwners(req, res) {
    try {
      const owners = await this.adminService.getOwners();
      res.json({ status: "success", data: owners });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async approveOwner(req, res) {
    try {
      const ownerId = req.params.ownerId;
      const { isApproved } = req.body;
      const owner = await this.adminService.approveOwner(ownerId, isApproved);
      res.json({ status: "success", data: owner });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async updateOwnerConfig(req, res) {
    try {
      const ownerId = req.params.ownerId;
      const config = req.body;
      const updatedConfig = await this.adminService.updateOwnerConfig(
        ownerId,
        config,
      );
      res.json({ status: "success", data: updatedConfig });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async updateOwnerCategory(req, res) {
    try {
      const ownerId = req.params.ownerId;
      const { businessCategory } = req.body;
      const owner = await this.adminService.updateOwnerCategory(
        ownerId,
        businessCategory,
      );
      res.json({ status: "success", data: owner });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async updateOwner(req, res) {
    try {
      const ownerId = req.params.ownerId;
      const result = await this.adminService.updateOwner(ownerId, req.body);
      res.json({ status: "success", data: result });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async createOwner(req, res) {
    try {
      const result = await this.adminService.createOwner(req.body);
      res.json({ status: "success", data: result });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async deleteOwner(req, res) {
    try {
      const ownerId = req.params.ownerId;
      const result = await this.adminService.deleteOwner(ownerId);
      res.json({ status: "success", data: result });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getSystemConfig(req, res) {
    try {
      const config = await this.adminService.getSystemConfig();
      res.json({ status: "success", data: config });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async updateSystemConfig(req, res) {
    try {
      const {
        aiSystemPrompt,
        geminiApiKey,
        deepseekApiKey,
        chatRetentionDays,
        aiModel,
        aiTemperature,
        aiTopP,
        aiMaxTokens,
        aiTone,
        companyName,
        companyLogo,
      } = req.body;
      const config = await this.adminService.updateSystemConfig({
        aiSystemPrompt,
        geminiApiKey,
        deepseekApiKey,
        chatRetentionDays,
        aiModel,
        aiTemperature,
        aiTopP,
        aiMaxTokens,
        aiTone,
        companyName,
        companyLogo,
      });
      res.json({ status: "success", data: config });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.adminService.getUsers();
      res.json({ status: "success", data: users });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async updateUserMenus(req, res) {
    try {
      const userId = req.params.userId;
      const { disabledMenus } = req.body;
      const user = await this.adminService.updateUserMenus(
        userId,
        disabledMenus,
      );
      res.json({ status: "success", data: user });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async toggleUserBlock(req, res) {
    try {
      const userId = req.params.userId;
      const { isBlocked } = req.body;
      const user = await this.adminService.toggleUserBlock(userId, isBlocked);
      res.json({ status: "success", data: user });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getAdmins(req, res) {
    try {
      const admins = await this.adminService.getAdmins();
      res.json({ status: "success", data: admins });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async createAdmin(req, res) {
    try {
      const superAdminId = req.user?.id;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";

      if (!superAdminId) throw new Error("Unauthorized action");

      const result = await this.adminService.createAdmin(
        req.body,
        superAdminId,
        ipAddress,
      );
      res.json({ status: "success", data: result });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async updateAdmin(req, res) {
    try {
      const userId = req.params.userId;
      const superAdminId = req.user?.id;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";

      if (!superAdminId) throw new Error("Unauthorized action");

      const result = await this.adminService.updateAdmin(
        userId,
        req.body,
        superAdminId,
        ipAddress,
      );
      res.json({ status: "success", data: result });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async deleteAdmin(req, res) {
    try {
      const userId = req.params.userId;
      const superAdminId = req.user?.id;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";

      if (!superAdminId) throw new Error("Unauthorized action");

      const result = await this.adminService.deleteAdmin(
        userId,
        superAdminId,
        ipAddress,
      );
      res.json({ status: "success", data: result });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getGuide(req, res) {
    try {
      const path = await import("path");
      const { fileURLToPath } = await import("url");
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const guidePath = path.join(__dirname, "../../../../Laporan_Sistem.html");
      res.download(guidePath, "AiChat_Panduan_Sistem.html");
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
}
