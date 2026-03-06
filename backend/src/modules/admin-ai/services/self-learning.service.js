import prisma from '../../../common/services/prisma.service.js';
import { AIService } from '../../../common/services/ai.service.js';
import { KnowledgeBaseService } from './knowledge-base.service.js';

export class SelfLearningService {
    

    constructor() {
        this.kbService = new KnowledgeBaseService();
    }

    /**
     * Identifies unresolved chats and generates suggestions for new FAQs.
     * This is designed to be run via a Cron job.
     */
    async discoverNewKnowledge(ownerId, daysBack = 1) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        // Fetch unresolved or poorly answered sessions
        const targetSessions = await prisma.chatSession.findMany({
            where: {
                ownerId,
                createdAt: { gte: startDate },
                OR: [
                    { resolution: 'UNRESOLVED' },
                    { resolution: 'HUMAN_RESOLVED' },
                    { aiAccuracyTag: { in: ['BAD_ANSWER', 'HALLUCINATION'] } }
                ]
            },
            include: {
                chats: {
                    orderBy: { timestamp: 'asc' }
                }
            }
        });

        if (targetSessions.length === 0) {
            console.log(`[Self-Learning] No target sessions found for owner ${ownerId}`);
            return [];
        }

        // Grouping logic (Simplified for demonstration)
        // A production-grade SaaS would embed and cluster all user queries here.
        // For our scope, we'll ask the LLM to summarize the missing knowledge across all failed chats.

        let conversationLogs = targetSessions.map(session => {
            const dialogue = session.chats
                .filter(c => c.role === 'user' || c.role === 'ai')
                .map(c => `${c.role.toUpperCase()}: ${c.message}`).join('\n');
            return `--- Session ${session.id} ---\n${dialogue}`;
        }).join('\n\n');

        // We use the LLM to act as an Analyst
        const prompt = `
You are an AI Training Analyst. 
Analyze the following failed customer service chat logs.
Your goal is to identify common questions or issues that the AI failed to resolve.
Extract up to 3 missing FAQs that would have solved these issues.

Provide the result ONLY as a valid JSON array of objects with this format:
[
  {
    "suggestedQuestion": "What the user actually wanted to know",
    "suggestedAnswer": "A professional draft answer to this question",
    "relatedSessionIds": ["Session ID 1", "Session ID 2"]
  }
]

Logs:
${conversationLogs}
`;

        try {
            const rawResponse = await AIService.generateSystemResponse(prompt, 'You are a JSON-only API.', [], {}, 'gemini-1.5-pro');
            const sanitizedString = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const suggestions = JSON.parse(sanitizedString);

            const createdSuggestions = [];
            for (const sugg of suggestions) {
                // Save it to database for Admin Approval
                const dbSuggestion = await prisma.knowledgeSuggestion.create({
                    data: {
                        ownerId,
                        suggestedQuestion: sugg.suggestedQuestion,
                        suggestedAnswer: sugg.suggestedAnswer,
                        sourceSessionIds: sugg.relatedSessionIds || [],
                        frequency: (sugg.relatedSessionIds || []).length > 0 ? sugg.relatedSessionIds.length : 1,
                        status: 'PENDING'
                    }
                });
                createdSuggestions.push(dbSuggestion);
            }

            return createdSuggestions;

        } catch (error) {
            console.error('[Self-Learning] Failed to process chat logs:', error);
            return [];
        }
    }

    async getSuggestions(ownerId, status = 'PENDING') {
        return await prisma.knowledgeSuggestion.findMany({
            where: { ownerId, status },
            orderBy: { frequency: 'desc' }
        });
    }

    async approveSuggestion(suggestionId, ownerId, finalQuestion, finalAnswer, categoryId) {
        // Find suggestion to ensure it exists
        const suggestion = await prisma.knowledgeSuggestion.findUnique({
            where: { id: suggestionId, ownerId }
        });

        if (!suggestion) throw new Error("Suggestion not found");

        // Convert it to FAQ using KB Service
        const faqData = {
            question: finalQuestion,
            answer: finalAnswer,
            alternatives: [suggestion.suggestedQuestion],
            tags: ['auto-generated']
        };
        if (categoryId !== undefined) {
            faqData.categoryId = categoryId;
        }

        const newFaq = await this.kbService.createFaq(ownerId, faqData);

        // Mark suggestion as approved
        await prisma.knowledgeSuggestion.update({
            where: { id: suggestionId },
            data: { status: 'APPROVED' }
        });

        return newFaq;
    }

    async rejectSuggestion(suggestionId, ownerId) {
        return await prisma.knowledgeSuggestion.update({
            where: { id: suggestionId, ownerId },
            data: { status: 'REJECTED' }
        });
    }
}
