"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { QUICK_ACTIONS } from '@/app/lib/constants';

export function QuickActionCards() {
    const router = useRouter();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.label}
                            onClick={() => router.push(action.href)}
                            className="group bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-700/50 hover:border-slate-600 hover:scale-105"
                        >
                            <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                <Icon className={action.color} size={24} />
                            </div>
                            <h4 className="font-semibold text-sm text-white mb-1">
                                {action.label}
                            </h4>
                            <p className="text-xs text-slate-400">
                                {action.subtitle}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
