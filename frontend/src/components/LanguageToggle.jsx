import React from 'react';
import { useUser } from '../context/useUser.js';
import { Languages } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const LanguageToggle = () => {
    const { user, updateLanguage } = useUser();
    const currentLang = user?.language || 'id';

    const toggle = () => {
        const nextLang = currentLang === 'id' ? 'en' : 'id';
        updateLanguage(nextLang);
    };

    return (
        <button
            onClick={toggle}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95",
                "bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30",
                "text-slate-600 font-medium text-xs"
            )}
        >
            <Languages className="w-3.5 h-3.5 text-indigo-500" />
            <span>{currentLang === 'id' ? 'ID (Bahasa)' : 'EN (English)'}</span>
        </button>
    );
};

export default LanguageToggle;
