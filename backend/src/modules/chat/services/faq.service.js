function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import { ChromaClient, } from 'chromadb';
import { GoogleGenAI } from '@google/genai';
import prisma from '../../../common/services/prisma.service.js';

// Simple lightweight RAG service
export class FaqService {
    __init() { this.client = null }
    __init2() { this.collection = null }

    __init3() { this.isConnected = false }

    constructor() {
        ; FaqService.prototype.__init.call(this); FaqService.prototype.__init2.call(this); FaqService.prototype.__init3.call(this);
        this.initChroma();
    }

    async getGenAI() {
        if (this.genAI) return this.genAI;
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
        const apiKey = process.env.GEMINI_API_KEY || systemConfig?.geminiApiKey || '';
        if (!apiKey) {
            console.warn('[FaqService] Gemini API key is missing in both ENV and Database');
        }
        this.genAI = new GoogleGenAI({ apiKey });
        return this.genAI;
    }

    async _getCurrencyHtml(ownerId) {
        try {
            const config = await prisma.ownerConfig.findUnique({
                where: { owner_id: ownerId },
                select: { currency: true }
            });
            const currency = config?.currency || 'IDR';
            const symbols = { 'IDR': 'Rp', 'MYR': 'MYR', 'USD': '$', 'SGD': 'S$' };
            const symbol = symbols[currency] || currency;
            return `**${symbol}** `;
        } catch (err) {
            return 'Rp ';
        }
    }

    async initChroma() {
        try {
            this.client = new ChromaClient({ host: "http://103.183.74.207" });

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
    async getEmbedding(text) {
        const genAI = await this.getGenAI();
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }

    async addFaqItem(id, ownerId, question, answer) {
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

    async search(query, ownerId, limit = 3, returnDetailed = false) {
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
            });

            if (exactFaq) {
                console.log('⚡ FAQ: Exact keyword match found!');
                let responseAnswer = exactFaq.answer;
                let finalMetadata = { ...exactFaq.metadata };

                if (exactFaq.productIds && exactFaq.productIds.length > 0) {
                    const products = await prisma.product.findMany({
                        where: { id: { in: exactFaq.productIds }, owner_id: ownerId }
                    });
                    const curHtml = await this._getCurrencyHtml(ownerId);
                    const productText = products.map((p) => `- ${p.name} (${curHtml}${p.price.toLocaleString()})`).join('\n');
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
                            const meta = metadataArray ? metadataArray[i] : {};
                            const doc = documentArray ? documentArray[i] : '';

                            if (returnDetailed) {
                                matches.push(`Q: ${doc}\nA: ${_optionalChain([meta, 'optionalAccess', _ => _.answer]) || 'No answer'}`);
                            } else if (dist < 0.2) {
                                console.log(`⚡ FAQ: Vector match found (dist: ${dist})`);
                                const faqId = (idArray && idArray[i]) ? idArray[i] : null;
                                let answer = (_optionalChain([meta, 'optionalAccess', _2 => _2.answer])) || null;
                                let finalMetadata = {};

                                if (faqId) {
                                    const fullFaq = await prisma.faqItem.findUnique({ where: { id: faqId } });
                                    if (fullFaq && fullFaq.productIds && fullFaq.productIds.length > 0) {
                                        const products = await prisma.product.findMany({
                                            where: { id: { in: fullFaq.productIds }, owner_id: ownerId }
                                        });
                                        const curHtml = await this._getCurrencyHtml(ownerId);
                                        const productText = products.map((p) => `- ${p.name} (${curHtml}${p.price.toLocaleString()})`).join('\n');
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
                });

                if (fuzzyFaqs.length > 0) {
                    if (returnDetailed) {
                        return fuzzyFaqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
                    }
                    console.log('⚡ FAQ: Fuzzy keyword match found!');
                    const topFaq = fuzzyFaqs[0];
                    let answer = topFaq.answer;
                    let finalMetadata = {};

                    if (topFaq.productIds && topFaq.productIds.length > 0) {
                        const products = await prisma.product.findMany({
                            where: { id: { in: topFaq.productIds }, owner_id: ownerId }
                        });
                        const curHtml = await this._getCurrencyHtml(ownerId);
                        const productText = products.map((p) => `- ${p.name} (${curHtml}${p.price.toLocaleString()})`).join('\n');
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
