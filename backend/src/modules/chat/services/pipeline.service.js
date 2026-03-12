import { CacheService } from './cache.service.js';
import { IntentService } from './intent.service.js';
import { IntentClassifier } from './intent-classifier.util.js';
import { FaqService } from './faq.service.js';
import { ActionService } from './action.service.js';
import { ProductSearchService } from './product-search.service.js';
import { LlmFallbackService } from './llm-fallback.service.js';
import { VacancyService } from '../../vacancy/vacancy.service.js';
import { OwnerService } from '../../owner/owner.service.js';

export class ChatPipelineService {







    constructor() {
        this.cache = new CacheService();
        this.intentService = new IntentService();
        this.faqService = new FaqService();
        this.actionService = new ActionService();
        this.productService = new ProductSearchService();
        this.llmFallback = new LlmFallbackService();
        this.vacancyService = new VacancyService();
        this.ownerService = new OwnerService();
    }

    async _getCurrencyHtml(ownerId) {
        try {
            const { config } = await this.ownerService.getOwnerConfig(ownerId);
            const currency = config?.currency || 'IDR';
            const symbols = { 'IDR': 'Rp', 'MYR': 'MYR', 'USD': '$', 'SGD': 'S$' };
            const symbol = symbols[currency] || currency;
            return `**${symbol}** `;
        } catch (err) {
            console.error('Pipeline: Failed to get currency config:', err);
            return 'Rp ';
        }
    }

    async handleVacancyIntent(ownerId) {
        try {
            console.log(`⚡ Pipeline: Early Exit -> Fetching vacancies for owner -> ${ownerId}`);
            const { vacancies } = await this.vacancyService.getVacancies(ownerId);
            console.log(`⚡ Pipeline: Found ${vacancies ? vacancies.length : 0} vacancies.`);

            if (vacancies && vacancies.length > 0) {
                const list = vacancies.map(v => {
                    let entry = `📌 **Position Title: ${v.title}**\n`;
                    if (v.address) entry += `📍 **Base Location:** ${v.address}\n`;
                    if (v.phone) entry += `📞 **Contact Number:** ${v.phone}\n`;
                    if (v.salary) entry += `💰 **Compensation:** ${v.salary}\n`;
                    if (v.detail) entry += `📝 **Role Specifics:** ${v.detail.length > 150 ? v.detail.substring(0, 150) + '...' : v.detail}\n`;
                    return entry;
                }).join('\n\n');

                return `[SOP] Halo! Saat ini kami sedang membuka lowongan kerja berikut bre:\n\n${list}\nKamu bisa cek detailnya atau lamar langsung di menu 'Loker' ya. Ada yang bikin kamu tertarik?${this.getSuggestionText('job_vacancy')}`;
            } else {
                return `[SOP] Halo! Saat ini kami belum ada lowongan kerja yang aktif bre. Tapi kamu bisa sering-sering cek menu 'Loker' siapa tau nanti ada posisi yang pas buat kamu!${this.getSuggestionText('job_vacancy')}`;
            }
        } catch (err) {
            console.error('⚡ Pipeline: Job Vacancy Error:', err);
            return `[SOP] Halo! Maaf sepertinya ada sedikit kendala saat saya mengecek lowongan kerja. Kamu bisa coba cek langsung di menu 'Loker' ya bre!`;
        }
    }

