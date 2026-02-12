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
        <div className="animate-fade-in space-y-8 max-w-5xl mx-auto w-full pb-20 relative">
            <div className="sticky top-[72px] z-40 bg-[#0f172a]/95 backdrop-blur-xl w-[calc(100%+2rem)] -mx-4 px-4 py-3 border-b border-white/5 lg:static lg:bg-transparent lg:border-none lg:w-auto lg:mx-0 lg:p-0 flex justify-center transition-all mb-8 lg:mb-8 -mt-4 pt-4 lg:mt-0 lg:pt-0">
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

