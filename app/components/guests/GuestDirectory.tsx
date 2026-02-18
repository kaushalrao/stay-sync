import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { GuestDirectoryProps } from '../../lib/types';
import { format, addMonths, subMonths } from 'date-fns';
import { triggerBookingNotification } from '../../lib/emailUtils';
import { guestService } from '../../services';
import { useApp } from '../providers/AppProvider';
import { GuestCard } from './GuestCard';
import { GuestFilters } from './GuestFilters';

import { useStore } from '@store/useStore';

export const GuestDirectory: React.FC<GuestDirectoryProps> = ({ onSelect, mode = 'page', className = '' }) => {
    const { user, properties } = useApp();
    const guests = useStore(state => state.guests);
    const isLoading = useStore(state => state.isGuestsLoading);
    const showToast = useStore(state => state.showToast);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'all'>('all');

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this guest?')) return;

        if (!user) return;

        // Find guest and property details for email notification
        const guest = guests.find(g => g.id === id);
        if (guest) {
            const property = properties.find(p => p.name === guest.propName);

            // Fire and forget email notification if property exists
            if (property) {
                triggerBookingNotification({
                    guest: { ...guest, checkInDate: guest.checkInDate, checkOutDate: guest.checkOutDate }, // Ensure dates are strings as expected
                    property,
                    type: 'cancelled',
                    totalAmount: guest.totalAmount,
                    dashboardLink: `${window.location.origin}/greeter`
                });
            }
        }

        try {
            await guestService.deleteGuest(user.uid, id);
            showToast('Guest deleted', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error deleting guest', 'error');
        }
    };

    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

    const handlePrevMonth = () => {
        const date = selectedMonth === 'all' ? new Date() : new Date(selectedMonth + '-01');
        setSelectedMonth(format(subMonths(date, 1), 'yyyy-MM'));
    };

    const handleNextMonth = () => {
        const date = selectedMonth === 'all' ? new Date() : new Date(selectedMonth + '-01');
        setSelectedMonth(format(addMonths(date, 1), 'yyyy-MM'));
    };

    const toggleAllMonths = () => {
        if (selectedMonth === 'all') {
            setSelectedMonth(format(new Date(), 'yyyy-MM'));
        } else {
            setSelectedMonth('all');
        }
    };


    const filteredGuests = guests.filter(g => {
        const matchesSearch = g.guestName.toLowerCase().includes(search.toLowerCase()) ||
            g.propName?.toLowerCase().includes(search.toLowerCase());

        let matchesStatus = true;
        const today = new Date().toISOString().split('T')[0];
        const isPastDate = !!(g.checkOutDate && g.checkOutDate < today);

        if (statusFilter === 'upcoming') {
            matchesStatus = (g.status === 'upcoming' || g.status === 'active') && !isPastDate;
        } else if (statusFilter === 'past') {
            matchesStatus = g.status === 'completed' || g.status === 'cancelled' || isPastDate;
        }

        const matchesMonth = selectedMonth === 'all' || (g.checkInDate && g.checkInDate.startsWith(selectedMonth));

        return matchesSearch && matchesStatus && matchesMonth;
    }).sort((a, b) => {
        // Sorting Logic
        const dateA = new Date(a.checkInDate).getTime();
        const dateB = new Date(b.checkInDate).getTime();

        if (statusFilter === 'upcoming') {
            return dateA - dateB; // Ascending for upcoming (soonest first)
        } else if (statusFilter === 'past') {
            return dateB - dateA; // Descending for past (most recent first)
        } else {
            // For 'all', prioritize upcoming soonest, then past most recent
            return dateA - dateB;
        }
    });

    return (
        <div className={`flex flex-col h-full ${mode === 'page' ? 'p-0' : 'p-4'} md:p-0 ${className}`}>
            {/* Header / Search */}
            <div className={mode === 'page' ? 'px-4 pt-4 md:p-0' : ''}>
                <GuestFilters
                    search={search}
                    setSearch={setSearch}
                    selectedMonth={selectedMonth}
                    handlePrevMonth={handlePrevMonth}
                    handleNextMonth={handleNextMonth}
                    toggleAllMonths={toggleAllMonths}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    mode={mode}
                />
            </div>

            {/* List */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar ${mode === 'page' ? 'px-4 py-2 md:p-2 flex flex-col space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-6 md:gap-y-10 pb-20 md:items-start' : 'p-2 space-y-3 pb-4'}`}>
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500 col-span-full">Loading guests...</div>
                ) : filteredGuests.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 col-span-full flex flex-col items-center gap-2">
                        <Users size={32} className="opacity-20" />
                        <p>{search ? 'No guests found matching search.' : 'No guests saved yet.'}</p>
                    </div>
                ) : (
                    filteredGuests.map(guest => (
                        <GuestCard
                            key={guest.id}
                            guest={guest}
                            mode={mode}
                            onSelect={onSelect}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
