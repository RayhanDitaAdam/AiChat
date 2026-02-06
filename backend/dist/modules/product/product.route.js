import { Router } from 'express';
import multer from 'multer';
import { ProductController } from './product.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { CreateProductSchema, UpdateProductSchema } from './product.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { requireOwner, requireApproved } from '../../common/middleware/rbac.middleware.js';
const router = Router();
const productController = new ProductController();
const upload = multer({ storage: multer.memoryStorage() });
const productImageUpload = upload.single('image');
// PUBLIC/USER routes
router.get('/:ownerId', (req, res) => productController.getProductsByOwner(req, res));
// OWNER only routes
router.post('/upload', authenticate, requireOwner(), requireApproved(), upload.single('file'), (req, res) => productController.uploadProducts(req, res));
router.post('/', authenticate, requireOwner(), requireApproved(), productImageUpload, (req, res) => productController.createProduct(req, res));
router.patch('/:id', authenticate, requireOwner(), requireApproved(), productImageUpload, (req, res) => productController.updateProduct(req, res));
router.delete('/:id', authenticate, requireOwner(), requireApproved(), (req, res) => productController.deleteProduct(req, res));
router.get('/owner/forecasting', authenticate, requireOwner(), requireApproved(), (req, res) => productController.getProductForecasting(req, res));
router.get('/owner/promos', authenticate, requireOwner(), requireApproved(), (req, res) => productController.getPromos(req, res));
router.post('/owner/promos', authenticate, requireOwner(), requireApproved(), (req, res) => productController.createPromo(req, res));
export default router;
//# sourceMappingURL=product.route.js.map