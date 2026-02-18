"use client";

import React, { useState } from 'react';
import { ShoppingCart, History, Package } from 'lucide-react';
import { useInventory } from '@hooks/inventory/useInventory';
import { ShoppingList, ShoppingListStickyButton } from './ShoppingList';
import { InventoryHistory } from './InventoryHistory';
import { MasterInventory } from './MasterInventory';
import { InventoryListSkeleton } from '@components/ui/Skeleton';

export function InventoryDashboard() {
    const [activeTab, setActiveTab] = useState<'shopping' | 'history' | 'master'>('shopping');
    const { needs, logs, isLoading, refresh, markRestocked, processingId } = useInventory();

    const tabs: Array<{
        id: 'shopping' | 'history' | 'master';
        label: string;
        icon: typeof ShoppingCart;
        count?: number;
        color: string;
        activeColor: string;
    }> = [
            { id: 'shopping', label: 'Shopping List', icon: ShoppingCart, count: needs.length > 0 ? needs.length : undefined, color: 'text-emerald-600 dark:text-emerald-400', activeColor: 'border-emerald-500' },
            { id: 'history', label: 'History', icon: History, color: 'text-purple-600 dark:text-purple-400', activeColor: 'border-purple-500' },
            { id: 'master', label: 'Master List', icon: Package, color: 'text-blue-600 dark:text-blue-400', activeColor: 'border-blue-500' },
        ];

    return (
        <div className="flex flex-col h-full animate-fade-in max-w-7xl mx-auto w-full px-4 md:px-0">
            <header className="flex flex-col md:flex-row md:items-center gap-5 mb-6 md:mb-10 pt-4 md:pt-2">
                <div className="flex items-center gap-4 md:gap-5">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-3.5 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-900 border border-emerald-100 dark:border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-900/5 dark:shadow-emerald-900/20 shrink-0">
                            <ShoppingCart size={28} className="md:w-8 md:h-8" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-emerald-100 dark:to-emerald-200">
                                Inventory Manager
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg font-medium">Track stock & manage consumables</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-20 -mx-4 px-4 md:mx-0 md:px-0 border-b border-slate-200 dark:border-white/5 mb-6 md:mb-8 transition-colors duration-300">
                <div className="grid grid-cols-3 w-full pb-0 pt-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-xs sm:text-sm md:text-base font-bold transition-all border-b-[3px] flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap px-1 select-none w-full ${activeTab === tab.id
                                ? `${tab.activeColor} ${tab.color}`
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            aria-selected={activeTab === tab.id}
                            role="tab"
                        >
                            <tab.icon size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-extrabold min-w-[1.25rem] text-center shadow-sm ${activeTab === tab.id
                                    ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24 md:pb-12 no-scrollbar px-4 md:px-0">
                {isLoading ? (
                    <div className="py-4 md:py-8">
                        <InventoryListSkeleton />
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {activeTab === 'shopping' && (
                            <ShoppingList
                                needs={needs}
                                markRestocked={markRestocked}
                                processingId={processingId}
                            />
                        )}
                        {activeTab === 'history' && (
                            <InventoryHistory logs={logs} />
                        )}
                        {activeTab === 'master' && (
                            <MasterInventory />
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Sticky Action Button for Shopping List */}
            {activeTab === 'shopping' && needs.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4 sm:hidden z-30">
                    <ShoppingListStickyButton needs={needs} />
                </div>
            )}
        </div>
    );
}
