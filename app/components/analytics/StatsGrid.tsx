import React from 'react';
import { IndianRupee, Home, TrendingUp, CalendarCheck } from 'lucide-react';
import { StatCard } from './StatCard';
import { StatsGridProps } from '@/app/lib/types';

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, loading }) => {
    const cards = [
        {
            label: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: IndianRupee,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            label: "Occupancy Rate",
            value: `${stats.occupancyRate}%`,
            icon: Home,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Total Bookings",
            value: stats.totalBookings,
            icon: CalendarCheck,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        {
            label: "Avg. Daily Rate",
            value: `₹${Math.round(stats.avgNightlyRate).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl md:shadow-2xl dark:shadow-xl h-32 md:h-40 animate-pulse flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                            <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-slate-800/50"></div>
                        </div>
                        <div>
                            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2"></div>
                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800/50 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {cards.map((card, idx) => (
                <StatCard key={idx} {...card} />
            ))}
        </div>
    );
};
