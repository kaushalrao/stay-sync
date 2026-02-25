import React from 'react';
import { Users } from 'lucide-react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { GuestsPageClient } from '@components/guests/GuestsPageClient';

export default function GuestsPage() {
    return (
        <ClientAuthGuard>
            <div className="animate-fade-in mx-auto w-full px-0 md:px-6 pt-4 md:pt-8 pb-0 md:pb-8 safe-area-top" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div className="px-4 md:px-0" style={{ flexShrink: 0 }}>
                    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="p-2 md:p-3 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/10">
                            <Users className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Guest Directory</h1>
                            <p className="text-xs md:text-base text-slate-600 dark:text-slate-400">View and manage all your past and upcoming guests.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl md:border border-t border-b border-slate-300 dark:border-white/5 md:rounded-3xl p-0 md:p-6 shadow-xl" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <GuestsPageClient />
                </div>
            </div>
        </ClientAuthGuard>
    );
}
