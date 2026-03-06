export interface IntentResult {
    intent: 'greeting' | 'faq' | 'order_status' | 'refund_request' | 'complaint' | 'unknown' | 'action';
    confidence: number;
}
export declare class IntentService {
    private aiService;
    constructor();
    classify(message: string): Promise<IntentResult>;
}
//# sourceMappingURL=intent.service.d.ts.map