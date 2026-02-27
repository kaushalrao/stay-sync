"use client";

import React, { useEffect } from 'react';
import { useGuestFormStore } from '@store/index';
import { Stage1Identity } from './Stage1Identity';
import { Stage2StayDetails } from './Stage2StayDetails';
import { Stage3Review } from './Stage3Review';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function WizardContainer() {
    const { stage, isEditing, isViewOnly, setStage, resetForm } = useGuestFormStore();
    const router = useRouter();

    // Prevent hydration mismatch if using persist
    const [mounted, setMounted] = React.useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="max-w-3xl mx-auto p-3 md:p-4 flex flex-col animate-fade-in relative pt-2 lg:pt-6 h-full w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                        {stage === 1 && (isEditing ? "Update Booking" : "Start a Booking")}
                        {stage === 2 && "Stay Details"}
                        {stage === 3 && (isEditing ? "Review Updates" : "Final Review")}
                    </h1>
                </div>
                {!isViewOnly && (
                    <button
                        onClick={resetForm}
                        className="text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors"
                    >
                        Clear Draft
                    </button>
                )}
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-3 md:mb-5 relative z-10 px-4 md:px-8 shrink-0">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-in-out" style={{ width: `${((stage - 1) / 2) * 100}%` }} />
                </div>
                {[1, 2, 3].map((step) => (
                    <div key={step} className={`relative z-10 flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full font-bold transition-all duration-300 text-xs md:text-base ${stage >= step ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-110' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                        {step}
                    </div>
                ))}
            </div>

            {/* Content Container */}
            <div className="flex-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl md:rounded-[2rem] shadow-xl border border-white/20 dark:border-white/5 p-3 md:p-6 flex flex-col z-10 relative overflow-hidden mb-0 lg:mb-4">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex-1 flex flex-col">
                    {stage === 1 && <Stage1Identity />}
                    {stage === 2 && <Stage2StayDetails />}
                    {stage === 3 && <Stage3Review />}
                </div>
            </div>
        </div>
    );
}
