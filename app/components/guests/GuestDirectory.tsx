import React, { useState, useCallback } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { Users } from 'lucide-react';
import { GuestDirectoryProps } from '../../lib/types';
import { format, addMonths, subMonths } from 'date-fns';
import { triggerBookingNotification } from '../../lib/emailUtils';
import { guestService } from '../../services';
import { useApp } from '../providers/AppProvider';
import { GuestCard } from './GuestCard';
import { GuestFilters } from './GuestFilters';
import { VirtuosoGrid } from 'react-virtuoso';
import { useGuestStore, usePropertyStore, useUIStore } from '@store/index';

const GuestItemContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => (
    <div {...props} ref={ref} className="w-full">
        {children}
    </div>
));
GuestItemContainer.displayName = 'GuestItemContainer';

export const GuestDirectory: React.FC<GuestDirectoryProps> = ({ onSelect, mode = 'page', className = '' }) => {
    const { user } = useApp();
    const properties = usePropertyStore(state => state.properties);
    const guests = useGuestStore(state => state.guests);
    const guestLastDoc = useGuestStore(state => state.guestLastDoc);
    const setGuests = useGuestStore(state => state.setGuests);
    const appendGuests = useGuestStore(state => state.appendGuests);
    const setIsGuestsLoading = useGuestStore(state => state.setIsGuestsLoading);

    // Convert old single loading state to granular if needed, or just use it for initial load
    const isLoading = useGuestStore(state => state.isGuestsLoading);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const showToast = useUIStore(state => state.showToast);

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'all'>('all');

    React.useEffect(() => {
        if (!user) return;

        const fetchGuests = async () => {
            setIsGuestsLoading(true);
            try {
                // If search is active, we fetch by name. If empty, default fetch (by date).
                const { guests: newGuests, lastDoc } = await guestService.getGuests(user.uid, null, 20, debouncedSearch);
                setGuests(newGuests, lastDoc);
            } catch (error) {
                console.error("Error fetching guests:", error);
                showToast("Failed to fetch guests", "error");
            } finally {
                setIsGuestsLoading(false);
            }
        };

        fetchGuests();
    }, [debouncedSearch, user, setGuests, setIsGuestsLoading, showToast]);

    const loadMore = useCallback(() => {
        if (!user || isLoadingMore || !guestLastDoc) return;

        setIsLoadingMore(true);
        guestService.getGuests(user.uid, guestLastDoc, 20, debouncedSearch)
            .then(({ guests: newGuests, lastDoc }) => {
                if (newGuests.length > 0) {
                    appendGuests(newGuests, lastDoc);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoadingMore(false));
    }, [user, isLoadingMore, guestLastDoc, debouncedSearch, statusFilter, appendGuests]);

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
            showToast('Guest deleted. Refresh to see changes.', 'success');
            // Refresh list after delete? Or just local remove?
            // Local remove would be better but simple reload works to stay in sync.
            // For now, simple reload of current query.
            const { guests: newGuests, lastDoc } = await guestService.getGuests(user.uid, null, 20, debouncedSearch);
            setGuests(newGuests, lastDoc);
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
        const matchesSearch = true; // Handled by server (Mostly. Prop name search is lost).

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

    // Memoize List component to handle 'mode' dependency and set display name
    const GuestListContainer = React.useMemo(() => {
        const Comp = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, children, ...props }, ref) => (
            <div
                ref={ref}
                style={style}
                {...props}
                className={`${mode === 'page' ? 'px-4 py-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-6 md:gap-y-4' : 'p-2 space-y-3'}`}
            >
                {children}
            </div>
        ));
        Comp.displayName = 'GuestListContainer';
        return Comp;
    }, [mode]);

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
            <div className={`flex-1 ${mode === 'page' ? 'pb-20' : 'pb-4'}`} style={{ minHeight: 0 }}>
                {isLoading && guests.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">Loading guests...</div>
                ) : filteredGuests.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2">
                        <Users size={32} className="opacity-20" />
                        <p>{search ? 'No guests found matching search.' : 'No guests saved yet.'}</p>
                    </div>
                ) : (
                    <VirtuosoGrid
                        style={{ height: '100%' }}
                        data={filteredGuests}
                        endReached={loadMore}
                        itemContent={(index, guest) => (
                            <div className="mb-4 md:mb-0 md:p-2">
                                <GuestCard
                                    key={guest.id}
                                    guest={guest}
                                    mode={mode}
                                    onSelect={onSelect}
                                    onDelete={handleDelete}
                                />
                            </div>
                        )}
                        components={{
                            List: GuestListContainer,
                            Item: GuestItemContainer
                        }}
                    />
                )}
                {isLoadingMore && <div className="text-center py-2 text-xs text-slate-400">Loading more...</div>}
            </div>
        </div>
    );
};
