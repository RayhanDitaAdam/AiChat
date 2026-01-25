import { Router, type Router as ExpressRouter } from 'express';
import { ProductController } from './product.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

import { CreateProductSchema, UpdateProductSchema } from './product.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { requireOwner } from '../../common/middleware/rbac.middleware.js';

const router: ExpressRouter = Router();
const productController = new ProductController();

// PUBLIC/USER routes
router.get('/:ownerId', authenticate, (req, res) =>
    productController.getProductsByOwner(req, res)
);

// OWNER only routes
router.post('/', authenticate, requireOwner(), validate(CreateProductSchema), (req, res) =>
    productController.createProduct(req, res)
);

router.patch('/:id', authenticate, requireOwner(), validate(UpdateProductSchema), (req, res) =>
    productController.updateProduct(req, res)
);

router.delete('/:id', authenticate, requireOwner(), (req, res) =>
    productController.deleteProduct(req, res)
);

export default router;
