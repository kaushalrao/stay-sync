"use client";

import React from 'react';
import { useGuestFormStore } from '@store/index';
import { User, Phone } from 'lucide-react';
import { Input } from '@components/ui/Input';

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
        <div className="flex flex-col lg:h-full animate-fade-in lg:overflow-hidden">
            <div className="flex-1 lg:overflow-y-auto px-1 pb-2">
                <div className="flex flex-col justify-center lg:min-h-full max-w-lg mx-auto w-full space-y-6 md:space-y-8">
                    {/* Header: Centered on Desktop, Hidden on Mobile (redundant with main header) */}
                    <div className="hidden lg:block text-center space-y-1 mb-4">
                        <div className="flex items-center justify-center gap-2">
                            <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">Who is staying?</h2>
                            {isViewOnly && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-full border border-slate-200 dark:border-white/5 uppercase tracking-wider">Read Only</span>
                            )}
                        </div>
                        <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 leading-tight">
                            {isViewOnly ? "Viewing details for a past guest." : "Let's start with the basics."}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Input
                            label="Guest Name"
                            icon={<User size={14} />}
                            required
                            type="text"
                            value={guestData.guestName || ''}
                            onChange={(e) => updateGuestData({ guestName: e.target.value })}
                            onKeyDown={handleKeyDown}
                            autoFocus={!isViewOnly}
                            disabled={isViewOnly}
                            placeholder="e.g. John Doe"
                            inputSize="lg"
                            className="bg-slate-50 dark:bg-slate-800/50"
                        />

                        <div className="space-y-2">
                            <Input
                                label="WhatsApp Number"
                                icon={<Phone size={14} />}
                                required
                                type="tel"
                                value={guestData.phoneNumber || ''}
                                onChange={(e) => updateGuestData({ phoneNumber: e.target.value })}
                                onKeyDown={handleKeyDown}
                                disabled={isViewOnly}
                                placeholder="e.g. +91 98765 43210"
                                inputSize="lg"
                                className="bg-slate-50 dark:bg-slate-800/50"
                            />
                            {!isViewOnly && <p className="text-[11px] text-slate-500 ml-2 font-medium opacity-80 italic">Include country code for WhatsApp (e.g. +91)</p>}
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
