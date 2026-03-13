import { AIService } from '../../../common/services/ai.service.js';

export class LlmFallbackService {
    async generate(
        message,
        recentHistory,
        systemPrompt,
        fullContext,
        language,
        aiConfig,
        onChunk
    ) {

        // We append the RAG/Full context to the prompt but keeping it strict
        const strictPrompt = `
${systemPrompt}

Goal: Provide immediate, accurate, and VERY BRIEF assistance.

Rules:
1. Respond in a SHORT and DIRECT style. Maximum 2 sentences.
2. If the user greets you, greet back briefly and ask how to help.
3. Use the [CONTEXT DATA] below for factual accuracy.
4. DO NOT use marketing fluff, unnecessary apologies, or long explanations.
5. If the request is for product search, you should have been bypassed; if you are here, provide a very brief general answer.
6. CRITICAL: If you mention a specific product from [CONTEXT DATA], you MUST append "[SAFE_IDS: productId]" at the end of your response.

[CONTEXT DATA]
${fullContext}
`;

        const optimizedConfig = {
            ...aiConfig,
            aiMaxTokens: 256, // Force strict token limit for faster response
            aiTemperature: 0.2, // Keep it deterministic
        };

        try {
            // Use the streaming method natively supported by the existing AIService
            // We pass only the last 3 messages of history for token efficiency
            return await AIService.generateGuestResponseStream(
                message,
                '', // We bundled context into strictPrompt
                language,
                strictPrompt,
                optimizedConfig,
                onChunk,
                recentHistory.slice(-3)
            );
        } catch (error) {
            console.error('LLM Fallback failed:', error);
            const fallbackMsg = language === 'en'
                ? "Sorry, our system is busy. Please contact our staff."
                : 'Mohon maaf, sistem kami sedang sibuk. Silakan hubungi staff kami.';
            if (onChunk) onChunk(fallbackMsg);
            return fallbackMsg;
        }
    }
}
