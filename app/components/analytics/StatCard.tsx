import React from 'react';
import { StatCardProps } from '@/app/lib/types';

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, gradient, iconBg, iconColor }) => {
    return (
        <div className="group relative bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-200/80 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:scale-105 overflow-hidden">
            {/* Gradient background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient || 'from-slate-100 to-slate-200'} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`} />

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${iconBg || 'bg-slate-100'} dark:bg-slate-700/50 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                        <Icon className={`${iconColor || 'text-slate-500'} dark:text-slate-300 group-hover:rotate-12 transition-transform duration-300`} size={24} />
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{label}</p>
                <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">{value}</p>
            </div>

            {/* Subtle shine effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent dark:from-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
};
