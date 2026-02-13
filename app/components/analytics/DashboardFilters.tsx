import React from 'react';
import { Filter, CalendarRange } from 'lucide-react';
import { DashboardFiltersProps } from '@/app/lib/types';

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
    properties,
    selectedProperty,
    onPropertyChange,
    selectedYear,
    onYearChange
}) => {
    // Generate last 5 years
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="flex gap-2 md:gap-3 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md w-full md:w-auto overflow-x-auto no-scrollbar shadow-sm dark:shadow-none">
            {/* Property Filter */}
            <div className="relative group flex-1 md:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={14} />
                <select
                    value={selectedProperty}
                    onChange={(e) => onPropertyChange(e.target.value)}
                    className="appearance-none bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-9 pr-8 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-white/5 w-full md:w-auto"
                >
                    <option value="all">All Properties</option>
                    {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Year Filter */}
            <div className="relative group flex-1 md:flex-none">
                <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" size={14} />
                <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(Number(e.target.value))}
                    className="appearance-none bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-9 pr-6 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-white/5 w-full md:w-auto"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
