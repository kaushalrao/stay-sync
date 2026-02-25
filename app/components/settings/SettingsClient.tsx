"use client";

import React, { useState } from 'react';
import { TabControl } from '@components/ui/TabControl';
import { PropertiesTab } from '@components/settings/PropertiesTab';
import { TemplatesTab } from '@components/settings/TemplatesTab';

export function SettingsClient() {
    const [activeTab, setActiveTab] = useState<'properties' | 'templates'>('properties');

    return (
        <>
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
        </>
    );
}
