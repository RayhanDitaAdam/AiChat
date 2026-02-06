import { Router } from 'express';
import { RatingController } from './rating.controller.js';
import { CreateRatingSchema } from './rating.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireUser } from '../../common/middleware/rbac.middleware.js';
const router = Router();
const ratingController = new RatingController();
// POST /api/rating - Create rating (User role only)
router.post('/', authenticate, requireUser(), validate(CreateRatingSchema), (req, res) => ratingController.createRating(req, res));
export default router;
//# sourceMappingURL=rating.route.js.map