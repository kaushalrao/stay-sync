import React, { useState, useCallback } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { Users } from 'lucide-react';
import { GuestDirectoryProps } from '../../lib/types';
import { format, addMonths, subMonths } from 'date-fns';
import { triggerBookingNotification } from '../../lib/emailUtils';
import { getDisplayStatus } from '../../lib/utils';
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
    const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'all' | 'deleted' | 'pending'>('all');

    React.useEffect(() => {
        if (!user) return;

        const fetchGuests = async () => {
            setIsGuestsLoading(true);
            try {
                // If search is active, we fetch by name. If empty, default fetch (by date).
                const { guests: newGuests, lastDoc } = await guestService.getGuests(null, 20, debouncedSearch);
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
        guestService.getGuests(guestLastDoc, 20, debouncedSearch)
            .then(({ guests: newGuests, lastDoc }) => {
                if (newGuests.length > 0) {
                    appendGuests(newGuests, lastDoc);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoadingMore(false));
    }, [user, isLoadingMore, guestLastDoc, debouncedSearch, appendGuests]);

    const [guestToDelete, setGuestToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setGuestToDelete(id);
    };

    const confirmDelete = async () => {
        if (!guestToDelete || !user) return;
        setIsDeleting(true);

        // Find guest and property details for email notification
        const guest = guests.find(g => g.id === guestToDelete);
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
            await guestService.updateGuest(guestToDelete, { status: 'deleted' });
            showToast('Guest marked as deleted.', 'success');
            const { guests: newGuests, lastDoc } = await guestService.getGuests(null, 20, debouncedSearch);
            setGuests(newGuests, lastDoc);
        } catch (error) {
            console.error(error);
            showToast('Error deleting guest', 'error');
        } finally {
            setIsDeleting(false);
            setGuestToDelete(null);
        }
    };

    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

    // ... (rest of the internal logic remains same)
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
        const displayStatus = getDisplayStatus(g);

        if (statusFilter === 'upcoming') {
            matchesStatus = displayStatus === 'UPCOMING';
        } else if (statusFilter === 'pending') {
            matchesStatus = g.status === 'pending';
        } else if (statusFilter === 'past') {
            matchesStatus = displayStatus === 'PAST';
        } else if (statusFilter === 'deleted') {
            matchesStatus = displayStatus === 'DELETED';
        } else {
            // 'all' filter: exclude deleted BY DEFAULT, maybe exclude pending here? Let's leave pending visible in 'all'.
            matchesStatus = displayStatus !== 'DELETED';
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
                    setSelectedMonth={setSelectedMonth}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    mode={mode}
                />
            </div>

            {/* List */}
            <div className={`flex-1 ${mode === 'page' ? 'pb-0' : 'pb-4 md:pb-0'}`} style={{ minHeight: 0 }}>
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
                        className="flex-1" // Added flex-1 to ensure VirtuosoGrid takes available space within its flex parent
                        data={filteredGuests}
                        endReached={loadMore}
                        itemContent={(index, guest) => (
                            <div className="mb-4 md:mb-0 md:p-2 h-full flex flex-col">
                                <GuestCard
                                    key={guest.id}
                                    guest={guest}
                                    mode={mode}
                                    onSelect={onSelect}
                                    onDelete={handleDeleteClick}
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

            {/* Delete Confirmation Modal */}
            {guestToDelete && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => !isDeleting && setGuestToDelete(null)}
                >
                    <div
                        className="relative bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 pt-8">
                            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4">
                                <i className="lucide-trash-2" style={{ width: 24, height: 24 }} dangerouslySetInnerHTML={{ __html: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>' }} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Delete Guest
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{guests.find(g => g.id === guestToDelete)?.guestName}</strong>?{guests.find(g => g.id === guestToDelete)?.status !== 'pending' && " This will free up their blocked dates on the calendar."}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setGuestToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </span>
                                    ) : (
                                        'Yes, Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
