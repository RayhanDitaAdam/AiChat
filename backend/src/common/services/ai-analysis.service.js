import { AIService } from './ai.service.js';
import prisma from './prisma.service.js';

export class AIAnalysisService {
    static async analyzeSOP(content, language = 'id') {
        try {
            const systemConfig = await prisma.systemConfig.findUnique({ where: { id: 'global' } });

            // We'll use gemini-3-flash-preview as requested
            const aiConfig = {
                aiModel: 'gemini-3-flash-preview',
                aiTemperature: 0.2,
                aiMaxTokens: 2048,
            };

            const model = await AIService.getModel(undefined, aiConfig);
            if (!model) {
                throw new Error('AI Service unavailable');
            }

            const prompt = `
                You are a professional Business Analyst and HR Consultant.
                TASK: Analyze the provided Standard Operating Procedure (SOP) document text.
                
                Document Content:
                """
                ${content}
                """
                
                Please provide the following in ${language === 'en' ? 'English' : 'Indonesian'}:
                1. A concise summary of the document.
                2. Key points that are specifically relevant to employees or staff (their duties, rules, or benefits).
                
                Format the output beautifully in Markdown.
                Use the following structure:
                
                ### 📋 Ringkasan Dokumen
                (Your summary here)
                
                ### 👥 Poin untuk Karyawan
                (List of employee-related points here)
            `;

            let responseText = "";
            const response = await model.client.models.generateContent({
                model: model.modelName,
                contents: prompt,
                config: {
                    ...model.generationConfig,
                    systemInstruction: model.systemInstruction
                }
            });
            responseText = response.text;

            return responseText;
        } catch (error) {
            console.error('[AIAnalysisService] SOP Analysis error:', error);
            throw error;
        }
    }
}
