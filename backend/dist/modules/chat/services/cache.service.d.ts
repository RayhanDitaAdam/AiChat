export declare class CacheService {
    private memoryCache;
    private redisClient;
    constructor();
    private connectRedis;
    private generateKey;
    get(prefix: string, keyText: string): Promise<any | null>;
    set(prefix: string, keyText: string, value: any, ttlSeconds?: number): Promise<void>;
}
//# sourceMappingURL=cache.service.d.ts.map