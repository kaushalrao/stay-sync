import React from 'react';
import { DashboardHeaderProps } from '@/app/lib/types';
import { DashboardFilters } from './DashboardFilters';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    properties,
    selectedProperty,
    onPropertyChange,
    selectedYear,
    onYearChange,
    userName
}) => {
    // Generate last 5 years
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
                    {getGreeting()}, {userName?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-slate-400 text-sm">Here&apos;s what&apos;s happening today.</p>
            </div>

            <DashboardFilters
                properties={properties}
                selectedProperty={selectedProperty}
                onPropertyChange={onPropertyChange}
                selectedYear={selectedYear}
                onYearChange={onYearChange}
            />
        </div>
    );
};
