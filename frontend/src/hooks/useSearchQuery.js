import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook to manage search queries with debouncing and URL state synchronization.
 * 
 * @param {string} paramName - The URL parameter name to use (default: 'search')
 * @param {number} delay - The debounce delay in milliseconds (default: 300)
 * @returns {Object} { query, debouncedQuery, setQuery }
 */
export const useSearchQuery = (paramName = 'search', delay = 300) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get(paramName) || '';

    // Immediate state for UI responsiveness (typing in input)
    const [query, setQuery] = useState(initialQuery);

    // Debounced state for filtering and API calls (load balancing/reducing queries)
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

    // Sync input changes to debounced value
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);

            // Sync with URL
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                if (query) {
                    newParams.set(paramName, query);
                } else {
                    newParams.delete(paramName);
                }
                return newParams;
            }, { replace: true }); // Use replace to avoid filling up browser history with every keystroke

        }, delay);

        return () => clearTimeout(timer);
    }, [query, paramName, delay, setSearchParams]);

    // Handle initial mount or external URL changes (e.g. forward/back buttons)
    useEffect(() => {
        const urlQuery = searchParams.get(paramName) || '';
        if (urlQuery !== debouncedQuery) {
            setQuery(urlQuery);
            setDebouncedQuery(urlQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get(paramName)]);

    return { query, debouncedQuery, setQuery };
};
