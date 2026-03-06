import prisma from '../../../common/services/prisma.service.js';
import { FaqService } from '../../chat/services/faq.service.js';

export class KnowledgeBaseService {
    

    constructor() {
        this.faqService = new FaqService();
    }

    async getCategories(ownerId) {
        return await prisma.knowledgeCategory.findMany({
            where: { ownerId },
            include: {
                _count: {
                    select: { faqs: true }
                }
            }
        });
    }

    async createCategory(ownerId, name, description) {
        const data = { ownerId, name };
        if (description !== undefined) data.description = description;

        return await prisma.knowledgeCategory.create({
            data
        });
    }

    async getFaqs(ownerId, categoryId, search) {
        const where = { ownerId };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { question: { contains: search, mode: 'insensitive' } },
                { answer: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } }
            ];
        }

        return await prisma.faqItem.findMany({
            where,
            include: { category: true },
            orderBy: { priority: 'desc' }
        });
    }

    async createFaq(ownerId, data







) {
        const dataForDb = {
            ownerId,
            question: data.question,
            answer: data.answer,
            isSynced: false
        };
        if (data.alternatives !== undefined) dataForDb.alternatives = data.alternatives;
        if (data.priority !== undefined) dataForDb.priority = data.priority;
        if (data.tags !== undefined) dataForDb.tags = data.tags;
        if (data.categoryId) {
            dataForDb.categoryId = data.categoryId;
        } else {
            dataForDb.categoryId = null;
        }
        if (data.productIds !== undefined) dataForDb.productIds = data.productIds;

        const faq = await prisma.faqItem.create({
            data: dataForDb
        });

        // Trigger background sync to Vector DB
        this.syncFaqToVectorHub(faq.id).catch(console.error);
        return faq;
    }

    async updateFaq(id, ownerId, data) {
        const updateData = { ...data };
        if (updateData.categoryId === "") updateData.categoryId = null;

        const faq = await prisma.faqItem.update({
            where: { id, ownerId }, // Ensure owner owns this FAQ
            data: {
                ...updateData,
                isSynced: false // Mark dirty
            }
        });

        // Trigger background re-sync
        this.syncFaqToVectorHub(faq.id).catch(console.error);
        return faq;
    }

    async deleteFaq(id, ownerId) {
        // Find first to get the vector ID
        const faq = await prisma.faqItem.findUnique({ where: { id, ownerId } });
        if (!faq) throw new Error("FAQ not found");

        await prisma.faqItem.delete({ where: { id } });

        // Optional: Remove from ChromaDB if you expose a delete method in FaqService
        // await this.faqService.deleteFaqItem(faq.vectorId);
        return true;
    }

    /**
     * Called automatically after create/update to embed the question and push to ChromaDB.
     */
     async syncFaqToVectorHub(faqId) {
        const faq = await prisma.faqItem.findUnique({ where: { id: faqId } });
        if (!faq) return;

        try {
            // Include alternatives in the embedded string so it matches more surface area
            const searchString = `${faq.question} ${faq.alternatives.join(" ")}`;

            // We use the existing faqService but with owner isolation logic we might need to add later.
            // For now, let's sync it globally or relying on ChromaDB metadata filtering.
            await this.faqService.addFaqItem(faq.id, faq.ownerId, searchString, faq.answer);

            await prisma.faqItem.update({
                where: { id: faqId },
                data: { isSynced: true, vectorId: faq.id }
            });
            console.log(`[KnowledgeBase] FAQ ${faqId} synced to Vector DB`);
        } catch (error) {
            console.error(`[KnowledgeBase] Failed to sync FAQ ${faqId} to Vector DB:`, error);
        }
    }
}
