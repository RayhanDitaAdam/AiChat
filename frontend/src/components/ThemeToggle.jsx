import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ThemeToggle = () => {
    const handleThemeToggle = () => {
        document.dispatchEvent(new CustomEvent('basecoat:theme'));
    };

    return (
        <button
            type="button"
            aria-label="Toggle dark mode"
            data-tooltip="Toggle dark mode"
            data-side="bottom"
            onClick={handleThemeToggle}
            className={cn(
                "flex items-center justify-center size-8 rounded-full border border-slate-200 bg-white transition-all active:scale-95 shadow-sm",
                "hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-600",
                "hidden sm:flex" // Matching layouts' typical hidden/show patterns
            )}
        >
            <span className="hidden dark:block">
                <Sun className="w-4 h-4 text-amber-500" />
            </span>
            <span className="block dark:hidden">
                <Moon className="w-4 h-4 text-indigo-500" />
            </span>
        </button>
    );
};

export default ThemeToggle;
