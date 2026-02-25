import React from 'react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { SettingsClient } from '@components/settings/SettingsClient';

export default function SettingsPage() {
    return (
        <ClientAuthGuard>
            <div className="animate-fade-in space-y-8 w-full pb-20 pt-8 px-4 md:px-8 relative">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Manage your properties and preferences</p>
                </div>

                <SettingsClient />
            </div>
        </ClientAuthGuard>
    );
}
