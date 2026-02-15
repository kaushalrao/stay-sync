"use client";

import React from 'react';
import { History, Calendar, MapPin, Package } from 'lucide-react';
import { useApp } from '@components/providers/AppProvider';
import { InventoryLog } from '@lib/types';

interface InventoryHistoryProps {
    logs: InventoryLog[];
}

export function InventoryHistory({ logs }: InventoryHistoryProps) {
    const { properties } = useApp();

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <History size={40} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No History Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    Items that are restocked will appear here for your records.
                </p>
            </div>
        );
    }

    // Group logs by Date (Today, Yesterday, Older)
    const groupedLogs = logs.reduce((acc, log) => {
        const date = new Date(log.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {} as Record<string, InventoryLog[]>);

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                <div key={date} className="relative">
                    <div className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 py-2 mb-3 md:mb-4 border-b border-slate-100 dark:border-white/5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <Calendar size={12} />
                            {date}
                        </h4>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                        {dayLogs.map((log) => {
                            const propertyName = properties.find(p => p.id === log.propertyId)?.name || 'Unknown';
                            return (
                                <div key={log.id} className="relative group">
                                    <div className="absolute -left-[21px] top-6 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 group-hover:bg-emerald-400 transition-colors" />

                                    <div className="bg-white dark:bg-slate-800/40 p-3 md:p-4 rounded-xl border border-slate-200 dark:border-white/5 flex items-start md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm transition-all">
                                        <div className="flex items-start gap-3 md:gap-4 w-full">
                                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
                                                <Package size={16} className="md:w-[18px] md:h-[18px]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base truncate">
                                                        {log.item}
                                                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] md:text-xs font-bold shrink-0">
                                                            +{log.quantity}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>

                                                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span className="flex items-center gap-1 truncate max-w-[100px] md:max-w-none">
                                                        <MapPin size={10} /> {propertyName}
                                                    </span>
                                                    <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-slate-300" />
                                                    <span className="font-medium">{log.room}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
