import { AIService } from '../../../common/services/ai.service.js';
export class IntentService {
    aiService;
    constructor() {
        this.aiService = new AIService();
    }
    async classify(message) {
        const systemPrompt = `
You are an intent classifier for a customer service system.
Rules:
1. Return JSON only. No markdown, no triple backticks.
2. Do not explain anything.
3. Choose the closest intent from the given list.

List of intents:
- greeting (e.g., hello, hi, pagi, siang)
- faq (general questions, operational hours, how to buy, location)
- order_status (e.g., cek pesanan saya, status pengiriman)
- refund_request (e.g., refund, pengembalian dana, return barang)
- complaint (e.g., barang rusak, pelayanan jelek, complain)
- unknown (if none of the above matches or if the request is complex)

Output format:
{
  "intent": "string",
  "confidence": number
}`;
        try {
            // For the classifier we use a very fast small model request, bypassing long histories
            const response = await AIService.generateSystemResponse(message, systemPrompt, [], {}, 'gemini-1.5-flash', 0.1 // Low temperature for deterministic output
            );
            // Clean the response
            const cleanResponse = response.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
            const parsed = JSON.parse(cleanResponse);
            return parsed;
        }
        catch (error) {
            console.error('Intent classification failed:', error);
            return { intent: 'unknown', confidence: 0 };
        }
    }
}
//# sourceMappingURL=intent.service.js.map