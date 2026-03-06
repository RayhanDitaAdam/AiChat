import { Router } from 'express';
import { AdminAIController } from './admin-ai.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Wrap all these routes with extractUser or a specific SuperAdmin middleware
router.use(authenticate);

// --- KNOWLEDGE BASE --- //
router.get('/categories', AdminAIController.getCategories);
router.post('/categories', AdminAIController.createCategory);

router.get('/faqs', AdminAIController.getFaqs);
router.post('/faqs', AdminAIController.createFaq);
router.put('/faqs/:id', AdminAIController.updateFaq);
router.delete('/faqs/:id', AdminAIController.deleteFaq);

// --- INTENT MANAGER --- //
router.get('/intents', AdminAIController.getIntents);
router.post('/intents', AdminAIController.createIntent);
router.put('/intents/:id', AdminAIController.updateIntent);
router.delete('/intents/:id', AdminAIController.deleteIntent);


// --- CHAT ANALYTICS --- //
router.get('/analytics', AdminAIController.getAnalytics);
router.get('/sessions/unresolved', AdminAIController.getUnresolvedSessions);
router.patch('/sessions/:id/tag', AdminAIController.tagSession);

// --- SELF LEARNING --- //
router.get('/suggestions', AdminAIController.getSuggestions);
router.post('/suggestions/:id/approve', AdminAIController.approveSuggestion);
router.post('/suggestions/:id/reject', AdminAIController.rejectSuggestion);

export default router;
