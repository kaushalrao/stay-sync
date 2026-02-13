import React from 'react';

import { TabControlProps } from '@lib/types';

export const TabControl: React.FC<TabControlProps> = ({ options, activeId, onChange, className = '' }) => (
    <div className={`bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl inline-flex border border-slate-200 dark:border-white/10 relative shadow-xl w-full sm:w-auto ${className}`}>
        {options.map(opt => (
            <button
                key={opt.id}
                onClick={() => onChange(opt.id)}
                className={`relative z-10 flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeId === opt.id
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
            >
                {opt.icon} {opt.label}
            </button>
        ))}
        <div
            className="absolute top-1 bottom-1 rounded-xl bg-slate-900 dark:from-slate-700 dark:to-slate-800 shadow-lg transition-all duration-300 ease-out"
            style={{
                width: `calc(${100 / options.length}% - 0.5rem)`,
                left: `calc(${(options.findIndex(o => o.id === activeId) * (100 / options.length))}% + 0.25rem)`
            }}
        />
    </div>
);
