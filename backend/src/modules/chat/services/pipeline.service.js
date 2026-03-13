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

    async handleVacancyIntent(ownerId, language = 'id') {
        const isEn = language === 'en';
        try {
            console.log(`⚡ Pipeline: Early Exit -> Fetching vacancies for owner -> ${ownerId}`);
            const { vacancies } = await this.vacancyService.getVacancies(ownerId);
            console.log(`⚡ Pipeline: Found ${vacancies ? vacancies.length : 0} vacancies.`);

            if (vacancies && vacancies.length > 0) {
                const list = vacancies.map(v => {
                    let entry = `### 📋 **${v.title}**\n`;
                    if (v.address) entry += `* 📍 **${isEn ? 'Location' : 'Lokasi'}:** ${v.address}\n`;
                    if (v.phone) entry += `* 📞 **${isEn ? 'Contact' : 'Kontak'}:** ${v.phone}\n`;
                    if (v.salary) entry += `* 💰 **${isEn ? 'Salary' : 'Gaji'}:** ${v.salary}\n`;
                    if (v.detail) entry += `* 📝 **Detail:** ${v.detail.length > 150 ? v.detail.substring(0, 150) + '...' : v.detail}\n`;
                    entry += `\n---`;
                    return entry;
                }).join('\n\n');

                const intro = isEn
                    ? `Hello! We are currently opening the following job vacancies:`
                    : `Halo! Saat ini kami sedang membuka lowongan kerja berikut bre:`;
                const footer = isEn
                    ? `You can check the details or apply directly in the 'Jobs' menu. Anything interests you?`
                    : `Kamu bisa cek detailnya atau lamar langsung di menu 'Loker' ya. Ada yang bikin kamu tertarik?`;

                return `[SOP] ${intro}\n\n${list}\n\n${footer}${this.getSuggestionText('job_vacancy', [], language)}`;
            } else {
                return isEn
                    ? `[SOP] Hello! Currently, there are no active job vacancies. But you can check the 'Jobs' menu frequently, who knows there might be a suitable position for you!${this.getSuggestionText('job_vacancy', [], language)}`
                    : `[SOP] Halo! Saat ini kami belum ada lowongan kerja yang aktif bre. Tapi kamu bisa sering-sering cek menu 'Loker' siapa tau nanti ada posisi yang pas buat kamu!${this.getSuggestionText('job_vacancy', [], language)}`;
            }
        } catch (err) {
            console.error('⚡ Pipeline: Job Vacancy Error:', err);
            return isEn
                ? `[SOP] Hello! Sorry, there seems to be a minor issue while I was checking job vacancies. You can try checking directly in the 'Jobs' menu!`
                : `[SOP] Halo! Maaf sepertinya ada sedikit kendala saat saya mengecek lowongan kerja. Kamu bisa coba cek langsung di menu 'Loker' ya bre!`;
        }
    }

    handleSocialIntent(intent, language = 'id') {
        const isEn = language === 'en';
        const responses = {
            greeting: isEn
                ? "[SOP] Hello! How can I help you? I'm a store assistant ready to help you find products, check stock, or other info."
                : "[SOP] Halo! Ada yang bisa saya bantu bre? Saya asisten toko yang siap bantu kamu cari produk, cek stok, atau info lainnya.",
            asking_condition: isEn
                ? "[SOP] I'm doing great! Ready to serve you 24/7. Is there anything I can help you with in this store?"
                : "[SOP] Saya baik-baik saja bre, siap melayani kamu 24/7! Ada yang bisa saya bantu di toko ini?",
            thanks: isEn
                ? "[SOP] You're welcome! Happy to help. Anything else you'd like to ask?"
                : "[SOP] Sama-sama bre! Senang bisa membantu. Ada lagi yang mau ditanyakan?",
            goodbye: isEn
                ? "[SOP] Sure! See you again. Don't hesitate to come back if you need help. Stay safe!"
                : "[SOP] Siap bre, sampai jumpa lagi ya! Jangan ragu buat balik lagi kalau butuh bantuan. Stay safe!",
            bot_identity: isEn
                ? "[SOP] I am this store's AI assistant. My job is to help you shop more easily and provide info about the store and products."
                : "[SOP] Saya adalah asisten AI toko ini bre. Tugas saya ngebantu kamu belanja lebih gampang dan kasih info seputar toko dan produk.",
            bot_capability: isEn
                ? "[SOP] I can help you check product availability, find product locations on shelves, promo info, operating hours, to job vacancy info!"
                : "[SOP] Saya bisa bantu kamu cek ketersediaan produk, lokasi produk di rak mana, info promo, jam operasional, sampai info lowongan kerja bre!",
            confirmation: isEn
                ? "[SOP] Okay, sure! Anything else I can help with?"
                : "[SOP] Oke siap bre! Ada hal lain yang bisa saya bantu?",
            negation: isEn
                ? "[SOP] Okay, if there's anything else you'd like to ask, just let me know!"
                : "[SOP] Oke bre, kalau ada yang kurang pas atau mau tanya yang lain, langsung aja ya!",
            smalltalk: isEn
                ? "[SOP] Haha, you're funny! Anything serious you want to ask about our store or products?"
                : "[SOP] Hehe, bisa aja si bre. Ada yang serius mau ditanyain seputar toko atau produk kita?",
        };

        return responses[intent] || (isEn ? "[SOP] How can I help you?" : "[SOP] Ada yang bisa saya bantu bre?");
    }

    handleUtilityQuery(message, fullContext, language = 'id') {
        const text = message.toLowerCase();
        const now = new Date();
        const isEn = language === 'en';

        // 1. WEATHER (Check context first)
        if (text.includes('cuaca') || text.includes('hujan') || text.includes('panas') || text.includes('weather') || text.includes('rain') || text.includes('temperature')) {
            const weatherMatch = fullContext.match(/WTR:\s*(.*)/);
            if (weatherMatch && weatherMatch[1] && weatherMatch[1] !== 'NONE' && !weatherMatch[1].startsWith('0C')) {
                return isEn
                    ? `[GENERAL] Current weather info: **${weatherMatch[1]}**. Stay safe and take care of your health!`
                    : `[GENERAL] Info cuaca saat ini: **${weatherMatch[1]}**. Tetap waspada dan jaga kesehatan ya bre!`;
            }
            return isEn
                ? `[GENERAL] I don't have real-time weather data for your current location. Please check a weather app on your phone. But make sure to bring an umbrella before it rains!`
                : `[GENERAL] Gw gak ada data cuaca real-time buat lokasi lu saat ini bre. Coba cek aplikasi cuaca di HP lu ya. Tapi pastiin sedia payung sebelum hujan!`;
        }

        // 2. TIME
        if (text.includes('jam') || text.includes('pukul') || text.includes('waktu') || text.includes('time')) {
            const timeStr = now.toLocaleTimeString(isEn ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });
            return isEn
                ? `[GENERAL] It's currently **${timeStr}**. Anything else I can help you with?`
                : `[GENERAL] Sekarang jam **${timeStr}** bre. Ada lagi yang bisa gw bantu?`;
        }

        // 3. DATE
        if (text.includes('tanggal') || text.includes('date')) {
            const dateStr = now.toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            return isEn
                ? `[GENERAL] Today's date is **${dateStr}**.`
                : `[GENERAL] Sekarang tanggal **${dateStr}** bre.`;
        }

        // 4. DAY
        if (text.includes('hari') || text.includes('day')) {
            const daysId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayStr = isEn ? daysEn[now.getDay()] : daysId[now.getDay()];
            return isEn
                ? `[GENERAL] Today is **${dayStr}**. Have a great day!`
                : `[GENERAL] Hari ini hari **${dayStr}** bre. Semangat ya jalanin harinya!`;
        }

        return isEn
            ? "[GENERAL] I'm a store assistant, is there anything I can help you with regarding products or services here?"
            : "[GENERAL] Gw asisten toko bre, ada yang bisa gw bantu seputar produk atau layanan di sini?";
    }

    getSuggestionText(intent, parsedProducts, language = 'id') {
        const isEn = language === 'en';
        const mapper = {
            product_availability: isEn ? 'is there' : 'ada',
            product_location: isEn ? 'where is' : 'dimana',
            stock_status: isEn ? 'stock' : 'stok',
            price_and_promo: isEn ? 'price' : 'promo',
            job_vacancy: isEn ? 'job info' : 'info loker'
        };
        const k = mapper[intent] || (isEn ? 'check' : 'cek');
        const sampleProduct = (parsedProducts && parsedProducts.length > 0) ? ` ${parsedProducts[0].name}` : (intent === 'job_vacancy' ? '' : (isEn ? ' [product name]' : ' [nama produk]'));

        return isEn
            ? `\n\n[TIP] _Maybe you can try asking using clearer keywords, for example: "${k}${sampleProduct}"_`
            : `\n\n[TIP] _Mungkin kamu bisa coba tanya pakai kata kunci yang lebih jelas bre, contohnya: "${k}${sampleProduct}"_`;
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
        onChunk,
        isBackground = false
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
        const isEn = language === 'en';

        // --- 2.1 EARLY EXIT: JOB VACANCY ---
        if (ruleBasedIntent === 'job_vacancy') {
            finalResponse = await this.handleVacancyIntent(ownerId, language);
            // Artificial delay for consistency as requested by user
            await new Promise(res => setTimeout(res, 1000));
            if (onChunk) onChunk(finalResponse);
            await this.cache.set(cacheKey, message, finalResponse);
            return { answer: finalResponse, metadata: finalMetadata };
        }

        // --- 2.1.5 EARLY EXIT: UTILITY QUERY ---
        if (ruleBasedIntent === 'utility_query') {
            finalResponse = this.handleUtilityQuery(message, fullContext, language);
            // Artificial delay for consistency as requested by user
            await new Promise(res => setTimeout(res, 1000));
            if (onChunk) onChunk(finalResponse);
            await this.cache.set(cacheKey, message, finalResponse);
            return { answer: finalResponse, metadata: finalMetadata };
        }

        // --- 2.1.5.5 EARLY EXIT: SWITCH LANGUAGE ---
        if (ruleBasedIntent === 'switch_language') {
            finalResponse = isEn
                ? "[SOP] Language switched to English. I'm ready to help you in English!"
                : "[SOP] Bahasa berhasil diganti ke Bahasa Indonesia. Saya siap membantu kamu!";
            // Artificial delay for consistency as requested by user
            await new Promise(res => setTimeout(res, 1000));
            if (onChunk) onChunk(finalResponse);
            await this.cache.set(cacheKey, message, finalResponse);
            return { answer: finalResponse, metadata: finalMetadata };
        }

        // --- 2.1.6 EARLY EXIT: SOCIAL INTENTS ---
        const socialIntents = [
            'greeting', 'asking_condition', 'thanks', 'goodbye',
            'bot_identity', 'bot_capability', 'confirmation', 'negation', 'smalltalk'
        ];
        if (socialIntents.includes(ruleBasedIntent)) {
            finalResponse = this.handleSocialIntent(ruleBasedIntent, language);
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
                        const lokasi = isEn
                            ? (targetProduct.aisle ? `Aisle ${targetProduct.aisle}` : (targetProduct.rak ? `Shelf ${targetProduct.rak}` : 'in the store'))
                            : (targetProduct.aisle ? `Lorong ${targetProduct.aisle}` : (targetProduct.rak ? `Rak ${targetProduct.rak}` : 'di toko'));

                        finalResponse = isEn
                            ? `[FOUND] Yes, ${targetProduct.name} is available for ${curHtml}${targetProduct.price.toLocaleString('en-US')}. Current stock is ${targetProduct.stock} units and can be found at ${lokasi}. [SAFE_IDS: ${targetProduct.id}]`
                            : `[FOUND] Ya, ${targetProduct.name} tersedia dengan harga ${curHtml}${targetProduct.price.toLocaleString('id-ID')}. Sisa stok saat ini ada ${targetProduct.stock} unit dan bisa ditemukan di ${lokasi}. [SAFE_IDS: ${targetProduct.id}]`;
                    } else {
                        finalResponse = isEn
                            ? `[NOT_FOUND] Sorry, ${targetProduct.name} is currently out of stock.`
                            : `[NOT_FOUND] Maaf, stok ${targetProduct.name} sedang kosong.`;
                    }
                } else {
                    finalResponse = isEn
                        ? `[NOT_FOUND] Sorry, I couldn't detect that product in this store's context. What are you looking for?${this.getSuggestionText(ruleBasedIntent, parsedProducts, language)}`
                        : `[NOT_FOUND] Maaf, saya tidak dapat mendeteksi produk tersebut dalam konteks toko ini. Anda sedang mencari apa?${this.getSuggestionText(ruleBasedIntent, parsedProducts, language)}`;
                }
            } else if (ruleBasedIntent === 'product_location') {
                const targetProduct = IntentClassifier.extractProductName(message, parsedProducts);
                if (targetProduct) {
                    const lokasi = isEn
                        ? (targetProduct.aisle ? `Aisle ${targetProduct.aisle}` : (targetProduct.rak ? `Shelf ${targetProduct.rak}` : 'in the store'))
                        : (targetProduct.aisle ? `Lorong ${targetProduct.aisle}` : (targetProduct.rak ? `Rak ${targetProduct.rak}` : 'di toko'));

                    finalResponse = isEn
                        ? `[FOUND] ${targetProduct.name} can be found at ${lokasi}. [SAFE_IDS: ${targetProduct.id}]`
                        : `[FOUND] ${targetProduct.name} bisa ditemukan di ${lokasi}. [SAFE_IDS: ${targetProduct.id}]`;
                } else {
                    finalResponse = isEn
                        ? `[NOT_FOUND] Sorry, I couldn't find the location for that product.${this.getSuggestionText(ruleBasedIntent, parsedProducts, language)}`
                        : `[NOT_FOUND] Maaf, saya tidak menemukan lokasi produk tersebut.${this.getSuggestionText(ruleBasedIntent, parsedProducts, language)}`;
                }
            } else if (ruleBasedIntent === 'stock_status') {
                const targetProduct = IntentClassifier.extractProductName(message, parsedProducts);
                if (targetProduct) {
                    if (targetProduct.stock > 0) {
                        finalResponse = isEn
                            ? `[FOUND] Current stock for ${targetProduct.name} is ${targetProduct.stock} units. [SAFE_IDS: ${targetProduct.id}]`
                            : `[FOUND] Sisa stok ${targetProduct.name} saat ini ada ${targetProduct.stock} unit. [SAFE_IDS: ${targetProduct.id}]`;
                    } else {
                        finalResponse = isEn
                            ? `[NOT_FOUND] ${targetProduct.name} is out of stock.`
                            : `[NOT_FOUND] Stok ${targetProduct.name} sudah habis/kosong.`;
                    }
                } else {
                    finalResponse = isEn
                        ? `[NOT_FOUND] Sorry, the product stock info you're looking for was not found.${this.getSuggestionText(ruleBasedIntent, parsedProducts, language)}`
                        : `[NOT_FOUND] Maaf, stok produk yang dimaksud tidak ditemukan.${this.getSuggestionText(ruleBasedIntent, parsedProducts, language)}`;
                }
            } else if (ruleBasedIntent === 'price_and_promo') {
                const targetProduct = IntentClassifier.extractProductName(message, parsedProducts);
                if (targetProduct) {
                    const curHtml = await this._getCurrencyHtml(ownerId);
                    finalResponse = isEn
                        ? `[FOUND] The price for ${targetProduct.name} is ${curHtml}${targetProduct.price.toLocaleString('en-US')}. [SAFE_IDS: ${targetProduct.id}]`
                        : `[FOUND] Harga ${targetProduct.name} adalah ${curHtml}${targetProduct.price.toLocaleString('id-ID')}. [SAFE_IDS: ${targetProduct.id}]`;
                } else {
                    finalResponse = isEn
                        ? `[NOT_FOUND] Please mention the product name to see the price.${this.getSuggestionText(ruleBasedIntent, parsedProducts, language)}`
                        : `[NOT_FOUND] Silakan sebutkan nama produknya untuk melihat harga.${this.getSuggestionText(ruleBasedIntent, parsedProducts, language)}`;
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
                const productResult = await this.productService.search(message, ownerId, 5, language);
                if (productResult) finalResponse = `[FOUND] ${productResult}`;
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
