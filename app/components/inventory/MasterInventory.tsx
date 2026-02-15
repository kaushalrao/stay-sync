"use client";

import React from 'react';
import { Package } from 'lucide-react';
import { CONSUMABLE_ITEMS } from '@constants/cleaning';

export function MasterInventory() {
    // For V1, this is a read-only view of configured consumables.
    // In future, we can allow editing here.

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in pb-20 md:pb-0">
            {Object.entries(CONSUMABLE_ITEMS).map(([category, items]) => (
                <div key={category} className="bg-white dark:bg-slate-800/50 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                        <Package size={20} className="text-indigo-500" />
                        {category}
                    </h3>
                    <ul className="space-y-2.5 md:space-y-2">
                        {items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 md:gap-2 text-slate-600 dark:text-slate-300 text-sm md:text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                                <span className="leading-snug">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
