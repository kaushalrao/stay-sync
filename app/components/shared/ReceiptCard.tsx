import React from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@lib/utils';
import { CheckCircle2 } from 'lucide-react';
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

export const ReceiptCard = React.forwardRef<HTMLDivElement, ReceiptCardProps>(({
    guestName, phoneNumber, property, checkInDate, checkOutDate, nights,
    numberOfGuests, baseRate, baseTotal, extraGuestRate, extraGuestsCount,
    extraTotal, discount, totalAmount, advancePaid, balanceDue
}, ref) => {
    return (
        <div ref={ref} className="bg-white dark:bg-[#1C1F2E] rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden group border border-slate-200 dark:border-[#2D334B]">
            {/* Receipt decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-[#2D334B] to-transparent opacity-50"></div>

            {/* Identity Summary */}
            <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-[#2D334B]">
                <div>
                    <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white tracking-tight">{guestName || 'Guest Name'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">{phoneNumber || 'Phone Number'}</p>
                </div>
                <CheckCircle2 className="text-teal-500 w-6 h-6 shrink-0" strokeWidth={2.5} />
            </div>

            {/* Stay Summary */}
            <div className="space-y-4 py-5 border-b border-slate-100 dark:border-[#2D334B]">
                <div className="flex justify-between text-[13px] md:text-sm items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Property</span>
                    <span className="font-semibold text-slate-800 dark:text-white tracking-tight">{property?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-[13px] md:text-sm items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Dates ({nights} Nights)</span>
                    <span className="font-semibold text-slate-800 dark:text-white tracking-tight">
                        {checkInDate && format(new Date(checkInDate), 'dd MMM')} - {checkOutDate && format(new Date(checkOutDate), 'dd MMM')}
                    </span>
                </div>
                <div className="flex justify-between text-[13px] md:text-sm items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Guests</span>
                    <span className="font-semibold text-slate-800 dark:text-white tracking-tight">{numberOfGuests}</span>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-3 pt-5">
                <div className="flex justify-between text-[13px] md:text-sm items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Base Cost (₹{formatCurrency(baseRate)} × {nights})</span>
                    <span className="font-semibold text-slate-800 dark:text-white tracking-tight">₹{formatCurrency(baseTotal)}</span>
                </div>
                {extraTotal > 0 && (
                    <div className="flex justify-between text-[13px] md:text-sm items-center">
                        <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Extra Guests (₹{formatCurrency(extraGuestRate)} × {extraGuestsCount} × {nights})</span>
                        <span className="font-semibold text-slate-800 dark:text-white tracking-tight">₹{formatCurrency(extraTotal)}</span>
                    </div>
                )}
                {discount > 0 && (
                    <div className="flex justify-between text-[13px] md:text-sm items-center text-rose-500">
                        <span className="font-medium tracking-wide">Discount</span>
                        <span className="font-semibold tracking-tight">-₹{formatCurrency(discount)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-[13px] md:text-sm font-semibold py-1 border-t border-dashed border-slate-200 dark:border-[#2D334B] mt-2 pt-3">
                    <span className="text-slate-500 dark:text-slate-400 tracking-tight">Total Amount</span>
                    <span className="text-indigo-600 dark:text-indigo-400 tracking-tight">₹{formatCurrency(totalAmount)}</span>
                </div>

                {advancePaid > 0 && (
                    <div className="flex justify-between text-[13px] md:text-sm items-center pt-2">
                        <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Advance Paid</span>
                        <span className="font-semibold text-teal-600 dark:text-teal-400 tracking-tight">-₹{formatCurrency(advancePaid)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-base md:text-lg font-black pt-4 mt-2 border-t border-slate-100 dark:border-[#2D334B]">
                    <span className="text-slate-900 dark:text-white tracking-tight">Balance Due</span>
                    <span className="text-rose-500 tracking-tight text-xl md:text-2xl">₹{formatCurrency(balanceDue)}</span>
                </div>
            </div>
        </div>
    );
});

ReceiptCard.displayName = 'ReceiptCard';
