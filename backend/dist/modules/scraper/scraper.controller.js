import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const scrapeTokopedia = async (req, res) => {
    try {
        const ownerId = req.user?.ownerId || req.user?.id;
        if (!ownerId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        const { storeName } = req.body;
        if (!storeName) {
            res.status(400).json({ message: 'Store name is required' });
            return;
        }
        // Path to the scraper script
        const scraperPath = path.join(__dirname, '../../../../scraper/index.js');
        const outputPath = path.join(__dirname, '../../../../scraper/tokopedia_products.json');
        console.log(`[Scraper] Starting scrape for store: ${storeName}`);
        // Spawn child process to run the scraper
        const child = spawn('node', [scraperPath, storeName], {
            cwd: path.join(__dirname, '../../../../scraper')
        });
        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`[Scraper stdout] ${data.toString().trim()}`);
        });
        child.stderr.on('data', (data) => {
            console.error(`[Scraper stderr] ${data.toString().trim()}`);
        });
        child.on('close', async (code) => {
            console.log(`[Scraper] Process exited with code ${code}`);
            if (code !== 0) {
                res.status(500).json({ status: 'error', message: 'Scraper failed to execute completely' });
                return;
            }
            // Read the generated JSON file
            try {
                if (!fs.existsSync(outputPath)) {
                    res.status(500).json({ status: 'error', message: 'Scraper finished but output file not found' });
                    return;
                }
                const data = fs.readFileSync(outputPath, 'utf8');
                const products = JSON.parse(data);
                if (!Array.isArray(products) || products.length === 0) {
                    res.status(404).json({ status: 'error', message: 'No products found or scraped' });
                    return;
                }
                console.log(`[Scraper] Successfully scraped ${products.length} products. Inserting to database...`);
                // Map and insert the products
                // Depending on the scraper output format, map it to Prisma structure.
                // Assuming format: { name: string, image: string, price: string, link: string }
                let insertedCount = 0;
                for (const p of products) {
                    // Extract numeric price from "Rp15.000" string
                    let numericPrice = 0;
                    if (p.price) {
                        const cleanStr = p.price.replace(/[^0-9]/g, '');
                        numericPrice = parseInt(cleanStr, 10) || 0;
                    }
                    // Attempt upsert based on name + ownerId or just create
                    // Since name is not unique in schema, we just create for now.
                    await prisma.product.create({
                        data: {
                            owner_id: ownerId,
                            name: p.name,
                            price: numericPrice,
                            purchasePrice: 0,
                            stock: 0,
                            image: p.image,
                            aisle: 'Uncategorized', // Default required field
                            rak: 'Unassigned', // Default required field
                            description: ''
                        }
                    });
                    insertedCount++;
                }
                res.status(200).json({
                    status: 'success',
                    message: `Successfully scraped and imported ${insertedCount} products.`,
                    data: { count: insertedCount }
                });
            }
            catch (err) {
                console.error('[Scraper] Error parsing output or inserting to DB:', err);
                res.status(500).json({ status: 'error', message: 'Failed to process scraped data' });
            }
        });
    }
    catch (error) {
        console.error('Error initiating scrape:', error);
        res.status(500).json({ status: 'error', message: 'Failed to initiate scrape' });
    }
};
//# sourceMappingURL=scraper.controller.js.map