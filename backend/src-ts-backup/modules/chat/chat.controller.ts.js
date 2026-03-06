import { ChatService } from "./chat.service.js";

const chatService = new ChatService();

export class ChatController {
  async handleChat(req, res) {
    try {
      console.log("Incoming Chat Request:", JSON.stringify(req.body, null, 2));
      const { guestId, ownerId, ...rest } = req.body;

      if (!ownerId) {
        console.warn("Chat rejected: Missing ownerId");
        return res
          .status(400)
          .json({ status: "error", message: "Owner ID is required." });
      }

      const result = await chatService.processChatMessage({
        ...rest,
        ownerId,
        userId: req.user?.id,
        guestId: guestId,
      });
      return res.json(result);
    } catch (error) {
      console.error("Chat processing error:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Something went wrong with the chat.",
      });
    }
  }

  async getHistory(req, res) {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      }
      const { ownerId, since } = req.query;
      if (!ownerId)
        return res
          .status(400)
          .json({ status: "error", message: "Owner ID is required" });

      if (since !== undefined) {
        const result = await chatService.getChatHistory(req.user.id, 24, since);
        return res.json(result);
      }

      const excludeStaffChats = req.query.excludeStaffChats === "true";
      const result = await chatService.getSessions(
        req.user.id,
        ownerId,
        excludeStaffChats,
      );
      return res.json(result);
    } catch (error) {
      console.error("Chat History Controller Error:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to fetch history." });
    }
  }

  async createSession(req, res) {
    try {
      if (!req.user)
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      const { ownerId } = req.body;
      if (!ownerId)
        return res
          .status(400)
          .json({ status: "error", message: "Owner ID is required" });

      const result = await chatService.createChatSession(req.user.id, ownerId);
      return res.json(result);
    } catch (error) {
      console.error("Create Session Error:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to create session" });
    }
  }

  async getSessionMessages(req, res) {
    try {
      if (!req.user)
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      const { sessionId } = req.params;
      const excludeStaffChats = req.query.excludeStaffChats === "true";
      const result = await chatService.getMessagesBySession(
        sessionId,
        excludeStaffChats,
      );
      return res.json(result);
    } catch (error) {
      console.error("Get Session Messages Error:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to fetch messages" });
    }
  }

  async callStaff(req, res) {
    try {
      if (!req.user)
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      const { ownerId, latitude, longitude } = req.body;
      if (!ownerId)
        return res
          .status(400)
          .json({ status: "error", message: "Owner ID is required" });

      const result = await chatService.requestStaff(
        req.user.id,
        ownerId,
        latitude,
        longitude,
      );
      return res.json(result);
    } catch (error) {
      console.error("Call Staff Error:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to call staff" });
    }
  }

  async stopStaff(req, res) {
    try {
      if (!req.user)
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      const { ownerId, duration } = req.body;
      if (!ownerId)
        return res
          .status(400)
          .json({ status: "error", message: "Owner ID is required" });

      const result = await chatService.stopStaffSupport(
        req.user.id,
        ownerId,
        duration,
      );
      return res.json(result);
    } catch (error) {
      console.error("Stop Staff Error:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to stop staff support" });
    }
  }

  async acceptCall(req, res) {
    try {
      const resolvedOwnerId = req.user?.ownerId || req.user?.memberOfId;
      if (!resolvedOwnerId)
        return res.status(403).json({ status: "error", message: "Forbidden" });

      const { userId } = req.body;
      if (!userId)
        return res
          .status(400)
          .json({ status: "error", message: "User ID is required" });

      const result = await chatService.acceptCall(userId, resolvedOwnerId);
      return res.json(result);
    } catch (error) {
      console.error("Accept Call Error:", error);
      return res
        .status(500)
        .json({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to accept call",
        });
    }
  }

  async declineCall(req, res) {
    try {
      const resolvedOwnerId = req.user?.ownerId || req.user?.memberOfId;
      if (!resolvedOwnerId)
        return res.status(403).json({ status: "error", message: "Forbidden" });

      const { userId } = req.body;
      if (!userId)
        return res
          .status(400)
          .json({ status: "error", message: "User ID is required" });

      const result = await chatService.declineCall(userId, resolvedOwnerId);
      return res.json(result);
    } catch (error) {
      console.error("Decline Call Error:", error);
      return res
        .status(500)
        .json({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to decline call",
        });
    }
  }

  async deleteSession(req, res) {
    try {
      if (!req.user)
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      const { sessionId } = req.params;
      if (!sessionId)
        return res
          .status(400)
          .json({ status: "error", message: "Session ID is required" });
      const result = await chatService.deleteSession(sessionId, req.user.id);
      return res.json(result);
    } catch (error) {
      console.error("Delete Session Error:", error);
      return res
        .status(500)
        .json({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to delete session",
        });
    }
  }

  async toggleSessionPin(req, res) {
    try {
      if (!req.user)
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      const { sessionId } = req.params;
      if (!sessionId)
        return res
          .status(400)
          .json({ status: "error", message: "Session ID is required" });
      const result = await chatService.toggleSessionPin(sessionId, req.user.id);
      return res.json(result);
    } catch (error) {
      console.error("Toggle Session Pin Error:", error);
      return res
        .status(500)
        .json({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to toggle session pin",
        });
    }
  }

  async clearHistory(req, res) {
    try {
      if (!req.user)
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      const { ownerId } = req.body;
      if (!ownerId)
        return res
          .status(400)
          .json({ status: "error", message: "Owner ID is required" });

      const result = await chatService.clearUserHistory(req.user.id, ownerId);
      return res.json(result);
    } catch (error) {
      console.error("Clear History Error:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to clear chat history" });
    }
  }

  async getStoreStaff(req, res) {
    try {
      const { ownerId } = req.params;
      if (!ownerId)
        return res
          .status(400)
          .json({ status: "error", message: "Owner ID is required" });

      const result = await chatService.getStoreStaff(ownerId);
      return res.json(result);
    } catch (error) {
      console.error("Get Store Staff Error:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to fetch staff" });
    }
  }
}
