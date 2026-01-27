import React from 'react';
import { Users, Edit3, Calendar, CalendarCheck, Wallet } from 'lucide-react';
import { Card } from './ui/Card';
import { SectionHeader } from './ui/SectionHeader';
import { Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';

import { GuestDetails } from '../lib/types';

export const GuestForm: React.FC<{
    details: GuestDetails;
    onChange: (details: GuestDetails) => void;
    templateContent?: string;
    blockedDates?: { start: string, end: string }[];
}> = ({ details, onChange, templateContent = '', blockedDates = [] }) => {

    const isDateBlocked = (dateStr: string, type: 'checkIn' | 'checkOut') => {
        if (!dateStr || blockedDates.length === 0) return false;
        // String comparison is safer for YYYY-MM-DD format to avoid timezone issues
        return blockedDates.some(range => {
            if (type === 'checkIn') {
                return dateStr >= range.start && dateStr < range.end;
            } else {
                // For check-out, it's blocked if it falls strictly after start and before-or-on end.
                // i.e. we cannot checkout if we stayed the night of 'start'.
                return dateStr > range.start && dateStr <= range.end;
            }
        });
    };

    const update = (field: keyof GuestDetails, value: any) => {
        if ((field === 'checkInDate' || field === 'checkOutDate')) {
            const type = field === 'checkInDate' ? 'checkIn' : 'checkOut';
            if (isDateBlocked(value, type)) {
                alert("This date is booked on Airbnb!");
                // return; // Optional: Force block, or just warn. Alert is strict enough.
            }
        }
        onChange({ ...details, [field]: value });
    };

    return (
        <Card className="!p-4 md:!p-8">
            <SectionHeader title="Guest Details" icon={<Users size={16} />} />
            <div className="space-y-4 md:space-y-6">
                <div className="relative group">
                    <input
                        value={details.guestName}
                        onChange={(e) => update('guestName', e.target.value)}
                        placeholder="Guest Name"
                        className="w-full px-4 py-3 md:px-5 md:py-4 pl-4 md:pl-5 text-base md:text-lg font-bold text-white bg-black/20 border border-white/5 rounded-2xl outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 focus:bg-black/30 placeholder:text-slate-600"
                    />
                    <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-400 transition-colors">
                        <Edit3 size={16} />
                    </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                    {(templateContent.includes('{{checkIn') || templateContent.includes('{{nights') || templateContent.includes('{{totalAmount')) && (
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="group bg-black/20 p-3 md:p-4 rounded-2xl border border-white/5 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                                <DatePicker
                                    label="Check-in"
                                    variant="check-in"
                                    date={details.checkInDate}
                                    otherDate={details.checkOutDate}
                                    onChange={(date) => update('checkInDate', date)}
                                    blockedDates={blockedDates}
                                />
                            </div>
                            <div className="group bg-black/20 p-3 md:p-4 rounded-2xl border border-white/5 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                                <DatePicker
                                    label="Check-out"
                                    variant="check-out"
                                    align="right"
                                    date={details.checkOutDate}
                                    otherDate={details.checkInDate}
                                    onChange={(date) => update('checkOutDate', date)}
                                    blockedDates={blockedDates}
                                />
                            </div>
                        </div>
                    )}

                    {(templateContent.includes('{{totalAmount') || templateContent.includes('{{balanceDue')) && (
                        <div className="grid grid-cols-1 gap-3 md:gap-4 animate-fade-in">
                            <Input
                                type="number"
                                min={1}
                                label="No. of Guests"
                                icon={<Users size={12} className="shrink-0" />}
                                value={details.numberOfGuests === 0 ? '' : details.numberOfGuests}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    update('numberOfGuests', isNaN(val) ? 0 : val);
                                }}
                                placeholder="Guests"
                                className="text-sm md:text-base font-bold bg-black/20"
                            />
                        </div>
                    )}

                    {(templateContent.includes('{{totalAmount') || templateContent.includes('{{balanceDue')) && (
                        <div className="grid grid-cols-2 gap-3 md:gap-4 animate-fade-in">
                            <Input
                                type="number"
                                min={0}
                                label="Advance Paid"
                                icon={<Wallet size={12} className="shrink-0" />}
                                value={details.advancePaid === 0 ? '' : details.advancePaid}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    update('advancePaid', isNaN(val) ? 0 : val);
                                }}
                                placeholder="₹0"
                                className="text-sm md:text-base font-bold bg-black/20"
                            />
                            <Input
                                type="number"
                                min={0}
                                label="Discount"
                                labelClassName="!text-green-500 group-focus-within:!text-green-400"
                                icon={<Wallet size={12} className="shrink-0" />}
                                value={details.discount === 0 ? '' : details.discount}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    update('discount', isNaN(val) ? 0 : val);
                                }}
                                placeholder="₹0"
                                className="text-sm md:text-base font-bold bg-black/20"
                            />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
