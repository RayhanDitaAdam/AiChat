import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const maxVisible = 3;

    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <nav role="navigation" aria-label="pagination" className="mx-auto flex w-full justify-center mt-4 pb-4">
            <ul className="flex flex-row items-center gap-1">
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>
                </li>

                {start > 1 && (
                    <>
                        <li>
                            <button
                                onClick={() => onPageChange(1)}
                                className="w-8 h-8 flex items-center justify-center text-[10px] font-semibold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                1
                            </button>
                        </li>
                        {start > 2 && (
                            <li>
                                <div className="w-8 h-8 flex items-center justify-center text-slate-400">
                                    <MoreHorizontal size={14} />
                                </div>
                            </li>
                        )}
                    </>
                )}

                {pages.map(page => (
                    <li key={page}>
                        <button
                            onClick={() => onPageChange(page)}
                            className={`w-8 h-8 flex items-center justify-center text-[10px] font-semibold rounded-lg transition-all ${currentPage === page
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {page}
                        </button>
                    </li>
                ))}

                {end < totalPages && (
                    <>
                        {end < totalPages - 1 && (
                            <li>
                                <div className="w-8 h-8 flex items-center justify-center text-slate-400">
                                    <MoreHorizontal size={14} />
                                </div>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="w-8 h-8 flex items-center justify-center text-[10px] font-semibold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                {totalPages}
                            </button>
                        </li>
                    </>
                )}

                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
