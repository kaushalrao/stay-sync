import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { ActivityEmptyState } from './ActivityEmptyState';
import { ActivityItem } from './ActivityItem';
import { RecentActivityProps } from '@/app/lib/types';

export const RecentActivity: React.FC<RecentActivityProps> = ({ upcomingGuests, loading }) => {
    const router = useRouter();

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-xl md:shadow-2xl dark:shadow-xl h-[420px] animate-pulse flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800/50 rounded-lg"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/40 rounded-2xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }


    if (upcomingGuests.length === 0) {
        return <ActivityEmptyState />;
    }

    return (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-xl md:shadow-2xl dark:shadow-xl relative overflow-hidden h-[420px] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Clock size={20} className="text-orange-400" /> Upcoming Arrivals
                </h3>
                <button onClick={() => router.push('/guests')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors">
                    View All
                </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2 space-y-3">
                {upcomingGuests.map(guest => (
                    <ActivityItem
                        key={guest.id}
                        guest={guest}
                        onClick={() => router.push(`/greeter?guestId=${guest.id}`)}
                    />
                ))}
            </div>
        </div>
    );
};
