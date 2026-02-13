import React from 'react';
import { Calendar } from 'lucide-react';

export const ActivityEmptyState: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl md:shadow-2xl dark:shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center h-[420px]">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-4 text-slate-400 dark:text-slate-500">
                <Calendar size={32} className="opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Upcoming Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">No check-ins scheduled for the near future.</p>
        </div>
    );
};
