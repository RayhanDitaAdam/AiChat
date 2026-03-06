import { Router, } from 'express';
import { PrintController } from './print.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new PrintController();

router.post('/', authenticate, (req, res) => controller.printShoppingList(req, res));

export default router;
