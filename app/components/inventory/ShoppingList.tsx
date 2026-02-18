"use client";

import React from 'react';
import { Check, MessageCircle, ShoppingBag, MapPin } from 'lucide-react';
import { InventoryNeed } from '@lib/types';
import { openWhatsApp } from '@lib/utils';
import { Button } from '@components/ui/Button';
import { useStore } from '@store/useStore';

interface ShoppingListProps {
    needs: InventoryNeed[];
    markRestocked: (need: InventoryNeed) => void;
    processingId: string | null;
}

const sendInventoryToHost = (needs: InventoryNeed[], properties: any[]) => {
    if (needs.length === 0) return;

    // Group needs by property
    const needsByProperty = needs.reduce((acc, need) => {
        if (!acc[need.propertyId]) acc[need.propertyId] = [];
        acc[need.propertyId].push(need);
        return acc;
    }, {} as Record<string, InventoryNeed[]>);

    let globalMessage = `*🛒 Inventory Request*\n📅 ${new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}\n\n`;

    Object.entries(needsByProperty).forEach(([propId, propNeeds]) => {
        const propName = properties.find(p => p.id === propId)?.name || 'Unknown Property';
        globalMessage += `*🏡 ${propName}*\n`;

        const needsByRoom = propNeeds.reduce((acc, need) => {
            const roomKey = need.room || 'General';
            if (!acc[roomKey]) acc[roomKey] = [];
            acc[roomKey].push(need);
            return acc;
        }, {} as Record<string, InventoryNeed[]>);

        Object.entries(needsByRoom).forEach(([room, roomNeeds]) => {
            globalMessage += `\n*${room}*\n`;
            roomNeeds.forEach(need => {
                globalMessage += `▫️ *${need.quantity}x* ${need.item}\n`;
            });
        });

        globalMessage += `\n-------------------\n\n`;
    });

    // Validated Contact Logic
    let contact: string | undefined = undefined;
    for (const need of needs) {
        const prop = properties.find(p => p.id === need.propertyId);
        if (prop?.contactPrimary) {
            contact = prop.contactPrimary;
            break;
        }
    }

    openWhatsApp(globalMessage, contact);
};

export function ShoppingList({ needs, markRestocked, processingId }: ShoppingListProps) {
    const properties = useStore(state => state.properties);

    const handleSendToHost = () => {
        sendInventoryToHost(needs, properties);
    };

    if (needs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All Stocked Up!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    Great job! There are no pending low-stock items reported at the moment.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
            {/* Desktop Action Header / Mobile Top Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Action Required</h3>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                            {needs.length} {needs.length === 1 ? 'item' : 'items'} need restocking.
                        </p>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <Button
                        onClick={handleSendToHost}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    >
                        <MessageCircle size={18} /> Send List to Host
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 md:gap-4">
                {needs.map((need) => {
                    const propertyName = properties.find(p => p.id === need.propertyId)?.name || 'Unknown';
                    const isProcessing = processingId === need.id;

                    return (
                        <div
                            key={need.id}
                            className="group bg-white dark:bg-slate-800/60 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-[0.99] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-5 relative overflow-hidden"
                            onClick={() => {
                                // Optional: Make whole card clickable on mobile for better UX? 
                                // For now, keep explicitly distinct actions to avoid accidental triggers
                            }}
                        >
                            <div className="flex items-start gap-4 z-10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-lg border border-amber-100 dark:border-amber-500/10 shrink-0 shadow-inner">
                                    {need.quantity}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-base md:text-lg text-slate-900 dark:text-white mb-1 truncate">{need.item}</h4>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md max-w-full">
                                            <MapPin size={10} className="shrink-0" />
                                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{propertyName}</span>
                                            <span className="text-slate-400">/</span>
                                            <span className="truncate max-w-[80px]">{need.room}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="z-10 mt-2 md:mt-0">
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markRestocked(need);
                                    }}
                                    disabled={isProcessing}
                                    variant="secondary"
                                    className={`w-full md:w-auto h-12 md:h-10 gap-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all ${isProcessing ? 'opacity-70' : ''}`}
                                >
                                    {isProcessing ? (
                                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Check size={18} />
                                    )}
                                    Mark Restocked
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

// Export StickyButton for use in parent
export function ShoppingListStickyButton({ needs }: { needs: InventoryNeed[] }) {
    const properties = useStore(state => state.properties);

    const handleSendToHost = () => {
        sendInventoryToHost(needs, properties);
    };

    return (
        <Button
            onClick={handleSendToHost}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/30 h-14 rounded-2xl text-base font-bold"
        >
            <MessageCircle size={20} /> Send List to Host ({needs.length})
        </Button>
    );
}
