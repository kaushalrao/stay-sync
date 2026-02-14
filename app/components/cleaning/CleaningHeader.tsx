import React from 'react';
import { Sparkles, Home, ChevronDown } from 'lucide-react';
import { Property } from '@lib/types';

interface CleaningHeaderProps {
    properties: Property[];
    selectedPropertyId: string;
    onPropertyChange: (id: string) => void;
}

export function CleaningHeader({ properties, selectedPropertyId, onPropertyChange }: CleaningHeaderProps) {
    return (
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 py-3 md:px-6 md:py-4 transition-all">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="text-amber-400 fill-amber-400 w-5 h-5 md:w-6 md:h-6" /> Cleaning Checklist
                    </h1>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">Guest Readiness Dashboard</p>
                </div>

                <div className="relative w-full md:w-auto">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Home size={14} />
                    </div>
                    <select
                        value={selectedPropertyId}
                        onChange={(e) => onPropertyChange(e.target.value)}
                        className="w-full md:w-64 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