    handleUtilityQuery(message, fullContext) {
        const text = message.toLowerCase();
        const now = new Date();

        // 1. WEATHER (Check context first)
        if (text.includes('cuaca') || text.includes('hujan') || text.includes('panas') || text.includes('weather') || text.includes('rain')) {
            const weatherMatch = fullContext.match(/WTR:\s*(.*)/);
            if (weatherMatch && weatherMatch[1] && weatherMatch[1] !== 'NONE' && !weatherMatch[1].startsWith('0C')) {
                return `[GENERAL] Info cuaca saat ini: **${weatherMatch[1]}**. Tetap waspada dan jaga kesehatan ya bre!`;
            }
            return `[GENERAL] Gw gak ada data cuaca real-time buat lokasi lu saat ini bre. Coba cek aplikasi cuaca di HP lu ya. Tapi pastiin sedia payung sebelum hujan!`;
        }

        // 2. TIME
        if (text.includes('jam') || text.includes('pukul') || text.includes('waktu') || text.includes('time')) {
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return `[GENERAL] Sekarang jam **${timeStr}** bre. Ada lagi yang bisa gw bantu?`;
        }

        // 3. DATE
        if (text.includes('tanggal') || text.includes('date')) {
            const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            return `[GENERAL] Sekarang tanggal **${dateStr}** bre.`;
        }

        // 4. DAY
        if (text.includes('hari') || text.includes('day')) {
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const dayStr = days[now.getDay()];
            return `[GENERAL] Hari ini hari **${dayStr}** bre. Semangat ya jalanin harinya!`;
        }

        return "[GENERAL] Gw asisten toko bre, ada yang bisa gw bantu seputar produk atau layanan di sini?";
    }

    getSuggestionText(intent, parsedProducts) {
        const mapper = {
            product_availability: 'ada',
            product_location: 'dimana',
            stock_status: 'stok',
            price_and_promo: 'promo',
            job_vacancy: 'info loker'
        };
        const k = mapper[intent] || 'cek';
        const sampleProduct = (parsedProducts && parsedProducts.length > 0) ? ` ${parsedProducts[0].name}` : (intent === 'job_vacancy' ? '' : ' [nama produk]');

        return `\n\n[TIP] _Mungkin kamu bisa coba tanya pakai kata kunci yang lebih jelas bre, contohnya: "${k}${sampleProduct}"_`;
    }

