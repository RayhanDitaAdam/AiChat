import { ChromaClient } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Simple lightweight RAG service
export class FaqService {
    client = null;
    collection = null;
    genAI;
    isConnected = false;
    fallbackData = [];
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.initChroma();
    }
    async initChroma() {
        try {
            this.client = new ChromaClient({ path: "http://localhost:8000" });
            // Ping to check connection
            await this.client.heartbeat();
            this.collection = await this.client.getOrCreateCollection({
                name: "company_faq"
            });
            this.isConnected = true;
            console.log('ChromaDB connected for FAQ Vector Search.');
        }
        catch (error) {
            console.warn('ChromaDB not available. Using basic in-memory matching for FAQ.');
            this.isConnected = false;
            this.fallbackData = [
                { q: 'jam operasional', a: 'Jam operasional kami adalah 08:00 sampai 20:00 WIB setiap hari.' },
                { q: 'lokasi', a: 'Lokasi kami dapat dilihat pada map di halaman utama toko kami.' },
                { q: 'cara refund', a: 'Refund dapat dilakukan melalui menu pesanan maksimal 24 jam setelah barang diterima.' },
                { q: 'status pesanan', a: 'Status pesanan dapat dilacak langsung dari halaman "Pesanan Saya".' }
            ];
        }
    }
    // Get embedding from Gemini
    async getEmbedding(text) {
        const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }
    async addFaqItem(id, question, answer) {
        if (this.isConnected && this.collection) {
            const embedding = await this.getEmbedding(question);
            await this.collection.add({
                ids: [id],
                embeddings: [embedding],
                metadatas: [{ answer }],
                documents: [question]
            });
        }
        else {
            this.fallbackData.push({ q: question, a: answer });
        }
    }
    async search(query, limit = 3) {
        if (this.isConnected && this.collection) {
            try {
                const embedding = await this.getEmbedding(query);
                const results = await this.collection.query({
                    queryEmbeddings: [embedding],
                    nResults: limit,
                });
                const distances = results.distances;
                if (distances && distances[0] && distances[0][0] !== undefined && distances[0][0] < 0.5) {
                    // Good match found
                    const metadata = results.metadatas;
                    if (metadata && metadata[0] && metadata[0][0]) {
                        return metadata[0][0].answer;
                    }
                }
                return null; // No confident match
            }
            catch (e) {
                console.error('Vector search error', e);
                return null;
            }
        }
        // Fallback: Extremely simple matching
        const lowerQuery = query.toLowerCase();
        const match = this.fallbackData.find(item => lowerQuery.includes(item.q) || item.q.includes(lowerQuery));
        return match ? match.a : null;
    }
}
//# sourceMappingURL=faq.service.js.map