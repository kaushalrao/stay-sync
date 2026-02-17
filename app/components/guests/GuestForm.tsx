import React from 'react';
import { CalendarCheck, Users, Edit3, Wallet } from 'lucide-react';
import { GuestDetails, GuestFormProps } from '../../lib/types';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DatePicker } from '../calendar/DatePicker';

export const GuestForm: React.FC<GuestFormProps> = ({ details, onChange, templateContent = '', blockedDates = [], onSaveGuest, onOpenDirectory, icalFeeds = [], isDirty, isReadOnly }) => {

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
        if (isReadOnly) return;
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
        <Card className="!p-4 md:!p-8 relative !bg-white dark:!bg-slate-900/40 !border-slate-200 dark:!border-white/5 !shadow-2xl">
            <SectionHeader title="Guest Details" icon={<Users size={16} />} />

            <div className="space-y-4 md:space-y-6">
                <div className="relative group">
                    <input
                        value={details.guestName}
                        onChange={(e) => update('guestName', e.target.value)}
                        placeholder="Guest Name"
                        disabled={isReadOnly}
                        className={`w-full px-4 py-3 md:px-5 md:py-4 pl-4 md:pl-5 text-base md:text-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-black/20 border border-slate-300 dark:border-white/5 rounded-2xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 focus:bg-slate-50 dark:focus:bg-black/30'}`}
                    />
                    <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-orange-400 transition-colors">
                        <Edit3 size={16} />
                    </div>
                </div>

                <div className="relative group animate-fade-in">
                    <input
                        value={details.phoneNumber || ''}
                        onChange={(e) => update('phoneNumber', e.target.value.replace(/[^0-9+\-\(\)\s]/g, ''))}
                        placeholder="Phone Number"
                        disabled={isReadOnly}
                        className={`w-full px-4 py-3 md:px-5 md:py-3.5 pl-4 md:pl-5 text-sm md:text-base font-medium text-slate-900 dark:text-white bg-white dark:bg-black/20 border border-slate-300 dark:border-white/5 rounded-2xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 focus:bg-slate-50 dark:focus:bg-black/30'}`}
                    />
                </div>

                <div className="space-y-3 md:space-y-4">
                    {(templateContent.includes('{{checkIn') || templateContent.includes('{{nights') || templateContent.includes('{{totalAmount')) && (
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="group bg-white dark:bg-black/20 p-3 md:p-4 rounded-2xl border border-slate-300 dark:border-white/5 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                                <DatePicker
                                    label="Check-in"
                                    variant="check-in"
                                    date={details.checkInDate}
                                    otherDate={details.checkOutDate}
                                    onChange={(date) => update('checkInDate', date)}
                                    blockedDates={blockedDates}
                                    icalFeeds={icalFeeds}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="group bg-white dark:bg-black/20 p-3 md:p-4 rounded-2xl border border-slate-300 dark:border-white/5 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                                <DatePicker
                                    label="Check-out"
                                    variant="check-out"
                                    align="right"
                                    date={details.checkOutDate}
                                    otherDate={details.checkInDate}
                                    onChange={(date) => update('checkOutDate', date)}
                                    blockedDates={blockedDates}
                                    icalFeeds={icalFeeds}
                                    disabled={isReadOnly}
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
                                disabled={isReadOnly}
                                className="text-sm md:text-base font-bold bg-white dark:bg-black/20"
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
                                disabled={isReadOnly}
                                className="text-sm md:text-base font-bold bg-white dark:bg-black/20"
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
                                    const amount = isNaN(val) ? 0 : val;
                                    update('discount', amount);
                                }}
                                disabled={isReadOnly}
                                placeholder="₹0"
                                className="text-sm md:text-base font-bold bg-white dark:bg-black/20"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {onOpenDirectory && (
                            <Button
                                type="button"
                                variant="purple"
                                onClick={onOpenDirectory}
                                className="w-full h-[54px] rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Users size={16} className="text-purple-700 group-hover:text-purple-800 transition-colors" /> Directory
                            </Button>
                        )}
                        {onSaveGuest && (() => {
                            const isPhoneValid = details.phoneNumber && details.phoneNumber.length >= 10 && /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(details.phoneNumber.replace(/\s/g, ''));
                            const isValid = details.guestName && isPhoneValid && details.checkInDate && details.checkOutDate && details.numberOfGuests > 0;
                            const canSave = !isReadOnly && isValid && (isDirty === undefined || isDirty);
                            return (
                                <Button
                                    type="button"
                                    onClick={onSaveGuest}
                                    disabled={!canSave}
                                    variant={canSave ? 'primary' : 'secondary'}
                                    className={`w-full h-[54px] rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg ${!canSave ? 'opacity-60 cursor-not-allowed shadow-none' : ''}`}
                                >
                                    <CalendarCheck size={16} className={canSave ? "text-orange-100" : ""} /> {isReadOnly ? 'Viewing History' : 'Save Guest'}
                                </Button>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </Card>
    );
};