    async process(
        message,
        recentHistory,
        userId,
        ownerId,
        language,
        systemPrompt,
        fullContext,
        aiConfig,
        onChunk
    ) {
        const ownerPrefix = ownerId || 'global';
        const cacheKey = `${ownerPrefix}:${language}`;

        // 1. CACHE CHECK
        const cachedResponse = await this.cache.get(cacheKey, message);
        if (cachedResponse) {
            console.log('⚡ Pipeline: CACHE HIT!');
            // Artificial delay for consistency as requested by user
            await new Promise(res => setTimeout(res, 1000));
            if (onChunk) onChunk(cachedResponse);
            return { answer: cachedResponse };
        }

        let finalResponse = '';
        let finalMetadata = {};

        // 2. RULE-BASED INTENT DETECTION (EARLY)
        console.log('⚡ Pipeline: Checking for Rule-Based Intent...');
        const ruleBasedIntent = IntentClassifier.classifyIntent(message);

        // --- 2.1 EARLY EXIT: JOB VACANCY ---
        if (ruleBasedIntent === 'job_vacancy') {
            finalResponse = await this.handleVacancyIntent(ownerId);
            // Artificial delay for consistency as requested by user
            await new Promise(res => setTimeout(res, 1000));
            if (onChunk) onChunk(finalResponse);
            await this.cache.set(cacheKey, message, finalResponse);
            return { answer: finalResponse, metadata: finalMetadata };
        }

        // --- 2.1.5 EARLY EXIT: UTILITY QUERY ---
        if (ruleBasedIntent === 'utility_query') {
            finalResponse = this.handleUtilityQuery(message, fullContext);
            // Artificial delay for consistency as requested by user
            await new Promise(res => setTimeout(res, 1000));
            if (onChunk) onChunk(finalResponse);
            await this.cache.set(cacheKey, message, finalResponse);
            return { answer: finalResponse, metadata: finalMetadata };
        }

        // --- 2.2 GUARDED CONTEXT PARSING (Only for Product Intents) ---
        const productIntents = [
            "product_availability",
            "product_location",
            "stock_status",
            "price_and_promo"
        ];

        let parsedProducts = [];
        if (productIntents.includes(ruleBasedIntent)) {
            console.log(`⚡ Pipeline: Parsing product context for intent -> ${ruleBasedIntent}`);
            const ctxMatch = fullContext.match(/CTX_PRODS:\s*(.*)/);
            if (ctxMatch && ctxMatch[1] && ctxMatch[1] !== 'NONE') {
                const parts = ctxMatch[1].split('|');
                parsedProducts = parts.map(p => {
                    // Match either Rp or any currency symbol/code followed by numbers
                    const match = p.match(/\[(.*?)\] (.*?), (.*?|Rp)(\d+), S:(\d+)(.*)/);
                    if (match) {
                        const extra = match[6] || '';
                        return {
                            id: match[1],
                            name: match[2].trim(),
                            price: parseInt(match[4]),
                            stock: parseInt(match[5]),
                            aisle: extra.includes('A:') ? extra.split('A:')[1].split(',')[0].trim() : null,
                            rak: extra.includes('R:') ? extra.split('R:')[1].split(',')[0].trim() : null
                        };
                    }
                    return null;
                }).filter(Boolean);
            }
        }

        // --- 2.3 RULE-BASED EXECUTION ---
        if (ruleBasedIntent !== 'general_chat') {
            console.log(`⚡ Pipeline: Executing Rule-Based Intent -> ${ruleBasedIntent}`);

            if (ruleBasedIntent === 'product_availability') {
                const targetProduct = IntentClassifier.extractProductName(message, parsedProducts);
                if (targetProduct) {
                    if (targetProduct.stock > 0) {
                        const curHtml = await this._getCurrencyHtml(ownerId);
                        const lokasi = targetProduct.aisle ? `Lorong ${targetProduct.aisle}` : (targetProduct.rak ? `Rak ${targetProduct.rak}` : 'di toko');
                        finalResponse = `[FOUND] Ya, ${targetProduct.name} tersedia dengan harga ${curHtml}${targetProduct.price.toLocaleString('id-ID')}. Sisa stok saat ini ada ${targetProduct.stock} unit dan bisa ditemukan di ${lokasi}.`;
                    } else {
                        finalResponse = `[NOT_FOUND] Maaf, stok ${targetProduct.name} sedang kosong.`;
                    }
                } else {
                    finalResponse = `[NOT_FOUND] Maaf, saya tidak dapat mendeteksi produk tersebut dalam konteks toko ini. Anda sedang mencari apa?${this.getSuggestionText(ruleBasedIntent, parsedProducts)}`;
                }
            } else if (ruleBasedIntent === 'product_location') {
                const targetProduct = IntentClassifier.extractProductName(message, parsedProducts);
                if (targetProduct) {
                    const lokasi = targetProduct.aisle ? `Lorong ${targetProduct.aisle}` : (targetProduct.rak ? `Rak ${targetProduct.rak}` : 'di toko');
                    finalResponse = `[FOUND] ${targetProduct.name} bisa ditemukan di ${lokasi}.`;
                } else {
                    finalResponse = `[NOT_FOUND] Maaf, saya tidak menemukan lokasi produk tersebut.${this.getSuggestionText(ruleBasedIntent, parsedProducts)}`;
                }
            } else if (ruleBasedIntent === 'stock_status') {
                const targetProduct = IntentClassifier.extractProductName(message, parsedProducts);
                if (targetProduct) {
                    if (targetProduct.stock > 0) {
                        finalResponse = `[FOUND] Sisa stok ${targetProduct.name} saat ini ada ${targetProduct.stock} unit.`;
                    } else {
                        finalResponse = `[NOT_FOUND] Stok ${targetProduct.name} sudah habis/kosong.`;
                    }
                } else {
                    finalResponse = `[NOT_FOUND] Maaf, stok produk yang dimaksud tidak ditemukan.${this.getSuggestionText(ruleBasedIntent, parsedProducts)}`;
                }
            } else if (ruleBasedIntent === 'price_and_promo') {
                const targetProduct = IntentClassifier.extractProductName(message, parsedProducts);
                if (targetProduct) {
                    const curHtml = await this._getCurrencyHtml(ownerId);
                    finalResponse = `[FOUND] Harga ${targetProduct.name} adalah ${curHtml}${targetProduct.price.toLocaleString('id-ID')}.`;
                } else {
                    finalResponse = `[NOT_FOUND] Silakan sebutkan nama produknya untuk melihat harga.${this.getSuggestionText(ruleBasedIntent, parsedProducts)}`;
                }
            }

            if (finalResponse) {
                console.log('⚡ Pipeline: Rule-Based Intent Handled (SHORT-CIRCUIT)');
                // Artificial delay for consistency as requested by user
                await new Promise(res => setTimeout(res, 1000));
                if (onChunk) onChunk(finalResponse);
                await this.cache.set(cacheKey, message, finalResponse);
                return { answer: finalResponse, metadata: finalMetadata };
            }
        }

        // 3. KNOWLEDGE BASE SEARCH (Pre-emptive)
        console.log('⚡ Pipeline: Checking Knowledge Base (FAQ)...');
        const faqResult = await this.faqService.search(message, ownerPrefix);

        if (faqResult) {
            const { answer, metadata, matchType } = faqResult;
            finalMetadata = { ...finalMetadata, ...metadata };

            if (answer && answer.trim() !== '') {
                if (matchType === 'exact') {
                    console.log('⚡ Pipeline: KB Exact Match Found! (SHORT-CIRCUIT)');
                    finalResponse = `[SOP] ${answer}`;
                    // Artificial delay for consistency as requested by user
                    await new Promise(res => setTimeout(res, 1000));
                    if (onChunk) onChunk(finalResponse);
                    await this.cache.set(cacheKey, message, finalResponse);
                    return { answer: finalResponse, metadata: finalMetadata };
                }
                finalResponse = answer;
            }
        }

        // 4. INTENT CLASSIFICATION (ML)
        console.log('⚡ Pipeline: Classifying intent (ML)...');
        const classification = await this.intentService.classify(message);
        const { intent, confidence } = classification;
        console.log(`⚡ Pipeline: Intent detected -> ${intent} (${confidence})`);

        if (finalResponse) {
            if (intent === 'faq' || intent === 'greeting' || (confidence < 0.5 && intent === 'unknown')) {
                console.log('⚡ Pipeline: KB Match Validated by Intent.');
                finalResponse = `[SOP] ${finalResponse}`;
                if (onChunk) onChunk(finalResponse);
                await this.cache.set(cacheKey, message, finalResponse);
                return { answer: finalResponse, metadata: finalMetadata };
            } else {
                console.log('⚡ Pipeline: KB Match Rejected by Intent. Proceeding...');
                finalResponse = '';
            }
        }

        // 5. ACTION & SEARCH FALLBACK
        if (confidence > 0.7) {
            if (['order_status', 'refund_request', 'complaint'].includes(intent)) {
                console.log('⚡ Pipeline: Action requested...');
                const actionResult = await this.actionService.execute(intent, message, userId || undefined, ownerId);
                if (actionResult) finalResponse = actionResult;
            }
            else if (intent === 'action' || message.toLowerCase().includes('cari') || message.toLowerCase().includes('ada')) {
                console.log('⚡ Pipeline: Fast Product Search...');
                const productResult = await this.productService.search(message, ownerId);
                if (productResult) finalResponse = `[FOUND] ${productResult}`;
            }
            else if (intent === 'greeting') {
                finalResponse = "[GENERAL] Halo! Ada yang bisa saya bantu bre?";
            }
        }

        // 6. LLM FALLBACK
        if (!finalResponse || finalResponse.trim() === '') {
            console.log('⚡ Pipeline: Falling back to Gemini LLM...');

            let retrievedContext = fullContext;
            if (['faq', 'greeting', 'unknown'].includes(intent)) {
                const contextDoc = await this.faqService.search(message, ownerPrefix, 5, true);
                if (contextDoc) retrievedContext += `\nFAQ INFO:\n${contextDoc}`;
            }

            finalResponse = await this.llmFallback.generate(
                message,
                recentHistory,
                systemPrompt,
                retrievedContext,
                language,
                aiConfig,
                onChunk
            );
        } else {
            if (onChunk) onChunk(finalResponse);
        }

        // 7. CACHE SAVE
        await this.cache.set(cacheKey, message, finalResponse);
        return { answer: finalResponse, metadata: finalMetadata };
    }
}
