const { firefox } = require('playwright');
const fs = require('fs');

(async () => {
    // 1. Accepts store name, defaults to alysa-market for testing
    let storeName = process.argv[2] || 'alysa-market';

    // Some basic cleanup in case the user pastes a full URL instead of the store name
    if (storeName.includes('tokopedia.com')) {
        const parts = storeName.split('tokopedia.com/')[1];
        if (parts) {
            storeName = parts.split('/')[0];
        }
    }

    const url = `https://www.tokopedia.com/${storeName}/product`;

    console.log(`Scraping store: ${url}`);

    const browser = await firefox.launch({
        headless: true
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        }
    });

    // Mask playwright
    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    const page = await context.newPage();

    console.log('Navigating to the page...');
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });

    // Wait for the page to load initial content
    await page.waitForTimeout(5000);

    let allProducts = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        console.log(`\n--- Scraping Page ${currentPage} ---`);

        // 2. Scroll to the bottom properly to trigger lazy-loading of all product images
        console.log('Scrolling down to load products...');
        let previousHeight = 0;
        let sameHeightCount = 0;

        while (sameHeightCount < 5) {
            const currentHeight = await page.evaluate('document.documentElement.scrollHeight');
            await page.evaluate('window.scrollBy(0, 800)');
            await page.waitForTimeout(1000); // 1 second between scrolls to allow image loading

            if (currentHeight === previousHeight) {
                sameHeightCount++;
            } else {
                previousHeight = currentHeight;
                sameHeightCount = 0;
            }
        }

        // Wait one final time for images to load
        await page.waitForTimeout(3000);

        // 3. Scrape data specific to Tokopedia layout
        console.log('Extracting product data...');
        const productsOnPage = await page.evaluate(() => {
            const results = [];
            // Target elements that match product image specifically
            const images = document.querySelectorAll('img[alt="product-image"]');

            images.forEach(img => {
                try {
                    // Start from the image and find the closest anchor parent
                    const card = img.closest('a');
                    if (!card) return;

                    let name = '';
                    let image = img.src || '';
                    let price = '';
                    let link = card.href || '';

                    // The innerText of the card usually splits nicely by lines
                    // Examples: "Product Name\nRp10.000\n5.0\n6 terjual"
                    const textLines = card.innerText
                        .split('\n')
                        .map(t => t.trim())
                        // Remove empty lines
                        .filter(t => t.length > 0);

                    // Find the price index (usually starts with Rp)
                    const priceIndex = textLines.findIndex(t => t.startsWith('Rp'));

                    if (priceIndex !== -1) {
                        price = textLines[priceIndex];
                        // The name is typically located directly before the price in the block
                        if (priceIndex > 0) {
                            name = textLines[priceIndex - 1];

                            // In case of a badge like "Grosir" or "PreOrder", textLines[priceIndex - 1] 
                            // might be short. Let's do a fallback:
                            if (name.length < 10 && priceIndex > 1) {
                                name = textLines[priceIndex - 2];
                            }
                        }
                    } else {
                        // Fallback if no Rp found
                        name = textLines[0];
                    }

                    if (name && price) {
                        results.push({ name, image, price, link });
                    }
                } catch (e) {
                    // Ignore individual item parsing error
                }
            });
            return results;
        });

        // Deduplicate inside the page just in case of duplicate renderings
        const uniqueProducts = [];
        const seenNames = new Set();
        productsOnPage.forEach(p => {
            if (!seenNames.has(p.name)) {
                seenNames.add(p.name);
                uniqueProducts.push(p);
            }
        });

        allProducts.push(...uniqueProducts);
        console.log(`Scraped ${uniqueProducts.length} unique products on this page.`);

        // 4. Check if there's a next page and click it
        console.log('Checking for next page...');

        // Tokopedia pagination button usually has aria-label="Laman berikutnya"
        const nextButton = page.locator('button[aria-label="Laman berikutnya"], a[aria-label="Laman berikutnya"]');

        if (await nextButton.count() > 0 && await nextButton.isVisible()) {
            // Check if disabled
            const isDisabled = await nextButton.evaluate(btn => btn.disabled || btn.getAttribute('aria-disabled') === 'true');
            if (!isDisabled) {
                console.log('Clicking next page button...');
                await nextButton.scrollIntoViewIfNeeded();
                await page.waitForTimeout(1000);
                await nextButton.click();
                currentPage++;

                // Keep waiting for network payload to arrive and page to render
                await page.waitForTimeout(5000);
            } else {
                console.log('Next page button is disabled. End of pagination.');
                hasNextPage = false;
            }
        } else {
            console.log('No next page button found. Assuming single page or end of results.');
            hasNextPage = false;
        }
    }

    // Output JSON
    const outputFile = 'tokopedia_products.json';
    fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2), 'utf-8');
    console.log(`\nAll done! Total products scraped: ${allProducts.length}`);
    console.log(`Data saved to ${outputFile}`);

    await browser.close();
})();
