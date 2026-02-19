import React from 'react';
import { ChevronDown, ShoppingBag, AlertCircle } from 'lucide-react';
import { Property } from '@lib/types';
import { useInventoryStore } from '@store/index';

interface CleaningHeaderProps {
    properties: Property[];
    selectedPropertyId: string;
    onPropertyChange: (id: string) => void;
    onViewLogs: () => void;
}

export function CleaningHeader({ properties, selectedPropertyId, onPropertyChange, onViewLogs }: CleaningHeaderProps) {
    const pendingCount = useInventoryStore(state =>
        state.needs.filter(n => n.propertyId === selectedPropertyId && n.status === 'pending').length
    );

    return (
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-4 py-3 mb-6 transition-all duration-300">
            <div className="w-full px-4 md:px-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Cleaning Checklist
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Guest Readiness Dashboard</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={selectedPropertyId}
                            onChange={(e) => onPropertyChange(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-emerald-500/20 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>

                    <button
                        onClick={onViewLogs}
                        className={`relative hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${pendingCount > 0
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {pendingCount > 0 ? (
                            <>
                                <AlertCircle size={16} className="animate-pulse" />
                                <span>Restock Needed</span>
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] ml-1">
                                    {pendingCount}
                                </span>
                            </>
                        ) : (
                            <>
                                <ShoppingBag size={16} />
                                <span>Supplies</span>
                            </>
                        )}
                    </button>

                    {/* Mobile Button - simplified but consistent */}
                    <button
                        onClick={onViewLogs}
                        className={`md:hidden p-2 rounded-full transition-colors ${pendingCount > 0
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                    >
                        {pendingCount > 0 ? (
                            <div className="relative">
                                <AlertCircle size={18} />
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white dark:border-slate-900" />
                            </div>
                        ) : (
                            <ShoppingBag size={18} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
