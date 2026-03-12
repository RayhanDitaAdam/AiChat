function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises';
import { ProductService } from './product.service.js';
import prisma from '../../common/services/prisma.service.js';

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
                    return found ? (row)[found] : undefined;
                };

                return {
                    name: findKey(['name', 'nama', 'nama produk']),
                    price: parseFloat(findKey(['price', 'harga']) || '0'),
                    stock: parseInt(findKey(['stock', 'stok']) || '0'),
                    halal: (_optionalChain([findKey, 'call', _ => _(['halal']), 'optionalAccess', _2 => _2.toString, 'call', _3 => _3(), 'access', _4 => _4.toLowerCase, 'call', _5 => _5()]) === 'true' || findKey(['halal']) === '1' || findKey(['halal']) === true),
                    aisle: _optionalChain([findKey, 'call', _6 => _6(['aisle', 'lorong']), 'optionalAccess', _7 => _7.toString, 'call', _8 => _8()]) || '',
                    rak: _optionalChain([findKey, 'call', _9 => _9(['rak', 'section', 'bagian']), 'optionalAccess', _10 => _10.toString, 'call', _11 => _11()]) || '',
                    category: _optionalChain([findKey, 'call', _12 => _12(['category', 'kategori']), 'optionalAccess', _13 => _13.toString, 'call', _14 => _14()]) || 'General',
                    description: _optionalChain([findKey, 'call', _15 => _15(['description', 'deskripsi']), 'optionalAccess', _16 => _16.toString, 'call', _17 => _17()]) || '',
                    image: _optionalChain([findKey, 'call', _18 => _18(['image', 'photo', 'gambar', 'link gambar', 'foto']), 'optionalAccess', _19 => _19.toString, 'call', _20 => _20()]) || null,
                    expiryDate: _optionalChain([findKey, 'call', _21 => _21(['expiry date', 'expired', 'kadaluarsa', 'exp']), 'optionalAccess', _22 => _22.toString, 'call', _23 => _23()]) || null,
                    videoUrl: _optionalChain([findKey, 'call', _24 => _24(['video url', 'video', 'link video']), 'optionalAccess', _25 => _25.toString, 'call', _26 => _26()]) || null,
                    ingredients: _optionalChain([findKey, 'call', _27 => _27(['ingredients', 'igredient', 'bahan']), 'optionalAccess', _28 => _28.toString, 'call', _29 => _29()]) || null,
                    isFastMoving: (_optionalChain([findKey, 'call', _30 => _30(['fast moving', 'laku']), 'optionalAccess', _31 => _31.toString, 'call', _32 => _32(), 'access', _33 => _33.toLowerCase, 'call', _34 => _34()]) === 'true' || findKey(['fast moving']) === '1'),
                    isSecondHand: (_optionalChain([findKey, 'call', _35 => _35(['second hand', 'bekas']), 'optionalAccess', _36 => _36.toString, 'call', _37 => _37(), 'access', _38 => _38.toLowerCase, 'call', _39 => _39()]) === 'true' || findKey(['second hand']) === '1'),
                    productType: _optionalChain([findKey, 'call', _40 => _40(['product type', 'tipe', 'status penawaran']), 'optionalAccess', _41 => _41.toString, 'call', _42 => _42(), 'optionalAccess', _43 => _43.toLowerCase, 'call', _44 => _44()]) === 'sewa' ? 'sewa' : 'jual',
                    bedType: _optionalChain([findKey, 'call', _45 => _45(['bed type', 'tipe kasur']), 'optionalAccess', _46 => _46.toString, 'call', _47 => _47()]) || null,
                    room: _optionalChain([findKey, 'call', _48 => _48(['room', 'ruangan', 'lokasi room']), 'optionalAccess', _49 => _49.toString, 'call', _50 => _50()]) || null,
                    section: _optionalChain([findKey, 'call', _51 => _51(['section', 'bagian lokasi']), 'optionalAccess', _52 => _52.toString, 'call', _53 => _53()]) || null,
                    view360Url: _optionalChain([findKey, 'call', _54 => _54(['360 view', 'vvisualisasi 360', 'link online produk']), 'optionalAccess', _55 => _55.toString, 'call', _56 => _56()]) || null,
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
        } catch (error) {
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
            const search = req.query.search;
            const status = req.query.status;
            const result = await productService.getProductsByOwner(ownerId, search, { status });
            return res.json(result);
        } catch (error) {
            console.error('Get Products Controller Error:', error);
            return res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch products'
            });
        }
    }

    /**
     * GET /api/products
     * Get products for the current user's store
     */
    async getProducts(req, res) {
        try {
            const effectiveStoreId = _optionalChain([req, 'access', _57 => _57.user, 'optionalAccess', _58 => _58.ownerId]) || _optionalChain([req, 'access', _59 => _59.user, 'optionalAccess', _60 => _60.memberOfId]);
            if (!req.user || !effectiveStoreId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required with store context'
                });
            }
            const search = req.query.search;
            const status = req.query.status;
            const result = await productService.getProductsByOwner(effectiveStoreId, search, { status });
            return res.json({ status: 'success', data: result.products });
        } catch (error) {
            console.error('Get My Products Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch products'
            });
        }
    }

    /**
     * GET /api/products/owner/pending
     * Get all pending products for the owner to review
     */
    async getPendingProducts(req, res) {
        try {
            if (!req.user || !req.user.ownerId || req.user.role !== 'OWNER') {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }

            const result = await productService.getProductsByOwner(req.user.ownerId, undefined, { status: 'PENDING' });
            return res.json({ status: 'success', products: result.products });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to fetch pending products' });
        }
    }

    /**
     * PATCH /api/products/approval/:id
     * Approve or reject a product submission
     */
    async updateProductStatus(req, res) {
        try {
            if (!req.user || !req.user.ownerId || req.user.role !== 'OWNER') {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }

            const productId = req.params.id;
            const { status } = req.body; // 'APPROVED' or 'REJECTED'

            if (status !== 'APPROVED' && status !== 'REJECTED') {
                return res.status(400).json({ status: 'error', message: 'Invalid status' });
            }

            const pid = productId;
            const oid = req.user.ownerId;
            const s = status;

            const result = await productService.updateProductStatus(pid, oid, s);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to update product status' });
        }
    }

    /**
     * PATCH /api/products/approval/bulk
     * Approve or reject multiple products
     */
    async bulkUpdateProductStatus(req, res) {
        try {
            if (!req.user || !req.user.ownerId || req.user.role !== 'OWNER') {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }

            const { productIds, status } = req.body; // productIds: string[], status: 'APPROVED' | 'REJECTED'

            if (!Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({ status: 'error', message: 'No product IDs provided' });
            }

            if (status !== 'APPROVED' && status !== 'REJECTED') {
                return res.status(400).json({ status: 'error', message: 'Invalid status' });
            }

            const result = await productService.bulkUpdateProductStatus(productIds, req.user.ownerId, status);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to update products status' });
        }
    }

    /**
     * POST /api/products
     * Create new product (Owner only)
     */
    async createProduct(req, res) {
        try {
            const effectiveStoreId = _optionalChain([req, 'access', _61 => _61.user, 'optionalAccess', _62 => _62.ownerId]) || _optionalChain([req, 'access', _63 => _63.user, 'optionalAccess', _64 => _64.memberOfId]);
            if (!req.user || !effectiveStoreId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Authentication required with store context'
                });
            }

            // Check if user is owner, contributor, or staff
            const isOwner = req.user.role === 'OWNER';
            const isContributor = req.user.role === 'CONTRIBUTOR';
            const isStaff = req.user.role === 'STAFF';

            if (!isOwner && !isContributor && !isStaff) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners, contributors, or staff can create products'
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
            } else if (imageData.imageUrl) {
                imageData.image = imageData.imageUrl;
            }
            delete imageData.imageUrl;



            // Convert types since they come as strings in multipart/form-data
            if (imageData.price) imageData.price = parseFloat(imageData.price);
            if (imageData.purchasePrice) imageData.purchasePrice = parseFloat(imageData.purchasePrice);
            if (imageData.stock) imageData.stock = Math.max(0, parseInt(imageData.stock));
            if (imageData.halal) imageData.halal = imageData.halal === 'true' || imageData.halal === true;
            if (imageData.isFastMoving) imageData.isFastMoving = imageData.isFastMoving === 'true' || imageData.isFastMoving === true;
            if (imageData.isSecondHand) imageData.isSecondHand = imageData.isSecondHand === 'true' || imageData.isSecondHand === true;

            const result = await productService.createProduct(
                effectiveStoreId,
                imageData,
                isContributor ? req.user.id : undefined
            );

            if (_optionalChain([req, 'access', _65 => _65.user, 'optionalAccess', _66 => _66.role]) === 'STAFF') {
                await prisma.staffActivity.create({
                    data: {
                        staffId: req.user.id,
                        ownerId: effectiveStoreId,
                        action: 'CREATE_PRODUCT',
                        description: `Added new product: "${imageData.name || 'Unknown'}"`,
                    }
                });
            }

            return res.status(201).json(result);
        } catch (error) {
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
            const effectiveStoreId = _optionalChain([req, 'access', _67 => _67.user, 'optionalAccess', _68 => _68.ownerId]) || _optionalChain([req, 'access', _69 => _69.user, 'optionalAccess', _70 => _70.memberOfId]);
            if (!req.user || !effectiveStoreId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }

            const isOwner = req.user.role === 'OWNER';
            const isContributor = req.user.role === 'CONTRIBUTOR';
            const isStaff = req.user.role === 'STAFF';

            if (!isOwner && !isContributor && !isStaff) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners, contributors, or staff can update products'
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
            } else if (updateData.imageUrl) {
                updateData.image = updateData.imageUrl;
            }
            delete updateData.imageUrl;



            // Convert types
            if (updateData.price) updateData.price = parseFloat(updateData.price);
            if (updateData.purchasePrice) updateData.purchasePrice = parseFloat(updateData.purchasePrice);
            if (updateData.stock) updateData.stock = Math.max(0, parseInt(updateData.stock));
            if (updateData.halal) updateData.halal = updateData.halal === 'true' || updateData.halal === true;
            if (updateData.isFastMoving) updateData.isFastMoving = updateData.isFastMoving === 'true' || updateData.isFastMoving === true;
            if (updateData.isSecondHand) updateData.isSecondHand = updateData.isSecondHand === 'true' || updateData.isSecondHand === true;

            // Fetch old product for detailed logging
            const oldProduct = await prisma.product.findUnique({ where: { id: productId } });

            const result = await productService.updateProduct(
                productId,
                effectiveStoreId,
                updateData,
                isContributor ? req.user.id : undefined
            );

            if (_optionalChain([req, 'access', _71 => _71.user, 'optionalAccess', _72 => _72.role]) === 'STAFF' && oldProduct) {
                // Determine what changed
                const changes = [];
                for (const key of ['name', 'price', 'stock', 'category', 'status']) {
                    if (updateData[key] !== undefined && updateData[key] !== oldProduct[key]) {
                        changes.push(`${key} from '${oldProduct[key]}' to '${updateData[key]}'`);
                    }
                }

                let desc = `Updated product "${oldProduct.name}"`;
                if (changes.length > 0) {
                    desc += ` (${changes.join(', ')})`;
                } else if (Object.keys(updateData).length > 0) {
                    desc += ` (details changed)`;
                }

                await prisma.staffActivity.create({
                    data: {
                        staffId: req.user.id,
                        ownerId: effectiveStoreId,
                        action: 'UPDATE_PRODUCT',
                        description: desc,
                    }
                });
            }

            return res.json(result);
        } catch (error) {
            console.error('Update Product Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update product'
            });
        }
    }

    /**
     * POST /api/products/bulk-delete
     * Bulk delete products
     */
    async bulkDeleteProducts(req, res) {
        console.log('==== BULK DELETE CALLED ====');
        console.log('req.body:', req.body);
        try {
            const effectiveStoreId = _optionalChain([req, 'access', _73 => _73.user, 'optionalAccess', _74 => _74.ownerId]) || _optionalChain([req, 'access', _75 => _75.user, 'optionalAccess', _76 => _76.memberOfId]);
            if (!req.user || !effectiveStoreId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }

            const isOwner = req.user.role === 'OWNER';
            const isStaff = req.user.role === 'STAFF';

            if (!isOwner && !isStaff) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners or staff can bulk delete products'
                });
            }

            const { productIds } = req.body;

            if (!Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({ status: 'error', message: 'No product IDs provided' });
            }

            const result = await productService.bulkDeleteProducts(productIds, effectiveStoreId);

            if (_optionalChain([req, 'access', _77 => _77.user, 'optionalAccess', _78 => _78.role]) === 'STAFF') {
                await prisma.staffActivity.create({
                    data: {
                        staffId: req.user.id,
                        ownerId: effectiveStoreId,
                        action: 'DELETE_PRODUCT',
                        description: `Bulk deleted ${result.count} products`,
                    }
                });
            }

            return res.json(result);
        } catch (error) {
            console.error('Bulk Delete Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to bulk delete products'
            });
        }
    }

    /**
     * DELETE /api/products/:id
     * Delete product (Owner only)
     */
    async deleteProduct(req, res) {
        try {
            const effectiveStoreId = _optionalChain([req, 'access', _79 => _79.user, 'optionalAccess', _80 => _80.ownerId]) || _optionalChain([req, 'access', _81 => _81.user, 'optionalAccess', _82 => _82.memberOfId]);
            if (!req.user || !effectiveStoreId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }

            const isOwner = req.user.role === 'OWNER';
            const isContributor = req.user.role === 'CONTRIBUTOR';
            const isStaff = req.user.role === 'STAFF';

            if (!isOwner && !isContributor && !isStaff) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners, contributors, or staff can delete products'
                });
            }

            const productId = req.params.id;

            // Fetch product name for logging
            const oldProduct = await prisma.product.findUnique({ where: { id: productId } });

            const result = await productService.deleteProduct(
                productId,
                effectiveStoreId,
                isContributor ? req.user.id : undefined
            );

            if (_optionalChain([req, 'access', _83 => _83.user, 'optionalAccess', _84 => _84.role]) === 'STAFF') {
                await prisma.staffActivity.create({
                    data: {
                        staffId: req.user.id,
                        ownerId: effectiveStoreId,
                        action: 'DELETE_PRODUCT',
                        description: `Deleted product "${_optionalChain([oldProduct, 'optionalAccess', _85 => _85.name]) || 'Unknown'}"`,
                    }
                });
            }

            return res.json(result);
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to fetch promos' });
        }
    }
}
