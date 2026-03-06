import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Search, X, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose, navItems = [] }) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Filter items based on query
    const results = navItems.filter(item =>
        !item.hidden &&
        !item.divider &&
        item.name &&
        item.name.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (!isOpen) return;

        // Reset state and focus when modal opens
        const timer = setTimeout(() => {
            setQuery('');
            setActiveIndex(0);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 10);

        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && results[activeIndex]) {
            e.preventDefault();
            navigate(results[activeIndex].path);
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [results, activeIndex, navigate, onClose]);

    // Scroll active item into view
    useEffect(() => {
        const activeElement = resultsRef.current?.children[activeIndex];
        if (activeElement) {
            activeElement.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
                    {/* Backdrop */}
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                    >
                        {/* Search Bar */}
                        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search menus, features, or pages..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                            <div className="ml-4 flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-[10px] font-medium text-gray-500 uppercase tracking-wider hidden sm:flex">
                                <kbd>ESC</kbd>
                            </div>
                        </div>

                        {/* Results */}
                        <div
                            ref={resultsRef}
                            className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar"
                        >
                            {results.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        Navigation & Pages
                                    </div>
                                    {results.map((item, index) => (
                                        <div
                                            key={item.path}
                                            onClick={() => { navigate(item.path); onClose(); }}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${index === activeIndex
                                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${index === activeIndex ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold truncate">{item.name}</div>
                                                <div className={`text-[11px] truncate ${index === activeIndex ? 'text-white/70' : 'text-gray-400'}`}>
                                                    {item.path}
                                                </div>
                                            </div>
                                            {index === activeIndex && (
                                                <CornerDownLeft className="w-4 h-4 opacity-70" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">No results found</h3>
                                    <p className="text-gray-400 text-sm max-w-[200px]">
                                        We couldn't find anything matching your search query.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm flex items-center">
                                        <CornerDownLeft className="w-2.5 h-2.5" />
                                    </kbd>
                                    select
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="flex gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm flex items-center">
                                            <ArrowUp className="w-2.5 h-2.5" />
                                        </kbd>
                                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm flex items-center">
                                            <ArrowDown className="w-2.5 h-2.5" />
                                        </kbd>
                                    </span>
                                    navigate
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm">ESC</kbd>
                                    close
                                </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5">
                                <span className="text-gray-300 dark:text-gray-600">Search by</span>
                                <div className="flex items-center font-bold tracking-tighter text-gray-800 dark:text-gray-200">
                                    <span className="text-brand-500">Ai</span>Chat
                                </div>
                            </div>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
