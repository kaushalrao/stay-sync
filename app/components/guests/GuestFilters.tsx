import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ListFilter, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { GuestFiltersProps } from '../../lib/types';
import { GUEST_FILTER_OPTIONS } from '../../lib/constants';

// --- Sub-components for better readability ---

const MobileSearchAndButton = ({ search, setSearch, activeFilterCount, onOpenFilter }: any) => (
    <div className="flex md:hidden gap-3">
        <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
                type="text"
                placeholder="Search guests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium shadow-sm"
            />
        </div>

        <button
            onClick={onOpenFilter}
            className="relative flex items-center justify-center bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl w-12 h-[46px] shrink-0 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
            <ListFilter size={20} />
            {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-[#0f172a]">
                    {activeFilterCount}
                </span>
            )}
        </button>
    </div>
);

const DesktopFilterControls = ({ 
    search, setSearch, mode, selectedMonth, 
    handlePrevMonth, handleNextMonth, toggleAllMonths, 
    statusFilter, setStatusFilter 
}: any) => (
    <div className={`hidden md:flex flex-col ${mode === 'page' ? 'md:flex-row' : ''} gap-4`}>
        <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
                type="text"
                placeholder="Search guests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            />
        </div>

        <div className={`flex flex-col ${mode === 'page' ? 'md:flex-row' : ''} gap-3 shrink-0`}>
            {/* Month Filter Navigator */}
            <div className={`flex items-center justify-between gap-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl p-1 w-full ${mode === 'page' ? 'md:w-auto' : ''} min-w-[200px]`}>
                <button
                    onClick={handlePrevMonth}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={toggleAllMonths}
                    className="flex-1 text-center text-sm font-bold text-slate-900 dark:text-white py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors truncate px-2"
                >
                    {selectedMonth === 'all' ? 'All Months' : format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                </button>
                <button
                    onClick={handleNextMonth}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Status Filters */}
            <div className={`bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl p-1 grid grid-cols-2 lg:grid-cols-5 shrink-0 w-full md:w-auto min-w-[320px]`}>
                {GUEST_FILTER_OPTIONS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all w-full flex items-center justify-center ${
                            statusFilter === filter
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const MobileFilterBottomSheet = ({
    isOpen, onClose, hasChanges,
    localSelectedMonth, handleMobilePrevMonth, handleMobileNextMonth, toggleMobileAllMonths,
    localStatusFilter, setLocalStatusFilter,
    onClear, onApply
}: any) => {
    if (!isOpen) return null;

    return (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sheet Content */}
            <div className="relative bg-white dark:bg-slate-900 rounded-t-[32px] w-full max-h-[85vh] flex flex-col shadow-2xl animate-slide-up transform-gpu">

                {/* Handle */}
                <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Filters</h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Filters */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                    {/* Timeframe Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest">Timeframe</h4>
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-2">
                            <button
                                onClick={handleMobilePrevMonth}
                                className="p-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={toggleMobileAllMonths}
                                className="flex-1 text-center font-bold text-slate-900 dark:text-white py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-[15px]"
                            >
                                {localSelectedMonth === 'all' ? 'All Time' : format(new Date(localSelectedMonth + '-01'), 'MMMM yyyy')}
                            </button>
                            <button
                                onClick={handleMobileNextMonth}
                                className="p-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Status Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest">Booking Status</h4>
                        <div className="flex flex-col gap-2">
                            {GUEST_FILTER_OPTIONS.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setLocalStatusFilter(filter)}
                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${localStatusFilter === filter
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 font-medium'
                                        }`}
                                >
                                    <span className="capitalize text-[15px] tracking-wide">{filter}</span>
                                    {localStatusFilter === filter && (
                                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                            <Check size={12} className="text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sticky Bottom Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 safe-area-bottom">
                    <div className="flex gap-3">
                        <button
                            onClick={onClear}
                            className="px-6 py-4 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={onApply}
                            disabled={!hasChanges}
                            className={`flex-1 font-bold rounded-xl py-4 transition-all ${hasChanges
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            Show Results
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};


export const GuestFilters: React.FC<GuestFiltersProps> = ({
    search,
    setSearch,
    selectedMonth,
    setSelectedMonth,
    statusFilter,
    setStatusFilter,
    mode
}) => {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Local state for mobile deferred filtering
    const [localSelectedMonth, setLocalSelectedMonth] = useState(selectedMonth);
    const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);

    // Sync local state when modal opens
    useEffect(() => {
        if (isMobileFilterOpen) {
            setLocalSelectedMonth(selectedMonth);
            setLocalStatusFilter(statusFilter);
        }
    }, [isMobileFilterOpen, selectedMonth, statusFilter]);

    // Check if local filters differ from applied global filters
    const hasChanges = localSelectedMonth !== selectedMonth || localStatusFilter !== statusFilter;

    // Calculate active filter count for the badge (default state is 'all' status and current month)
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (selectedMonth !== currentMonthStr ? 1 : 0);

    // ----- Desktop Handlers -----
    const handlePrevMonth = () => {
        const date = selectedMonth === 'all' ? new Date() : new Date(selectedMonth + '-01');
        setSelectedMonth(format(new Date(date.getFullYear(), date.getMonth() - 1, 1), 'yyyy-MM'));
    };

    const handleNextMonth = () => {
        const date = selectedMonth === 'all' ? new Date() : new Date(selectedMonth + '-01');
        setSelectedMonth(format(new Date(date.getFullYear(), date.getMonth() + 1, 1), 'yyyy-MM'));
    };

    const toggleAllMonths = () => {
        setSelectedMonth(selectedMonth === 'all' ? format(new Date(), 'yyyy-MM') : 'all');
    };

    // ----- Mobile Local Handlers -----
    const handleMobilePrevMonth = () => {
        const date = localSelectedMonth === 'all' ? new Date() : new Date(localSelectedMonth + '-01');
        setLocalSelectedMonth(format(new Date(date.getFullYear(), date.getMonth() - 1, 1), 'yyyy-MM'));
    };

    const handleMobileNextMonth = () => {
        const date = localSelectedMonth === 'all' ? new Date() : new Date(localSelectedMonth + '-01');
        setLocalSelectedMonth(format(new Date(date.getFullYear(), date.getMonth() + 1, 1), 'yyyy-MM'));
    };

    const toggleMobileAllMonths = () => {
        setLocalSelectedMonth(localSelectedMonth === 'all' ? format(new Date(), 'yyyy-MM') : 'all');
    };

    const applyMobileFilters = () => {
        setStatusFilter(localStatusFilter);
        setSelectedMonth(localSelectedMonth);
        setIsMobileFilterOpen(false);
    };

    return (
        <div className={`shrink-0 space-y-4 ${mode === 'page' ? 'mb-8' : 'mb-4 px-1'}`}>
            <MobileSearchAndButton
                search={search}
                setSearch={setSearch}
                activeFilterCount={activeFilterCount}
                onOpenFilter={() => setIsMobileFilterOpen(true)}
            />

            <DesktopFilterControls
                search={search}
                setSearch={setSearch}
                mode={mode}
                selectedMonth={selectedMonth}
                handlePrevMonth={handlePrevMonth}
                handleNextMonth={handleNextMonth}
                toggleAllMonths={toggleAllMonths}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />

            <MobileFilterBottomSheet
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                hasChanges={hasChanges}
                localSelectedMonth={localSelectedMonth}
                handleMobilePrevMonth={handleMobilePrevMonth}
                handleMobileNextMonth={handleMobileNextMonth}
                toggleMobileAllMonths={toggleMobileAllMonths}
                localStatusFilter={localStatusFilter}
                setLocalStatusFilter={setLocalStatusFilter}
                onClear={() => {
                    setLocalStatusFilter('all');
                    setLocalSelectedMonth(format(new Date(), 'yyyy-MM'));
                }}
                onApply={applyMobileFilters}
            />
        </div>
    );
};
