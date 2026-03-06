import crypto from 'crypto';
export class CacheService {
    // Simple in-memory cache for fallback when Redis is not available
    memoryCache = new Map();
    redisClient = null; // To be implemented when Redis is deployed
    constructor() {
        this.connectRedis();
    }
    async connectRedis() {
        try {
            // For now we will rely on falling back to the memory cache until Redis is fully configured
            // import { createClient } from 'redis';
            // this.redisClient = createClient({ url: process.env.REDIS_URL });
            // await this.redisClient.connect();
            // console.log('Redis connected successfully for Chat Cache');
        }
        catch (error) {
            console.warn('Failed to connect to Redis. Using in-memory cache fallback.');
        }
    }
    generateKey(prefix, text) {
        const hash = crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
        return `${prefix}:${hash}`;
    }
    async get(prefix, keyText) {
        const key = this.generateKey(prefix, keyText);
        if (this.redisClient && this.redisClient.isOpen) {
            try {
                const data = await this.redisClient.get(key);
                return data ? JSON.parse(data) : null;
            }
            catch (e) { /* ignore redis error and fall through to memory cache if needed */ }
        }
        // In-memory fallback
        const cached = this.memoryCache.get(key);
        if (!cached)
            return null;
        if (Date.now() > cached.expiry) {
            this.memoryCache.delete(key);
            return null;
        }
        return cached.value;
    }
    async set(prefix, keyText, value, ttlSeconds = 3600) {
        const key = this.generateKey(prefix, keyText);
        if (this.redisClient && this.redisClient.isOpen) {
            try {
                await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
                return;
            }
            catch (e) { /* fallback to memory cache */ }
        }
        // In-memory fallback
        this.memoryCache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    }
}
//# sourceMappingURL=cache.service.js.map