"use client";

import React, { useState } from 'react';
import { TabControl } from '@components/ui/TabControl';
import { useApp } from '@components/providers/AppProvider';
import { useRouter } from 'next/navigation';
import { PropertiesTab } from '@components/settings/PropertiesTab';
import { TemplatesTab } from '@components/settings/TemplatesTab';

export default function SettingsPage() {
    const { user } = useApp();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'properties' | 'templates'>('properties');

    // Redirect if not logged in (handled by layout/provider ideally, but safe check here)
    React.useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="animate-fade-in space-y-8 w-full pb-20 pt-8 px-4 md:px-8 relative">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Manage your properties and preferences</p>
            </div>

            <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl w-[calc(100%+4rem)] -mx-8 px-8 py-3 border-y border-slate-200 dark:border-white/5 lg:static lg:!bg-transparent lg:backdrop-blur-none lg:border-none lg:w-auto lg:mx-0 lg:p-0 flex justify-start lg:justify-start transition-all">
                <TabControl
                    options={[
                        { id: 'properties', label: 'Properties' },
                        { id: 'templates', label: 'Templates' }
                    ]}
                    activeId={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            {activeTab === 'properties' && <PropertiesTab />}
            {activeTab === 'templates' && <TemplatesTab />}
        </div >
    );
}

