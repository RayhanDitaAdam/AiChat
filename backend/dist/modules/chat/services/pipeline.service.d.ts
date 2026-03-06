export declare class ChatPipelineService {
    private cache;
    private intentService;
    private faqService;
    private actionService;
    private llmFallback;
    constructor();
    process(message: string, recentHistory: {
        role: string;
        content: string;
    }[], userId: string | null, ownerId: string, language: string, systemPrompt: string, fullContext: string, aiConfig: any, onChunk?: (chunk: string) => void): Promise<string>;
}
//# sourceMappingURL=pipeline.service.d.ts.map