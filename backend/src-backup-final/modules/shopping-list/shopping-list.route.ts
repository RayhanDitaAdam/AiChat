import { Router, type Router as ExpressRouter } from 'express';
import { ShoppingListController } from './shopping-list.controller.js';
import { AddToShoppingListSchema, RemoveFromShoppingListSchema } from './shopping-list.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router: ExpressRouter = Router();
const controller = new ShoppingListController();

router.get('/', authenticate, (req, res) => controller.getList(req, res));
router.post('/items', authenticate, validate(AddToShoppingListSchema), (req, res) => controller.addItem(req, res));
router.delete('/items/:itemId', authenticate, validate(RemoveFromShoppingListSchema), (req, res) => controller.removeItem(req, res));

export default router;
