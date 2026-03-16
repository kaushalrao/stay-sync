import React from 'react';
import { Filter, CalendarRange } from 'lucide-react';
import { DashboardFiltersProps } from '@/app/lib/types';
import { Dropdown } from '@components/ui/Dropdown';

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
    properties,
    selectedProperty,
    onPropertyChange,
    selectedYear,
    onYearChange
}) => {
    // Generate last 5 years
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const propertyOptions = [
        { id: 'all', label: 'All Properties', icon: <Filter size={14} /> },
        ...properties.map(p => ({ id: p.id, label: p.name, icon: <Filter size={14} /> }))
    ];

    const yearOptions = years.map(year => ({
        id: year.toString(),
        label: year.toString(),
        icon: <CalendarRange size={14} />
    }));

    return (
        <div className="relative z-20 flex flex-wrap gap-2 md:gap-3 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md w-full md:w-auto shadow-sm dark:shadow-none">
            {/* Property Filter */}
            <Dropdown
                variant="filter"
                options={propertyOptions}
                value={selectedProperty}
                onChange={onPropertyChange}
                className="flex-1 md:flex-none"
            />

            {/* Year Filter */}
            <Dropdown
                variant="filter"
                options={yearOptions}
                value={selectedYear.toString()}
                onChange={(val) => onYearChange(parseInt(val))}
                className="flex-1 md:flex-none"
            />
        </div>
    );
};
