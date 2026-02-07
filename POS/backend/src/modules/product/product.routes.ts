import { Router } from 'express';
import * as productController from './product.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

// Categories
router.get('/categories', authMiddleware as any, productController.getCategories);
router.post('/categories', authMiddleware as any, roleMiddleware(['ADMIN']) as any, productController.createCategory);

// Products
router.get('/', authMiddleware as any, productController.getProducts);
router.post('/', authMiddleware as any, roleMiddleware(['ADMIN']) as any, upload.single('image'), productController.createProduct);
router.patch('/:id', authMiddleware as any, roleMiddleware(['ADMIN']) as any, upload.single('image'), productController.updateProduct);
router.delete('/:id', authMiddleware as any, roleMiddleware(['ADMIN']) as any, productController.deleteProduct);

export default router;
