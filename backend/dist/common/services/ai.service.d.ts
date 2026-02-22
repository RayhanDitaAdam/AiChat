export declare class AIService {
    private static modelCache;
    static getModel(ownerId?: string, config?: any): Promise<any>;
    private static generateHash;
    private static handleAIError;
    private static getCachedResponse;
    private static saveToCache;
    static generateChatResponse(message: string, context: string, language?: string, systemPrompt?: string, history?: any[], category?: string, ownerId?: string, role?: string, config?: any): Promise<string>;
    static generateChatResponseStream(message: string, context: string, language?: string, systemPrompt?: string, history?: any[], category?: string, ownerId?: string, role?: string, config?: any, onChunk?: (text: string) => void): Promise<string>;
    static generateGuestResponseStream(message: string, context: string, language?: string, systemPrompt?: string, config?: any, onChunk?: (text: string) => void): Promise<string>;
    static generateGuestResponse(message: string, context: string, language?: string, systemPrompt?: string, config?: any): Promise<string>;
    static generateManagementResponse(message: string, context: string, userRole: string, config?: any): Promise<string>;
}
//# sourceMappingURL=ai.service.d.ts.map