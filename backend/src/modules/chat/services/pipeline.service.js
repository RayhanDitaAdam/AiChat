import { CacheService } from './cache.service.js';
import { IntentService } from './intent.service.js';
import { FaqService } from './faq.service.js';
import { ActionService } from './action.service.js';
import { ProductSearchService } from './product-search.service.js';
import { LlmFallbackService } from './llm-fallback.service.js';

export class ChatPipelineService {
    
    
    
    
    
    

    constructor() {
        this.cache = new CacheService();
        this.intentService = new IntentService();
        this.faqService = new FaqService();
        this.actionService = new ActionService();
        this.productService = new ProductSearchService();
        this.llmFallback = new LlmFallbackService();
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
            if (onChunk) onChunk(cachedResponse);
            return { answer: cachedResponse };
        }

        let finalResponse = '';
        let finalMetadata = {};

        // 2. KNOWLEDGE BASE SEARCH (Pre-emptive)
        console.log('⚡ Pipeline: Checking Knowledge Base (FAQ)...');
        const faqResult = await this.faqService.search(message, ownerPrefix);

        if (faqResult) {
            const { answer, metadata, matchType } = faqResult;
            finalMetadata = { ...finalMetadata, ...metadata };

            if (answer && answer.trim() !== '') {
                if (matchType === 'exact') {
                    console.log('⚡ Pipeline: KB Exact Match Found! (SHORT-CIRCUIT)');
                    finalResponse = `[SOP] ${answer}`;
                    if (onChunk) onChunk(finalResponse);
                    await this.cache.set(cacheKey, message, finalResponse);
                    return { answer: finalResponse, metadata: finalMetadata };
                }

                // For vector/fuzzy, we tentatively store it and validate after intent classification
                finalResponse = answer;
            }
        }

        // 3. INTENT CLASSIFICATION
        console.log('⚡ Pipeline: Classifying intent...');
        const classification = await this.intentService.classify(message);
        const { intent, confidence } = classification;
        console.log(`⚡ Pipeline: Intent detected -> ${intent} (${confidence})`);

        // OPTIMIZATION: If we found a KB answer but intent is 'greeting' or 'unknown', 
        // we should double-check if the KB answer is truly relevant.
        if (finalResponse) {
            if (intent === 'faq' || intent === 'greeting' || (confidence < 0.5 && intent === 'unknown')) {
                console.log('⚡ Pipeline: KB Match Validated by Intent.');
                finalResponse = `[SOP] ${finalResponse}`;
                if (onChunk) onChunk(finalResponse);
                await this.cache.set(cacheKey, message, finalResponse);
                return { answer: finalResponse, metadata: finalMetadata };
            } else {
                console.log('⚡ Pipeline: KB Match Rejected by Intent. Proceeding...');
                finalResponse = ''; // Reset to allow other logic or LLM fallback
            }
        }

        // If intent is very clear, fulfill it
        if (confidence > 0.7) {
            if (['order_status', 'refund_request', 'complaint'].includes(intent)) {
                console.log('⚡ Pipeline: Action requested...');
                const actionResult = await this.actionService.execute(intent, message, userId || undefined, ownerId);
                if (actionResult) {
                    finalResponse = actionResult;
                }
            }
            else if (intent === 'action' || message.toLowerCase().includes('cari') || message.toLowerCase().includes('ada')) {
                // Check if it's a product search
                console.log('⚡ Pipeline: Fast Product Search...');
                const productResult = await this.productService.search(message, ownerId);
                if (productResult) {
                    finalResponse = `[FOUND] ${productResult}`;
                }
            }
            else if (intent === 'greeting') {
                // For greetings, we can return a generic hello if KB didn't catch it
                finalResponse = "[GENERAL] Halo! Ada yang bisa saya bantu bre?";
            }
        }

        // 4. LLM FALLBACK
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
            // If we didn't use Fallback LLM (Cache/RAG/Action success), emit the chunk now to satisfy frontend
            if (onChunk) onChunk(finalResponse);
        }

        // 5. CACHE SAVE
        await this.cache.set(cacheKey, message, finalResponse);

        return { answer: finalResponse, metadata: finalMetadata };
    }
}
