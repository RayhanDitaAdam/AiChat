/**
 * Middleware to limit the maximum value of generic pagination/query parameters like 'limit' or 'take'.
 * This prevents clients from requesting excessively large result sets that could overload the DB or memory.
 */
export const queryLimiter = (options = { maxLimit: 100, defaultLimit: 10 }) => {
    return (req, res, next) => {
        if (req.query) {
            // Check for common pagination fields
            const limitFields = ['limit', 'take', 'pageSize'];
            for (const field of limitFields) {
                if (req.query[field] !== undefined) {
                    const parsedLimit = parseInt(req.query[field], 10);
                    if (isNaN(parsedLimit) || parsedLimit <= 0) {
                        req.query[field] = String(options.defaultLimit);
                    }
                    else if (parsedLimit > options.maxLimit) {
                        req.query[field] = String(options.maxLimit);
                    }
                    // if valid, we leave it as is
                }
            }
        }
        next();
    };
};
//# sourceMappingURL=query-limiter.middleware.js.map