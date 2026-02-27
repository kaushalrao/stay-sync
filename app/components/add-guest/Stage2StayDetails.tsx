"use client";

import React, { useEffect, useState } from 'react';
import { useGuestFormStore, usePropertyStore, useGuestStore } from '@store/index';
import { useApp } from '@components/providers/AppProvider';
import { calendarService } from '@services/index';
import { DatePicker } from '@components/calendar/DatePicker';
import { Input } from '@components/ui/Input';
import { Users, Wallet, Home } from 'lucide-react';
import { CalendarEvent } from '@lib/types';

export function Stage2StayDetails() {
    const { guestData, isViewOnly, updateGuestData, setStage } = useGuestFormStore();
    const properties = usePropertyStore(state => state.properties);
    const guestsFromStore = useGuestStore(state => state.guests);
    const { user } = useApp();

    const [blockedDates, setBlockedDates] = useState<CalendarEvent[]>([]);

    const selectedProperty = properties.find(p => p.id === guestData.propertyId) || properties[0];

    // Auto-select first property if none selected
    useEffect(() => {
        if (!guestData.propertyId && properties.length > 0) {
            updateGuestData({
                propertyId: properties[0].id,
                propName: properties[0].name
            });
        }
    }, [properties, guestData.propertyId, updateGuestData]);

    // Fetch blocked dates for selected property
    useEffect(() => {
        const fetchCalendarData = async () => {
            if (!user?.uid || !selectedProperty) return;
            const events = await calendarService.aggregateEvents(guestsFromStore, selectedProperty);
            setBlockedDates(events);
        };
        fetchCalendarData();
    }, [selectedProperty, user?.uid, guestsFromStore]);

    const isDateBlocked = (dateStr: string, type: 'checkIn' | 'checkOut') => {
        if (!dateStr || blockedDates.length === 0) return false;
        return blockedDates.some(range => {
            if (type === 'checkIn') {
                return dateStr >= range.start && dateStr < range.end;
            } else {
                return dateStr > range.start && dateStr <= range.end;
            }
        });
    };

    const handleDateChange = (field: 'checkInDate' | 'checkOutDate', value: string) => {
        const type = field === 'checkInDate' ? 'checkIn' : 'checkOut';
        if (isDateBlocked(value, type)) {
            alert("This date is already booked or blocked!");
            // Still allow it if they really want, but usually we would trap here.
        }
        updateGuestData({ [field]: value });
    };

    const handleNext = () => setStage(3);
    const handleBack = () => setStage(1);

    const isNextDisabled = !guestData.checkInDate || !guestData.checkOutDate || !guestData.propertyId || (guestData.numberOfGuests || 0) < 1;

    return (
        <div className="flex flex-col h-full animate-fade-in overflow-hidden">
            <div className="flex-1 overflow-y-auto px-1 pb-2">
                <div className="flex flex-col justify-center min-h-full max-w-lg mx-auto w-full space-y-3 md:space-y-4">
                    <div className="text-center space-y-0.5 mb-2">
                        <div className="flex items-center justify-center gap-2">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Stay Details</h2>
                            {isViewOnly && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-full border border-slate-200 dark:border-white/5 uppercase tracking-wider">Read Only</span>
                            )}
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-tight">
                            {isViewOnly ? "Viewing stay details for a past guest." : "When and where are they staying?"}
                        </p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {/* Property Selection */}
                        <div className="space-y-1.5 group">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <Home size={16} className="text-indigo-500" /> Property <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={guestData.propertyId || ''}
                                disabled={isViewOnly}
                                onChange={(e) => {
                                    const prop = properties.find(p => p.id === e.target.value);
                                    updateGuestData({
                                        propertyId: e.target.value,
                                        propName: prop?.name
                                    });
                                }}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-base font-medium text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <option value="" disabled>Select a property</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 group bg-white dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-white/10 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all shadow-sm">
                                <DatePicker
                                    label="Check-in"
                                    variant="check-in"
                                    date={guestData.checkInDate || ''}
                                    otherDate={guestData.checkOutDate || ''}
                                    onChange={(val) => handleDateChange('checkInDate', val)}
                                    blockedDates={blockedDates}
                                    icalFeeds={selectedProperty?.icalFeeds || []}
                                    disabled={isViewOnly}
                                />
                            </div>
                            <div className="space-y-1 group bg-white dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-white/10 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/20 transition-all shadow-sm">
                                <DatePicker
                                    label="Check-out"
                                    variant="check-out"
                                    align="right"
                                    date={guestData.checkOutDate || ''}
                                    otherDate={guestData.checkInDate || ''}
                                    onChange={(val) => handleDateChange('checkOutDate', val)}
                                    blockedDates={blockedDates}
                                    icalFeeds={selectedProperty?.icalFeeds || []}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>

                        {/* Financials & Guests */}
                        {/* Financials Row 1: Guests and Advance */}
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                min={1}
                                label="Guests"
                                icon={<Users size={12} className="shrink-0" />}
                                value={guestData.numberOfGuests || ''}
                                disabled={isViewOnly}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    updateGuestData({ numberOfGuests: isNaN(val) ? 0 : val });
                                }}
                                placeholder="Guests"
                                className="font-bold bg-white dark:bg-slate-800/50 shadow-sm text-sm disabled:opacity-70"
                                inputSize="sm"
                            />
                            <Input
                                type="number"
                                min={0}
                                label="Advance"
                                icon={<Wallet size={12} className="shrink-0" />}
                                value={guestData.advancePaid || ''}
                                disabled={isViewOnly}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    updateGuestData({ advancePaid: isNaN(val) ? 0 : val });
                                }}
                                placeholder="₹0"
                                className="font-bold bg-white dark:bg-slate-800/50 shadow-sm text-green-600 dark:text-green-400 text-sm disabled:opacity-70"
                                inputSize="sm"
                            />
                            <Input
                                type="number"
                                min={0}
                                label="Discount (₹)"
                                icon={<Wallet size={12} className="shrink-0" />}
                                value={guestData.discount || ''}
                                disabled={isViewOnly}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    updateGuestData({ discount: isNaN(val) ? 0 : val });
                                }}
                                placeholder="₹0"
                                className="font-bold bg-white dark:bg-slate-800/50 shadow-sm text-rose-500 text-sm disabled:opacity-70"
                                inputSize="sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-2 shrink-0">
                <button
                    onClick={handleBack}
                    className="order-2 md:order-1 px-6 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium transition-colors w-full md:w-auto text-center"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className="order-1 md:order-2 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.5)] active:scale-[0.98] flex justify-center"
                >
                    Review Details
                </button>
            </div>
        </div>
    );
}
