import { ChromaClient, type Collection } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../../../common/services/prisma.service.js';

// Simple lightweight RAG service
export class FaqService {
    private client: ChromaClient | null = null;
    private collection: Collection | null = null;
    private genAI: GoogleGenerativeAI;
    private isConnected: boolean = false;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.initChroma();
    }

    private async initChroma() {
        try {
            this.client = new ChromaClient({ path: "http://localhost:8000" });

            // Ping to check connection
            await this.client.heartbeat();

            this.collection = await this.client.getOrCreateCollection({
                name: "company_faq"
            });

            this.isConnected = true;
            console.log('ChromaDB connected for FAQ Vector Search.');
        } catch (error) {
            console.warn('ChromaDB not available. Falling back to Prisma DB for FAQ matching.');
            this.isConnected = false;
        }
    }

    // Get embedding from Gemini
    private async getEmbedding(text: string): Promise<number[]> {
        const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }

    async addFaqItem(id: string, ownerId: string, question: string, answer: string) {
        if (this.isConnected && this.collection) {
            try {
                const embedding = await this.getEmbedding(question);
                await this.collection.add({
                    ids: [id],
                    embeddings: [embedding],
                    metadatas: [{ answer, ownerId }],
                    documents: [question]
                });
            } catch (err) {
                console.error('Failed to add FAQ to ChromaDB', err);
            }
        }
    }

    async search(query: string, ownerId: string, limit: number = 3, returnDetailed: boolean = false): Promise<any> {
        const lowerQuery = query.toLowerCase().trim();

        // 1. FAST PATH: PRISMA KEYWORD MATCH (STRICT)
        try {
            const exactFaq = await prisma.faqItem.findFirst({
                where: {
                    ownerId,
                    isActive: true,
                    OR: [
                        { question: { equals: query, mode: 'insensitive' } },
                        { alternatives: { has: query } }
                    ]
                }
            }) as any;

            if (exactFaq) {
                console.log('⚡ FAQ: Exact keyword match found!');
                let responseAnswer = exactFaq.answer;
                let finalMetadata = { ...exactFaq.metadata };

                if (exactFaq.productIds && exactFaq.productIds.length > 0) {
                    const products = await prisma.product.findMany({
                        where: { id: { in: exactFaq.productIds }, owner_id: ownerId }
                    });
                    const productText = products.map((p: any) => `- ${p.name} (Rp${p.price.toLocaleString()})`).join('\n');
                    responseAnswer = `${exactFaq.answer}\n\nProduk terkait:\n${productText}`;
                    finalMetadata.products = products;
                }

                return {
                    answer: responseAnswer,
                    metadata: finalMetadata,
                    matchType: 'exact'
                };
            }
        } catch (err) {
            console.error('FAQ exact match error', err);
        }

        // 2. VECTOR SEARCH (FUZZY)
        if (this.isConnected && this.collection) {
            try {
                const embedding = await this.getEmbedding(query);
                const results = await this.collection.query({
                    queryEmbeddings: [embedding],
                    nResults: limit,
                    where: { ownerId }
                });

                if (results.distances && results.distances[0]) {
                    const distanceArray = results.distances[0];
                    const metadataArray = results.metadatas ? results.metadatas[0] : [];
                    const documentArray = results.documents ? results.documents[0] : [];
                    const idArray = results.ids ? results.ids[0] : [];
                    const matches = [];

                    for (let i = 0; i < distanceArray.length; i++) {
                        const dist = distanceArray[i];
                        if (dist === null || dist === undefined) continue;

                        if (dist < 0.2 || (returnDetailed && dist < 0.5)) {
                            const meta: any = metadataArray ? metadataArray[i] : {};
                            const doc = documentArray ? documentArray[i] : '';

                            if (returnDetailed) {
                                matches.push(`Q: ${doc}\nA: ${meta?.answer || 'No answer'}`);
                            } else if (dist < 0.2) {
                                console.log(`⚡ FAQ: Vector match found (dist: ${dist})`);
                                const faqId = (idArray && idArray[i]) ? idArray[i] : null;
                                let answer = (meta?.answer as string) || null;
                                let finalMetadata: any = {};

                                if (faqId) {
                                    const fullFaq = await prisma.faqItem.findUnique({ where: { id: faqId } }) as any;
                                    if (fullFaq && fullFaq.productIds && fullFaq.productIds.length > 0) {
                                        const products = await prisma.product.findMany({
                                            where: { id: { in: fullFaq.productIds }, owner_id: ownerId }
                                        });
                                        const productText = products.map((p: any) => `- ${p.name} (Rp${p.price.toLocaleString()})`).join('\n');
                                        answer = `${answer}\n\nProduk terkait:\n${productText}`;
                                        finalMetadata.products = products;
                                    }
                                }

                                return {
                                    answer,
                                    metadata: finalMetadata,
                                    matchType: 'vector'
                                };
                            }
                        }
                    }
                    if (returnDetailed && matches.length > 0) return matches.join('\n\n');
                }
            } catch (e) {
                console.error('Vector search error', e);
            }
        }

        // 3. FALLBACK: FUZZY PRISMA KEYWORD SEARCH
        try {
            // Filter out common stopwords found in Indonesian colloquial/formal chat
            const STOPWORDS = ['ada', 'apa', 'ini', 'itu', 'saya', 'kamu', 'anda', 'kita', 'kami', 'disini', 'disana', 'yang', 'dengan', 'untuk', 'dari', 'bisa', 'boleh', 'tambah', 'kurang'];
            const keywords = lowerQuery.split(/\s+/).filter(k => k.length > 3 && !STOPWORDS.includes(k));

            if (keywords.length > 0) {
                const fuzzyFaqs = await prisma.faqItem.findMany({
                    where: {
                        ownerId: ownerId,
                        isActive: true,
                        OR: keywords.map(kw => ({
                            question: { contains: kw, mode: 'insensitive' }
                        }))
                    },
                    orderBy: { priority: 'desc' },
                    take: limit
                }) as any[];

                if (fuzzyFaqs.length > 0) {
                    if (returnDetailed) {
                        return fuzzyFaqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
                    }
                    console.log('⚡ FAQ: Fuzzy keyword match found!');
                    const topFaq = fuzzyFaqs[0];
                    let answer = topFaq.answer;
                    let finalMetadata: any = {};

                    if (topFaq.productIds && topFaq.productIds.length > 0) {
                        const products = await prisma.product.findMany({
                            where: { id: { in: topFaq.productIds }, owner_id: ownerId }
                        });
                        const productText = products.map((p: any) => `- ${p.name} (Rp${p.price.toLocaleString()})`).join('\n');
                        answer = `${topFaq.answer}\n\nProduk terkait:\n${productText}`;
                        finalMetadata.products = products;
                    }

                    return {
                        answer,
                        metadata: finalMetadata,
                        matchType: 'fuzzy'
                    };
                }
            }
        } catch (dbErr) {
            console.error('Database FAQ search error', dbErr);
        }

        return null;
    }
}
