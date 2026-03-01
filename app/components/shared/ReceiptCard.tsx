import React from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@lib/utils';
import { CheckCircle2, Building2 } from 'lucide-react';
import { Property } from '@lib/types';

interface ReceiptCardProps {
    guestName: string;
    phoneNumber: string;
    property?: Property;
    checkInDate?: string;
    checkOutDate?: string;
    nights: number;
    numberOfGuests: number;
    baseRate: number;
    baseTotal: number;
    extraGuestRate: number;
    extraGuestsCount: number;
    extraTotal: number;
    discount: number;
    totalAmount: number;
    advancePaid: number;
    balanceDue: number;
}

const formatTime12hr = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutesStr} ${ampm}`;
};

export const ReceiptCard = React.forwardRef<HTMLDivElement, ReceiptCardProps>(({
    guestName, phoneNumber, property, checkInDate, checkOutDate, nights,
    numberOfGuests, baseRate, baseTotal, extraGuestRate, extraGuestsCount,
    extraTotal, discount, totalAmount, advancePaid, balanceDue
}, ref) => {
    return (
        <div ref={ref} className="bg-white dark:bg-[#131823] text-slate-900 dark:text-white rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/60 w-full max-w-md mx-auto flex flex-col font-sans">
            {/* Header: Brand & Trust */}
            <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50 dark:bg-[#1A202C]">
                <div className="flex items-center gap-3">
                    <div className="overflow-hidden rounded-full">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-lg border border-slate-300 dark:border-slate-700">
                            {property?.name ? property.name.charAt(0).toUpperCase() : <Building2 size={20} />}
                        </div>
                    </div>
                    <span className="font-bold text-[15px] tracking-tight text-slate-800 dark:text-slate-200">{property?.name || 'Property'}</span>
                </div>
                {balanceDue > 0 ? (
                    <div className="overflow-hidden rounded-full">
                        <span className="px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-rose-200 dark:border-rose-500/20 whitespace-nowrap block">Balance Pending</span>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-full">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 whitespace-nowrap block">Fully Paid</span>
                    </div>
                )}
            </div>

            {/* Zone 1: Guest Identity */}
            <div className="px-4 md:px-5 pt-4 md:pt-5 pb-2 md:pb-3">
                <h2 className="text-[24px] font-black tracking-tight text-slate-900 dark:text-white mb-0.5 leading-none">{guestName || 'Guest Name'}</h2>
                <p className="font-medium text-[14px] text-slate-500 dark:text-slate-400">{phoneNumber || 'Phone Number'}</p>
            </div>

            {/* Zone 2: Itinerary */}
            <div className="px-4 md:px-6 pb-4 md:pb-6">
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 md:p-5 flex justify-between items-center border border-slate-100 dark:border-slate-700/50 relative overflow-hidden gap-1 md:gap-2">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 dark:bg-indigo-400"></div>
                    <div className="flex flex-col pl-2 md:pl-3 flex-1 min-w-0">
                        <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-slate-400 dark:text-slate-500 mb-0.5">Check-in</span>
                        <span className="font-bold text-[13px] md:text-[15px] text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{checkInDate ? format(new Date(checkInDate), 'dd MMM yyyy') : '--'}</span>
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-widest mt-0.5">{formatTime12hr(property?.checkInTime || '14:00')}</span>
                    </div>

                    {/* Center Timeline */}
                    <div className="shrink-0 flex flex-col items-center justify-center relative px-1 md:px-2 self-stretch min-h-[48px]">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-200 dark:bg-slate-700 -translate-y-1/2 -z-10"></div>

                        {/* Nights Pill */}
                        <div className="z-10 m-auto overflow-hidden rounded-full">
                            <span className="text-[10px] md:text-[11px] bg-white dark:bg-[#1A202C] text-slate-500 dark:text-slate-400 font-bold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap block">
                                {nights} {nights === 1 ? 'Night' : 'Nights'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end flex-1 min-w-0 text-right">
                        <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-slate-400 dark:text-slate-500 mb-0.5">Check-out</span>
                        <span className="font-bold text-[13px] md:text-[15px] text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{checkOutDate ? format(new Date(checkOutDate), 'dd MMM yyyy') : '--'}</span>
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-widest mt-0.5">{formatTime12hr(property?.checkOutTime || '11:00')}</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.1em] border border-slate-200 dark:border-slate-700">
                        {numberOfGuests} {numberOfGuests === 1 ? 'Guest' : 'Guests'}
                    </span>
                </div>
            </div>

            {/* Zone 3: Financial Ledger */}
            <div className="px-4 md:px-5 pb-4 space-y-2">
                {/* Base Cost */}
                <div className="flex justify-between items-start gap-3">
                    <span className="font-medium text-[12px] text-slate-500 dark:text-slate-400 tracking-wide leading-snug">
                        Base Cost (Upto {numberOfGuests - extraGuestsCount} guests) <br className="hidden md:block" />(₹{formatCurrency(baseRate)} × {nights} 🌙)
                    </span>
                    <span className="font-semibold text-[14px] text-slate-900 dark:text-white tabular-nums tracking-tight shrink-0 mt-0.5">₹{formatCurrency(baseTotal)}</span>
                </div>

                {/* Extra Guests */}
                {extraTotal > 0 && (
                    <div className="flex justify-between items-start gap-3">
                        <span className="font-medium text-[12px] text-slate-500 dark:text-slate-400 tracking-wide leading-snug">
                            Extra Guests <br className="hidden md:block" />(₹{formatCurrency(extraGuestRate)} × {extraGuestsCount} 👤 × {nights} 🌙)
                        </span>
                        <span className="font-semibold text-[14px] text-slate-900 dark:text-white tabular-nums tracking-tight shrink-0 mt-0.5">₹{formatCurrency(extraTotal)}</span>
                    </div>
                )}

                {discount > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-[13px] text-emerald-600 dark:text-emerald-400 tracking-wide">Discount</span>
                        <span className="font-bold text-[15px] text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">-₹{formatCurrency(discount)}</span>
                    </div>
                )}

                <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-700/80"></div>

                <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-[13px] text-slate-800 dark:text-slate-200 tracking-wide">Total Amount</span>
                    <span className="font-bold text-[15px] text-slate-900 dark:text-white tabular-nums tracking-tight shrink-0">₹{formatCurrency(totalAmount)}</span>
                </div>

                {advancePaid > 0 && (
                    <div className="flex justify-between items-center pt-1 gap-2">
                        <span className="font-bold text-[12px] text-emerald-600 dark:text-emerald-400 tracking-wide">Advance Paid</span>
                        <span className="font-bold text-[14px] text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight shrink-0">-₹{formatCurrency(advancePaid)}</span>
                    </div>
                )}
            </div>
            {/* Zone 4: Action Block (Total Due / Paid) */}
            {balanceDue > 0 ? (
                <div className="mx-4 mb-4 mt-0.5 bg-rose-50 dark:bg-rose-500/10 rounded-[24px] p-3 md:p-4 text-center border-2 border-rose-200 dark:border-rose-500/20 relative z-20 overflow-hidden transform-gpu">
                    <p className="text-rose-600 dark:text-rose-400/80 text-[9px] font-bold uppercase tracking-widest mb-0.5 relative z-10">Amount Due on Arrival</p>
                    <p className="text-[26px] md:text-[28px] font-black tracking-tighter text-rose-700 dark:text-rose-300 tabular-nums leading-none mb-1">₹{formatCurrency(balanceDue)}</p>
                    <p className="text-rose-500 dark:text-rose-400/60 text-[9px] font-medium tracking-wide mt-1 md:mt-1.5">Payable via Cash / UPI</p>
                </div>
            ) : (
                <div className="mx-4 mb-4 mt-0.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-[24px] p-3 text-center flex flex-col items-center justify-center relative z-20 overflow-hidden transform-gpu">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-1.5 relative z-10">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                    </div>
                    <p className="text-[15px] font-black tracking-tighter text-emerald-800 dark:text-emerald-300 leading-none mb-1 relative z-10">Payment Complete</p>
                    <p className="text-emerald-600 dark:text-emerald-400/80 text-[9px] font-bold uppercase tracking-widest mt-0.5 relative z-10">Thank you for choosing us!</p>
                </div>
            )}

            {/* Footer Validation */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 py-2.5 flex items-center justify-center">
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-80">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 inline-block"></span> Powered by Stay Sync
                </p>
            </div>
        </div>
    );
});

ReceiptCard.displayName = 'ReceiptCard';
