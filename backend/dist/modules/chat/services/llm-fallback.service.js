import { AIService } from '../../../common/services/ai.service.js';
export class LlmFallbackService {
    async generate(message, recentHistory, systemPrompt, fullContext, language, aiConfig, onChunk) {
        // We append the RAG/Full context to the prompt but keeping it strict
        const strictPrompt = `
${systemPrompt}

Rules:
1. Answer using the provided context only.
2. If the answer is not in the context or conversation history, politely say you do not know or will forward it to human support.
3. Keep your answers concise, under 3 sentences to save tokens.
4. Do not include internal thoughts, JSON, or formatting tags unless directed.

[CONTEXT DATA (Products/SOPs/Weather)]
${fullContext}
`;
        try {
            // Use the streaming method natively supported by the existing AIService
            // We pass only the last 3 messages of history for token efficiency
            return await AIService.generateGuestResponseStream(message, '', // We bundled context into strictPrompt
            language, strictPrompt, aiConfig, onChunk, recentHistory.slice(-3));
        }
        catch (error) {
            console.error('LLM Fallback failed:', error);
            const fallbackMsg = 'Mohon maaf, sistem kami sedang sibuk. Silakan hubungi staff kami.';
            if (onChunk)
                onChunk(fallbackMsg);
            return fallbackMsg;
        }
    }
}
//# sourceMappingURL=llm-fallback.service.js.map