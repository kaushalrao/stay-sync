"use client";

import React from 'react';
import { useGuestFormStore } from '@store/index';
import { User, Phone } from 'lucide-react';

export function Stage1Identity() {
    const { guestData, isViewOnly, updateGuestData, setStage } = useGuestFormStore();

    const handleNext = () => {
        if (!guestData.guestName || !guestData.phoneNumber) return;
        setStage(2);
    };

    const isNextDisabled = !guestData.guestName || !guestData.phoneNumber;

    // Trigger next on enter if valid
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isNextDisabled) {
            handleNext();
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in overflow-hidden">
            <div className="flex-1 overflow-y-auto px-1 pb-2">
                <div className="flex flex-col justify-center min-h-full max-w-lg mx-auto w-full space-y-6">
                    <div className="text-center space-y-0.5 mb-2">
                        <div className="flex items-center justify-center gap-2">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Who is staying?</h2>
                            {isViewOnly && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-full border border-slate-200 dark:border-white/5 uppercase tracking-wider">Read Only</span>
                            )}
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-tight">
                            {isViewOnly ? "Viewing details for a past guest." : "Let's start with the basics."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5 group">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <User size={16} className="text-indigo-500" /> Guest Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={guestData.guestName || ''}
                                onChange={(e) => updateGuestData({ guestName: e.target.value })}
                                onKeyDown={handleKeyDown}
                                autoFocus={!isViewOnly}
                                disabled={isViewOnly}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-base font-medium text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-1.5 group">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <Phone size={16} className="text-indigo-500" /> WhatsApp Number <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={guestData.phoneNumber || ''}
                                onChange={(e) => updateGuestData({ phoneNumber: e.target.value })}
                                onKeyDown={handleKeyDown}
                                disabled={isViewOnly}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-base font-medium text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder="e.g. +1 234 567 8900"
                            />
                            {!isViewOnly && <p className="text-[11px] text-slate-500 ml-2">Include country code for WhatsApp (e.g. +91)</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50 flex justify-end shrink-0">
                <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.5)] active:scale-[0.98] flex justify-center"
                >
                    Continue to Stay Details
                </button>
            </div>
        </div>
    );
}
