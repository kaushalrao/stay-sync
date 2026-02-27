import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Users, Phone, Trash2, ArrowRight, Home, CheckCircle2, MoreVertical, Banknote, Moon, X, AlertTriangle, Edit3 } from 'lucide-react';
import { GuestCardProps } from '../../lib/types';
import { formatDate, formatCurrency, getPropertyColorKey, getStatusColor, getDisplayStatus, calculateNights } from '../../lib/utils';
import { COLOR_VARIANTS } from '../../lib/constants';
import { useGuestStore, useUIStore, useGuestFormStore } from '@store/index';
import { guestService } from '@services/index';
import { Portal } from '../ui/Portal';
import { useRouter } from 'next/navigation';

export const GuestCard: React.FC<GuestCardProps> = ({ guest, mode, onSelect, onDelete }) => {
    const propertyName = guest.propName || '';
    const colorKey = getPropertyColorKey(propertyName);
    const styles = COLOR_VARIANTS[colorKey];
    const displayStatus = getDisplayStatus(guest);
    const isPast = displayStatus === 'PAST';

    const router = useRouter();
    const loadGuestForEdit = useGuestFormStore(state => state.loadGuestForEdit);
    const updateGuestInStore = useGuestStore(state => state.updateGuestInStore);
    const showToast = useUIStore(state => state.showToast);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const balance = guest.totalAmount ? Math.max(0, guest.totalAmount - guest.advancePaid) : 0;
    const isUnpaid = balance > 0;

    // Calculate number of nights using the utility function
    const numberOfNights = calculateNights(guest.checkInDate, guest.checkOutDate);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleMarkPaidClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirmingPayment(true);
    };

    const confirmPayment = async () => {
        if (isMarkingPaid) return;

        setIsMarkingPaid(true);
        try {
            const updates = { advancePaid: guest.totalAmount };
            await guestService.updateGuest(guest.id, updates);
            updateGuestInStore(guest.id, updates);
            showToast('Payment marked as received!', 'success');
            setIsConfirmingPayment(false);
        } catch (error) {
            console.error(error);
            showToast('Failed to update payment status', 'error');
        } finally {
            setIsMarkingPaid(false);
        }
    };

    return (
        <div
            onClick={() => onSelect && onSelect(guest)}
            className={`
                group relative bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:bg-slate-800/60 dark:hover:border-white/10
                ${onSelect ? 'cursor-pointer hover:scale-[1.02] hover:z-10' : ''}
                ${mode === 'page' ? 'w-full h-full flex-1 shrink-0 flex flex-col justify-between min-h-[180px] z-0' : ''}
            `}
        >
            {/* Header with Avatar and Actions */}
            <div className="flex justify-between items-start mb-4 relative">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-lg border-2 border-indigo-100 dark:border-indigo-500/10">
                        {guest.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-tight pr-8">{guest.guestName}</h4>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50 dark:bg-slate-800/50 inline-flex px-2 py-0.5 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(guest.status, isPast)}`}></span>
                                {displayStatus}
                            </div>

                            {/* Refined Subtle Urgency Indicator */}
                            {mode === 'page' && isUnpaid && guest.totalAmount && guest.status !== 'deleted' && (
                                <div className="flex items-center gap-1.5 text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-500/10 inline-flex px-2 py-0.5 rounded-full border border-orange-200/50 dark:border-orange-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                    Unpaid
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overflow Menu */}
                <div className="absolute top-0 right-0" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="More options"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-11 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-white/10 p-1.5 z-30 animate-fade-in origin-top-right flex flex-col gap-0.5">
                            {guest.phoneNumber && (
                                <a
                                    href={`tel:${guest.phoneNumber}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="group flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors"
                                >
                                    <Phone size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" strokeWidth={2.5} />
                                    <span>Call Guest</span>
                                </a>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    loadGuestForEdit(guest);
                                    router.push('/add-guest');
                                }}
                                className="group flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors text-left"
                            >
                                <Edit3 size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" strokeWidth={2.5} />
                                <span>{isPast ? "View Guest Details" : "Edit Guest"}</span>
                            </button>
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                        onDelete(e, guest.id);
                                    }}
                                    className="group flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors text-left"
                                >
                                    <Trash2 size={14} className="text-slate-400 group-hover:text-rose-500 transition-colors" strokeWidth={2.5} />
                                    <span>Delete Guest</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Compact Metadata Rows */}
            <div className="mb-4 text-[11px] md:text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-3 font-medium bg-slate-50/50 dark:bg-slate-800/30 px-3.5 py-3 rounded-2xl border border-slate-100 dark:border-white/5">
                {/* Top Row: Dates & Duration */}
                <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5" title="Dates">
                        <Calendar size={13} className="text-indigo-500/70 dark:text-indigo-400/70 shrink-0" />
                        {formatDate(guest.checkInDate)} - {formatDate(guest.checkOutDate)}
                    </span>

                    <span className="flex items-center gap-1.5" title="Duration">
                        <Moon size={13} className="text-indigo-500/70 dark:text-indigo-400/70 shrink-0" />
                        {numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'}
                    </span>
                </div>

                {/* Bottom Row: Guests */}
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" title="Guests">
                        <Users size={13} className="text-indigo-500/70 dark:text-indigo-400/70 shrink-0" />
                        {guest.numberOfGuests} {guest.numberOfGuests === 1 ? 'Guest' : 'Guests'}
                    </span>
                </div>
            </div>

            {mode === 'picker' && (
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-indigo-500 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                        <ArrowRight size={16} />
                    </div>
                </div>
            )}

            {/* Financials & Property - Page Mode */}
            {mode === 'page' && (
                <div className="mt-auto pt-5 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">

                    {/* Billing Island */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-3 md:p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex gap-8 md:gap-10">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-[9px] md:text-[10px] uppercase font-bold tracking-wider mb-0.5">Total</p>
                                <p className="text-slate-900 dark:text-white font-mono font-bold text-sm md:text-base">{guest.totalAmount ? formatCurrency(guest.totalAmount) : '-'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-[9px] md:text-[10px] uppercase font-bold tracking-wider mb-0.5">Balance</p>
                                <p className={`font-mono font-bold text-sm md:text-base transition-colors duration-500 ${isUnpaid ? 'text-orange-500 dark:text-orange-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                    {guest.totalAmount ? formatCurrency(balance) : '-'}
                                </p>
                            </div>
                        </div>

                        {/* Payment Action / Status */}
                        {isUnpaid && guest.totalAmount && guest.status !== 'deleted' ? (
                            <button
                                onClick={handleMarkPaidClick}
                                disabled={isMarkingPaid}
                                className="group/btn relative bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/50 hover:border-indigo-600 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold text-[10px] md:text-[11px] uppercase tracking-wider shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-95 disabled:opacity-50 shrink-0"
                            >
                                <Banknote size={16} className="transition-transform group-hover/btn:scale-110" />
                                <span>Mark Paid</span>
                            </button>
                        ) : (!isUnpaid && guest.totalAmount! > 0) ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-3 py-1.5 rounded-xl shrink-0 animate-fade-in shadow-sm">
                                <CheckCircle2 size={14} />
                                <span>Settled</span>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex justify-between items-center">
                        {propertyName ? (
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-[10px] md:text-[11px] font-bold tracking-wide uppercase ${styles.bg} ${styles.border} ${styles.text}`}>
                                <Home size={12} className={styles.icon} />
                                <span className="truncate max-w-[120px] md:max-w-[160px]">{propertyName}</span>
                            </div>
                        ) : <div />}

                        <div className="bg-indigo-600 text-white p-2.5 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-500/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform md:translate-x-4 md:group-hover:translate-x-0 shrink-0">
                            <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
            )}

            {/* Property Chip - Picker Mode */}
            {mode !== 'page' && propertyName && (
                <div className="mt-3 border-t border-slate-100 dark:border-white/5 pt-3 flex justify-start">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-bold tracking-wide uppercase ${styles.bg} ${styles.border} ${styles.text}`}>
                        <Home size={12} className={styles.icon} />
                        {propertyName}
                    </div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            {isConfirmingPayment && (
                <Portal>
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                            onClick={() => !isMarkingPaid && setIsConfirmingPayment(false)}
                        />

                        {/* Modal Dialog */}
                        <div className="relative bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-slide-up">
                            {/* Close Button */}
                            <button
                                onClick={() => !isMarkingPaid && setIsConfirmingPayment(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-6 pt-8">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Confirm Payment
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                    Are you sure you want to mark <strong className="text-slate-900 dark:text-white">{guest.guestName}&apos;s</strong> balance of <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(balance)}</strong> as fully paid? This will update their account instantly.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsConfirmingPayment(false)}
                                        disabled={isMarkingPaid}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmPayment}
                                        disabled={isMarkingPaid}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        {isMarkingPaid ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            'Yes, Mark Paid'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};
