export declare class AIService {
    static getModel(): Promise<import("@google/generative-ai").GenerativeModel | null>;
    static generateChatResponse(message: string, context: string, language?: string, systemPrompt?: string, history?: any[]): Promise<string>;
    static generateManagementResponse(message: string, context: string, userRole: string): Promise<string>;
}
//# sourceMappingURL=ai.service.d.ts.map