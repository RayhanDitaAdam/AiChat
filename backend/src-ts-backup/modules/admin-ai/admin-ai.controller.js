import { KnowledgeBaseService } from "./services/knowledge-base.service.js";
import { IntentManagerService } from "./services/intent-manager.service.js";
import { ChatAnalyticsService } from "./services/chat-analytics.service.js";
import { SelfLearningService } from "./services/self-learning.service.js";

export class AdminAIController {
  // --- KNOWLEDGE BASE --- //

  static async getCategories(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const service = new KnowledgeBaseService();
      const categories = await service.getCategories(ownerId);
      res.status(200).json({ status: "success", data: categories });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async createCategory(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const { name, description } = req.body;
      const service = new KnowledgeBaseService();
      const category = await service.createCategory(ownerId, name, description);
      res.status(201).json({ status: "success", data: category });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async getFaqs(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const { categoryId, search } = req.query;
      const service = new KnowledgeBaseService();
      const faqs = await service.getFaqs(ownerId, categoryId, search);
      res.status(200).json({ status: "success", data: faqs });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async createFaq(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const service = new KnowledgeBaseService();
      const faq = await service.createFaq(ownerId, req.body);
      res.status(201).json({ status: "success", data: faq });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async updateFaq(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const id = req.params.id;
      const service = new KnowledgeBaseService();
      const faq = await service.updateFaq(id, ownerId, req.body);
      res.status(200).json({ status: "success", data: faq });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async deleteFaq(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const id = req.params.id;
      const service = new KnowledgeBaseService();
      await service.deleteFaq(id, ownerId);
      res.status(200).json({ status: "success", message: "FAQ deleted" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  // --- INTENT MANAGER --- //

  static async getIntents(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const { search } = req.query;
      const service = new IntentManagerService();
      const intents = await service.getIntents(ownerId, search);
      res.status(200).json({ status: "success", data: intents });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async createIntent(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const service = new IntentManagerService();
      const intent = await service.createIntent(ownerId, req.body);
      res.status(201).json({ status: "success", data: intent });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async updateIntent(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const id = req.params.id;
      const service = new IntentManagerService();
      const intent = await service.updateIntent(id, ownerId, req.body);
      res.status(200).json({ status: "success", data: intent });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async deleteIntent(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const id = req.params.id;
      const service = new IntentManagerService();
      await service.deleteIntent(id, ownerId);
      res.status(200).json({ status: "success", message: "Intent deleted" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  // --- CHAT ANALYTICS & LOGS --- //

  static async getAnalytics(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const days = parseInt(req.query.days) || 7;
      const service = new ChatAnalyticsService();
      const metrics = await service.getGlobalMetrics(ownerId, days);
      res.status(200).json({ status: "success", data: metrics });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async getUnresolvedSessions(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const limit = parseInt(req.query.limit) || 50;
      const skip = parseInt(req.query.skip) || 0;
      const service = new ChatAnalyticsService();
      const sessions = await service.getUnresolvedSessions(
        ownerId,
        limit,
        skip,
      );
      res.status(200).json({ status: "success", data: sessions });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async tagSession(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const id = req.params.id;
      const { resolution, aiAccuracyTag } = req.body;
      const service = new ChatAnalyticsService();
      const session = await service.tagSession(
        id,
        ownerId,
        resolution,
        aiAccuracyTag,
      );
      res.status(200).json({ status: "success", data: session });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  // --- SELF LEARNING --- //

  static async getSuggestions(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const { status } = req.query;
      const service = new SelfLearningService();
      const suggestions = await service.getSuggestions(ownerId, status);
      res.status(200).json({ status: "success", data: suggestions });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async approveSuggestion(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const id = req.params.id;
      const { finalQuestion, finalAnswer, categoryId } = req.body;
      const service = new SelfLearningService();
      const faq = await service.approveSuggestion(
        id,
        ownerId,
        finalQuestion,
        finalAnswer,
        categoryId,
      );
      res.status(200).json({ status: "success", data: faq });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async rejectSuggestion(req, res) {
    try {
      const ownerId = req.user.ownerId;
      if (!ownerId)
        return res
          .status(400)
          .json({
            status: "error",
            message: "User not associated with any store.",
          });
      const id = req.params.id;
      const service = new SelfLearningService();
      const suggestion = await service.rejectSuggestion(id, ownerId);
      res.status(200).json({ status: "success", data: suggestion });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
}
