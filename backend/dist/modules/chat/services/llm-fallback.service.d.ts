export declare class LlmFallbackService {
    generate(message: string, recentHistory: {
        role: string;
        content: string;
    }[], systemPrompt: string, fullContext: string, language: string, aiConfig: any, onChunk?: (chunk: string) => void): Promise<string>;
}
//# sourceMappingURL=llm-fallback.service.d.ts.map