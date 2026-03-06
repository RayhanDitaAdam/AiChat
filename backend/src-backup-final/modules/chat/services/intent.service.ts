import { AIService } from '../../../common/services/ai.service.js';

export interface IntentResult {
    intent: 'greeting' | 'faq' | 'order_status' | 'refund_request' | 'complaint' | 'unknown' | 'action';
    confidence: number;
}

export class IntentService {
    private aiService: AIService;

    constructor() {
        this.aiService = new AIService();
    }

    async classify(message: string): Promise<IntentResult> {
        const lowerMsg = message.toLowerCase().trim();

        // 1. KEYWORD-BASED FAST ROUTING (BYPASS LLM)
        const GREETING_KEYWORDS = ['halo', 'hi', 'pagi', 'siang', 'sore', 'malam', 'p', 'woy', 'test', 'halo asisten', 'pagi asisten'];
        if (GREETING_KEYWORDS.includes(lowerMsg) || lowerMsg.length <= 4) {
            // Simple short messages or greetings are mostly 'greeting'
            return { intent: 'greeting', confidence: 0.95 };
        }

        const FAQ_KEYWORDS = ['jam buka', 'lokasi', 'alamat', 'cara beli', 'cara belanja', 'ongkir', 'pengiriman', 'metode pembayaran', 'transfer', 'bayar'];
        if (FAQ_KEYWORDS.some(kw => lowerMsg.includes(kw))) {
            return { intent: 'faq', confidence: 0.85 };
        }

        const ORDER_KEYWORDS = ['cek pesanan', 'status pesanan', 'mana pesanan', 'belum sampai', 'resi'];
        if (ORDER_KEYWORDS.some(kw => lowerMsg.includes(kw))) {
            return { intent: 'order_status', confidence: 0.85 };
        }

        // 2. LLM-BASED CLASSIFICATION (BACKUP)
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
            const response = await AIService.generateSystemResponse(
                message,
                systemPrompt,
                [],
                {},
                undefined,
                0.1 // Low temperature for deterministic output
            );

            // Clean the response
            const cleanResponse = response.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
            const parsed = JSON.parse(cleanResponse) as IntentResult;

            return parsed;
        } catch (error) {
            console.error('Intent classification failed:', error);
            return { intent: 'unknown', confidence: 0 };
        }
    }
}
