"use client";

import React, { useState } from 'react';
import { ShoppingCart, History, Package } from 'lucide-react';
import { useInventory } from '@hooks/useInventory';
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
            <header className="flex flex-col md:flex-row md:items-center gap-4 mb-6 md:mb-8 pt-2 md:pt-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
                        <ShoppingCart size={24} className="md:w-7 md:h-7" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventory Manager</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium line-clamp-1">Track stock & manage consumables</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-20 -mx-4 px-4 md:mx-0 md:px-0 border-b border-slate-200 dark:border-white/10 mb-6 md:mb-8">
                <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-1 pt-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-bold transition-all border-b-[3px] flex items-center gap-2 whitespace-nowrap px-1 ${activeTab === tab.id
                                ? `${tab.activeColor} ${tab.color}`
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            aria-selected={activeTab === tab.id}
                            role="tab"
                        >
                            <tab.icon size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-extrabold min-w-[1.25rem] text-center">
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
