import React, { useState } from 'react';
import { Calendar, Users, Phone, Trash2, ArrowRight, Home, CheckCircle2 } from 'lucide-react';
import { GuestCardProps } from '../../lib/types';
import { formatDate, formatCurrency, getPropertyColorKey, getStatusColor, getDisplayStatus } from '../../lib/utils';
import { COLOR_VARIANTS } from '../../lib/constants';
import { useGuestStore, useUIStore } from '@store/index';
import { guestService } from '@services/index';

export const GuestCard: React.FC<GuestCardProps> = ({ guest, mode, onSelect, onDelete }) => {
    const propertyName = guest.propName || '';
    const colorKey = getPropertyColorKey(propertyName);
    const styles = COLOR_VARIANTS[colorKey];
    const displayStatus = getDisplayStatus(guest);
    const isPast = displayStatus === 'PAST';

    const updateGuestInStore = useGuestStore(state => state.updateGuestInStore);
    const showToast = useUIStore(state => state.showToast);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);

    const balance = guest.totalAmount ? Math.max(0, guest.totalAmount - guest.advancePaid) : 0;
    const isUnpaid = balance > 0;

    const handleMarkPaid = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMarkingPaid) return;

        setIsMarkingPaid(true);
        try {
            const updates = { advancePaid: guest.totalAmount };
            await guestService.updateGuest(guest.id, updates);
            updateGuestInStore(guest.id, updates);
            showToast('Payment marked as received!', 'success');
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
                ${onSelect ? 'cursor-pointer hover:scale-[1.02] active:scale-95 hover:z-10' : ''}
                ${mode === 'page' ? 'w-full h-full flex-1 shrink-0 flex flex-col justify-between min-h-[180px] z-0' : ''}
            `}
        >
            {/* Header with Avatar and Actions */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-lg border-2 border-indigo-100 dark:border-indigo-500/10">
                        {guest.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-tight">{guest.guestName}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(guest.status, isPast)}`}></span>
                            {displayStatus}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {guest.phoneNumber && (
                        <a
                            href={`tel:${guest.phoneNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-slate-500 dark:text-slate-600 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-500/10 rounded-xl transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center"
                            title={`Call ${guest.guestName}`}
                        >
                            <Phone size={16} />
                        </a>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => onDelete(e, guest.id)}
                            className="p-2 text-slate-500 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            title="Delete Guest"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Date and Guest Info */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-400 border-l-2 border-orange-500 dark:border-orange-400 pl-3 py-1">
                    <Calendar size={13} className="text-orange-500 dark:text-orange-400 shrink-0" />
                    <span className="font-medium">
                        {formatDate(guest.checkInDate)} - {formatDate(guest.checkOutDate)}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-500 pl-3">
                    <span className="flex items-center gap-1.5"><Users size={13} /> {guest.numberOfGuests} Guests</span>
                    {guest.phoneNumber && <span className="flex items-center gap-1.5"><Phone size={13} /> {guest.phoneNumber}</span>}
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
                        {isUnpaid && guest.totalAmount ? (
                            <button
                                onClick={handleMarkPaid}
                                disabled={isMarkingPaid}
                                className="group/btn relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 font-bold text-[10px] md:text-[11px] uppercase tracking-wider shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 shrink-0"
                            >
                                <CheckCircle2 size={14} className="transition-colors group-hover/btn:text-emerald-500 dark:group-hover/btn:text-emerald-400 opacity-60 group-hover/btn:opacity-100" />
                                <span>Mark Paid</span>
                            </button>
                        ) : !isUnpaid && guest.totalAmount! > 0 ? (
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
        </div>
    );
};
