import React from 'react';
import { Calendar, Users, Phone, Trash2, ArrowRight, Home } from 'lucide-react';
import { GuestCardProps } from '../../lib/types';
import { formatDate, formatCurrency, getPropertyColorKey, getStatusColor, getDisplayStatus } from '../../lib/utils';
import { COLOR_VARIANTS } from '../../lib/constants';

export const GuestCard: React.FC<GuestCardProps> = ({ guest, mode, onSelect, onDelete }) => {
    const propertyName = guest.propName || '';
    const colorKey = getPropertyColorKey(propertyName);
    const styles = COLOR_VARIANTS[colorKey];
    const displayStatus = getDisplayStatus(guest);
    const isPast = displayStatus === 'PAST';

    return (
        <div
            onClick={() => onSelect && onSelect(guest)}
            className={`
                group relative bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:bg-slate-800/60 dark:hover:border-white/10
                ${onSelect ? 'cursor-pointer hover:scale-[1.02] active:scale-95 hover:z-10' : ''}
                ${mode === 'page' ? 'w-full h-auto shrink-0 flex flex-col justify-between min-h-[180px] z-0' : ''}
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
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-slate-600 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total</p>
                            <p className="text-slate-900 dark:text-white font-mono font-bold text-base">{guest.totalAmount ? formatCurrency(guest.totalAmount) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-slate-600 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Balance</p>
                            <p className="text-orange-500 dark:text-orange-400 font-mono font-bold text-base">
                                {guest.totalAmount ? formatCurrency(Math.max(0, guest.totalAmount - guest.advancePaid)) : '-'}
                            </p>
                        </div>
                    </div>

                    {propertyName && (
                        <div className="flex justify-between items-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-bold tracking-wide uppercase ${styles.bg} ${styles.border} ${styles.text}`}>
                                <Home size={12} className={styles.icon} />
                                {propertyName}
                            </div>

                            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform md:translate-x-4 md:group-hover:translate-x-0">
                                <ArrowRight size={16} />
                            </div>
                        </div>
                    )}
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
