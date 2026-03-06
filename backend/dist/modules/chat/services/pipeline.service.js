import { CacheService } from './cache.service.js';
import { IntentService } from './intent.service.js';
import { FaqService } from './faq.service.js';
import { ActionService } from './action.service.js';
import { LlmFallbackService } from './llm-fallback.service.js';
export class ChatPipelineService {
    cache;
    intentService;
    faqService;
    actionService;
    llmFallback;
    constructor() {
        this.cache = new CacheService();
        this.intentService = new IntentService();
        this.faqService = new FaqService();
        this.actionService = new ActionService();
        this.llmFallback = new LlmFallbackService();
    }
    async process(message, recentHistory, userId, ownerId, language, systemPrompt, fullContext, aiConfig, onChunk) {
        const ownerPrefix = ownerId || 'global';
        const cacheKey = `${ownerPrefix}:${language}`;
        // 1. CACHE CHECK
        const cachedResponse = await this.cache.get(cacheKey, message);
        if (cachedResponse) {
            console.log('⚡ Pipeline: CACHE HIT!');
            if (onChunk)
                onChunk(cachedResponse);
            return cachedResponse;
        }
        // 2. INTENT CLASSIFiCATION
        console.log('⚡ Pipeline: Classifying intent...');
        const classification = await this.intentService.classify(message);
        const { intent, confidence } = classification;
        console.log(`⚡ Pipeline: Intent detected -> ${intent} (${confidence})`);
        let finalResponse = '';
        // If intent is very clear, fulfill it without heavy LLM
        if (confidence > 0.7) {
            if (intent === 'greeting') {
                finalResponse = 'Halo! Saya asisten cerdas dari toko ini. Ada yang bisa saya bantu terkait produk atau layanan kami?';
            }
            else if (intent === 'faq') {
                console.log('⚡ Pipeline: Vector search for FAQ...');
                const faqResult = await this.faqService.search(message);
                if (faqResult) {
                    finalResponse = faqResult;
                }
            }
            else if (['order_status', 'refund_request', 'complaint'].includes(intent)) {
                console.log('⚡ Pipeline: Action requested...');
                const actionResult = await this.actionService.execute(intent, message, userId || undefined, ownerId);
                if (actionResult) {
                    finalResponse = actionResult;
                }
            }
        }
        // 4. LLM FALLBACK
        if (!finalResponse || finalResponse.trim() === '') {
            console.log('⚡ Pipeline: Falling back to Gemini LLM...');
            let retrievedContext = fullContext;
            if (['faq', 'unknown'].includes(intent)) {
                const contextDoc = await this.faqService.search(message, 5);
                if (contextDoc)
                    retrievedContext += `\nFAQ INFO: ${contextDoc}`;
            }
            finalResponse = await this.llmFallback.generate(message, recentHistory, systemPrompt, retrievedContext, language, aiConfig, onChunk);
        }
        else {
            // If we didn't use Fallback LLM (Cache/RAG/Action success), emit the chunk now to satisfy frontend
            if (onChunk)
                onChunk(finalResponse);
        }
        // 5. CACHE SAVE
        await this.cache.set(cacheKey, message, finalResponse);
        return finalResponse;
    }
}
//# sourceMappingURL=pipeline.service.js.map