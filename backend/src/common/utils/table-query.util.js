/**
 * Utility to parse TanStack Table query parameters (pagination, sorting, filtering)
 * into Prisma-compatible query objects.
 */
export class TableQuery {
    /**
     * Parse pagination parameters
     * @param {Object} query - Request query object (req.query)
     * @returns {Object} { skip: number, take: number }
     */
    static parsePagination(query) {
        const pageIndex = parseInt(query.pageIndex) || 0;
        const pageSize = parseInt(query.pageSize) || 10;
        
        return {
            skip: pageIndex * pageSize,
            take: pageSize
        };
    }

    /**
     * Parse sorting parameters
     * TanStack Table sends sorting as a JSON string: [{"id":"field","desc":true}]
     * @param {Object} query - Request query object
     * @returns {Object|undefined} Prisma orderBy object
     */
    static parseSorting(query) {
        if (!query.sorting) return undefined;

        try {
            const sorting = JSON.parse(query.sorting);
            if (!Array.isArray(sorting) || sorting.length === 0) return undefined;

            // Map TanStack sorting to Prisma orderBy
            // TanStack: { id: 'name', desc: true } -> Prisma: { name: 'desc' }
            return sorting.map(s => ({
                [s.id]: s.desc ? 'desc' : 'asc'
            }));
        } catch (error) {
            console.warn('Failed to parse sorting query:', query.sorting);
            return undefined;
        }
    }

    /**
     * Parse filtering parameters
     * TanStack Table sends filters as a JSON string: [{"id":"field","value":"search"}]
     * @param {Object} query - Request query object
     * @param {Object} schemaMapping - Optional mapping for specialized filters (e.g. numeric, boolean)
     * @returns {Object} Prisma where object
     */
    static parseFilters(query, schemaMapping = {}) {
        if (!query.filters) return {};

        try {
            const filters = JSON.parse(query.filters);
            if (!Array.isArray(filters) || filters.length === 0) return {};

            const where = {};

            filters.forEach(f => {
                const field = f.id;
                const value = f.value;

                if (value === undefined || value === null || value === '') return;

                const config = schemaMapping[field] || { type: 'string', mode: 'contains' };

                switch (config.type) {
                    case 'string':
                        where[field] = {
                            [config.mode || 'contains']: value,
                            mode: 'insensitive'
                        };
                        break;
                    case 'boolean':
                        where[field] = (value === 'true' || value === true);
                        break;
                    case 'number':
                        where[field] = parseFloat(value);
                        break;
                    case 'date':
                        // Handle date range if value is an object or simple date
                        if (typeof value === 'object' && (value.from || value.to)) {
                            where[field] = {
                                gte: value.from ? new Date(value.from) : undefined,
                                lte: value.to ? new Date(value.to) : undefined
                            };
                        } else {
                            where[field] = new Date(value);
                        }
                        break;
                    default:
                        where[field] = value;
                }
            });

            return where;
        } catch (error) {
            console.warn('Failed to parse filters query:', query.filters);
            return {};
        }
    }

    /**
     * Parse all table-related query parameters
     * @param {Object} query - Request query object
     * @param {Object} options - Configuration for filters
     * @returns {Object} Prisma ready objects
     */
    static parseAll(query, options = {}) {
        const { skip, take } = this.parsePagination(query);
        const orderBy = this.parseSorting(query);
        const where = this.parseFilters(query, options.schemaMapping);

        return { skip, take, orderBy, where };
    }
}
