export declare class FaqService {
    private client;
    private collection;
    private genAI;
    private isConnected;
    private fallbackData;
    constructor();
    private initChroma;
    private getEmbedding;
    addFaqItem(id: string, question: string, answer: string): Promise<void>;
    search(query: string, limit?: number): Promise<string | null>;
}
//# sourceMappingURL=faq.service.d.ts.map