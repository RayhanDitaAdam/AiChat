import { Router, type Router as ExpressRouter } from 'express';
import { RatingController } from './rating.controller.js';
import { CreateRatingSchema } from './rating.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticateOptional } from '../../common/middleware/auth.middleware.js';

const router: ExpressRouter = Router();
const ratingController = new RatingController();

// POST /api/rating - Create rating (Accessible by guests and authenticated users)
router.post('/', authenticateOptional, validate(CreateRatingSchema), (req, res) =>
    ratingController.createRating(req, res)
);

export default router;
