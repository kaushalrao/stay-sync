"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { QUICK_ACTIONS } from '@/app/lib/constants';

export function QuickActionCards() {
    const router = useRouter();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.label}
                            onClick={() => router.push(action.href)}
                            className="group relative bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-105 overflow-hidden"
                        >
                            {/* Gradient glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 dark:group-hover:from-indigo-500/10 dark:group-hover:via-purple-500/10 dark:group-hover:to-pink-500/10 transition-all duration-500 rounded-2xl" />

                            {/* Content */}
                            <div className="relative z-10">
                                <div className={`w-14 h-14 ${action.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg`}>
                                    <Icon className={`${action.color} transition-transform duration-300 group-hover:rotate-12`} size={26} />
                                </div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {action.label}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {action.subtitle}
                                </p>
                            </div>

                            {/* Subtle shine effect */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
