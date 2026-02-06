import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises';
import { ProductService } from './product.service.js';
const productService = new ProductService();
export class ProductController {
    /**
     * POST /api/products/upload
     * Bulk upload products via Excel (Owner only)
     */
    async uploadProducts(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners can upload products'
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded'
                });
            }
            // Parse Excel
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
                return res.status(400).json({ status: 'error', message: 'Excel file has no sheets' });
            }
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                return res.status(400).json({ status: 'error', message: 'Sheet not found in Excel' });
            }
            const data = XLSX.utils.sheet_to_json(sheet);
            if (!Array.isArray(data) || data.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Excel file is empty or invalid'
                });
            }
            // Simple validation and mapping
            // Columns: Name, Price, Stock, Halal, Aisle, Rak, Category, Description
            // We should be flexible with casing and spaces
            const products = data.map((row) => {
                const findKey = (keys) => {
                    const found = Object.keys(row).find(k => keys.includes(k.trim().toLowerCase()));
                    return found ? row[found] : undefined;
                };
                return {
                    name: findKey(['name', 'nama', 'nama produk']),
                    price: parseFloat(findKey(['price', 'harga']) || '0'),
                    stock: parseInt(findKey(['stock', 'stok']) || '0'),
                    halal: (findKey(['halal'])?.toString().toLowerCase() === 'true' || findKey(['halal']) === '1' || findKey(['halal']) === true),
                    aisle: findKey(['aisle', 'lorong'])?.toString() || '',
                    rak: findKey(['rak', 'section', 'bagian'])?.toString() || '',
                    category: findKey(['category', 'kategori'])?.toString() || 'General',
                    description: findKey(['description', 'deskripsi'])?.toString() || '',
                    videoUrl: findKey(['video url', 'video', 'link video'])?.toString() || null,
                    ingredients: findKey(['ingredients', 'igredient', 'bahan'])?.toString() || null,
                    isFastMoving: (findKey(['fast moving', 'laku'])?.toString().toLowerCase() === 'true' || findKey(['fast moving']) === '1'),
                    isSecondHand: (findKey(['second hand', 'bekas'])?.toString().toLowerCase() === 'true' || findKey(['second hand']) === '1'),
                    productType: findKey(['product type', 'tipe', 'status penawaran'])?.toString()?.toLowerCase() === 'sewa' ? 'sewa' : 'jual',
                    bedType: findKey(['bed type', 'tipe kasur'])?.toString() || null,
                    room: findKey(['room', 'ruangan', 'lokasi room'])?.toString() || null,
                    section: findKey(['section', 'bagian lokasi'])?.toString() || null,
                    view360Url: findKey(['360 view', 'vvisualisasi 360', 'link online produk'])?.toString() || null,
                };
            }).filter(p => p.name);
            if (products.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No valid products found in Excel'
                });
            }
            const result = await productService.bulkCreateProducts(req.user.ownerId, products);
            return res.json(result);
        }
        catch (error) {
            console.error('Upload Products Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to upload products'
            });
        }
    }
    /**
     * GET /api/products/:ownerId
     * Get products by owner ID
     */
    async getProductsByOwner(req, res) {
        try {
            const ownerId = req.params.ownerId;
            const result = await productService.getProductsByOwner(ownerId);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Products Controller Error:', error);
            return res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch products'
            });
        }
    }
    /**
     * POST /api/products
     * Create new product (Owner only)
     */
    async createProduct(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners can create products'
                });
            }
            let imageData = { ...req.body };
            // Handle image upload
            if (req.file) {
                const uploadDir = path.join(process.cwd(), 'uploads/products');
                await fs.mkdir(uploadDir, { recursive: true });
                const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
                const filePath = path.join(uploadDir, fileName);
                await fs.writeFile(filePath, req.file.buffer);
                imageData.image = `/uploads/products/${fileName}`;
            }
            // Convert types since they come as strings in multipart/form-data
            if (imageData.price)
                imageData.price = parseFloat(imageData.price);
            if (imageData.stock)
                imageData.stock = parseInt(imageData.stock);
            if (imageData.halal)
                imageData.halal = imageData.halal === 'true' || imageData.halal === true;
            if (imageData.isFastMoving)
                imageData.isFastMoving = imageData.isFastMoving === 'true' || imageData.isFastMoving === true;
            if (imageData.isSecondHand)
                imageData.isSecondHand = imageData.isSecondHand === 'true' || imageData.isSecondHand === true;
            const result = await productService.createProduct(req.user.ownerId, imageData);
            return res.status(201).json(result);
        }
        catch (error) {
            console.error('Create Product Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to create product'
            });
        }
    }
    /**
     * PATCH /api/products/:id
     * Update existing product (Owner only)
     */
    async updateProduct(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners can update products'
                });
            }
            const productId = req.params.id;
            let updateData = { ...req.body };
            // Handle image upload
            if (req.file) {
                const uploadDir = path.join(process.cwd(), 'uploads/products');
                await fs.mkdir(uploadDir, { recursive: true });
                const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
                const filePath = path.join(uploadDir, fileName);
                await fs.writeFile(filePath, req.file.buffer);
                updateData.image = `/uploads/products/${fileName}`;
            }
            // Convert types
            if (updateData.price)
                updateData.price = parseFloat(updateData.price);
            if (updateData.stock)
                updateData.stock = parseInt(updateData.stock);
            if (updateData.halal)
                updateData.halal = updateData.halal === 'true' || updateData.halal === true;
            if (updateData.isFastMoving)
                updateData.isFastMoving = updateData.isFastMoving === 'true' || updateData.isFastMoving === true;
            if (updateData.isSecondHand)
                updateData.isSecondHand = updateData.isSecondHand === 'true' || updateData.isSecondHand === true;
            const result = await productService.updateProduct(productId, req.user.ownerId, updateData);
            return res.json(result);
        }
        catch (error) {
            console.error('Update Product Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update product'
            });
        }
    }
    /**
     * DELETE /api/products/:id
     * Delete product (Owner only)
     */
    /**
     * DELETE /api/products/:id
     * Delete product (Owner only)
     */
    async deleteProduct(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners can delete products'
                });
            }
            const productId = req.params.id;
            const result = await productService.deleteProduct(productId, req.user.ownerId);
            return res.json(result);
        }
        catch (error) {
            console.error('Delete Product Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to delete product'
            });
        }
    }
    /**
     * GET /api/products/owner/forecasting
     */
    async getProductForecasting(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await productService.identifyFastMovingProducts(req.user.ownerId);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Forecasting failed' });
        }
    }
    /**
     * POST /api/products/owner/promos
     */
    async createPromo(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await productService.createProductPromo(req.user.ownerId, req.body);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Promo creation failed' });
        }
    }
    /**
     * GET /api/products/owner/promos
     */
    async getPromos(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await productService.getPromosByOwner(req.user.ownerId);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to fetch promos' });
        }
    }
}
//# sourceMappingURL=product.controller.js.map