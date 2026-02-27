"use client";

import React, { useState } from 'react';
import { TabControl } from '@components/ui/TabControl';
import { PropertiesTab } from '@components/settings/PropertiesTab';
import { TemplatesTab } from '@components/settings/TemplatesTab';

export function SettingsClient() {
    const [activeTab, setActiveTab] = useState<'properties' | 'templates'>('properties');

    return (
        <>
            <div className="mb-6 flex justify-start transition-all">
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
