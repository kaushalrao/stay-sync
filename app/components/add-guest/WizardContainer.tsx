"use client";

import React, { useEffect } from 'react';
import { useGuestFormStore } from '@store/index';
import { WizardStepper } from './WizardStepper';
import { Stage1Identity } from './Stage1Identity';
import { Stage2StayDetails } from './Stage2StayDetails';
import { Stage3Review } from './Stage3Review';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export function WizardContainer() {
    const { stage, isEditing, isViewOnly, guestData, setStage, resetForm } = useGuestFormStore();
    const router = useRouter();

    // Prevent hydration mismatch if using persist
    const [mounted, setMounted] = React.useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const canGoNext = () => {
        if (stage === 1) return !!(guestData.guestName && guestData.phoneNumber);
        if (stage === 2) return !!(guestData.propertyId && guestData.checkInDate && guestData.checkOutDate);
        return false;
    };

    const handlePrev = () => {
        if (stage > 1) setStage((stage - 1) as 1 | 2 | 3);
    };

    const handleNext = () => {
        if (canGoNext()) setStage((stage + 1) as 1 | 2 | 3);
    };

    return (
        <div className="w-full 2xl:max-w-[1600px] xl:max-w-7xl max-w-6xl mx-auto p-0 md:p-6 lg:p-10 flex flex-col lg:flex-row gap-0 lg:gap-16 animate-fade-in relative min-h-screen lg:h-full lg:overflow-hidden pb-24 md:pb-0">
            {/* Desktop: Header (Floating Top Left) */}
            <header className="hidden lg:block absolute top-12 left-10 z-20">
                <h1 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 tracking-tight">
                    {stage === 1 && (isEditing ? "Update Booking" : "Start a Booking")}
                    {stage === 2 && "Stay Details"}
                    {stage === 3 && (isEditing ? "Review Updates" : "Final Review")}
                </h1>
            </header>

            {/* Mobile Navigation Arrows (Floating) */}
            <div className="lg:hidden fixed bottom-8 left-0 right-0 z-[60] flex justify-between px-6 pointer-events-none">
                <button
                    onClick={handlePrev}
                    disabled={stage === 1}
                    className={`p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl transition-all pointer-events-auto active:scale-95 ${stage === 1 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
                >
                    <ChevronLeft size={24} className="text-slate-900 dark:text-white" />
                </button>
                <button
                    onClick={handleNext}
                    disabled={stage === 3 || !canGoNext()}
                    className={`p-4 rounded-2xl bg-indigo-600/90 dark:bg-indigo-500/90 backdrop-blur-xl shadow-2xl shadow-indigo-500/20 transition-all pointer-events-auto active:scale-95 ${stage === 3 || !canGoNext() ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
                >
                    <ChevronRight size={24} className="text-white" />
                </button>
            </div>

            {/* Left Col: Centered Stepper (Desktop) / Top Section (Mobile) */}
            <div className="flex flex-col lg:w-72 shrink-0 lg:justify-center overflow-visible">
                {/* Mobile Header: Compact & Clear */}
                <header className="lg:hidden flex items-center justify-between px-6 py-5 z-20 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1.5">Step {stage} of 3</span>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate tracking-tight leading-none">
                            {stage === 1 && (isEditing ? "Update Booking" : "Guest Identity")}
                            {stage === 2 && "Stay Details"}
                            {stage === 3 && "Final Review"}
                        </h1>
                    </div>

                    {!isViewOnly && (
                        <button
                            onClick={resetForm}
                            className="text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                            Clear
                        </button>
                    )}
                </header>

                {/* Adaptive Stepper (Progress Bar on Mobile) */}
                <div className="lg:mb-0 shrink-0 relative lg:static">
                    <WizardStepper currentStage={stage} />
                </div>

                {/* Desktop Clear Draft */}
                {!isViewOnly && (
                    <div className="hidden lg:block pt-12">
                        <button
                            onClick={resetForm}
                            className="flex items-center gap-3 text-xs font-black text-slate-400 hover:text-rose-500 transition-all uppercase tracking-[0.2em] p-3 hover:bg-rose-500/5 rounded-2xl border border-transparent hover:border-rose-500/10 group w-full"
                        >
                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-rose-500 group-hover:animate-pulse transition-colors" />
                            Clear Draft
                        </button>
                    </div>
                )}
            </div>

            {/* Right Col: Form Card */}
            <div className="flex-1 flex flex-col min-w-0 lg:justify-center lg:py-10 p-3 md:p-0">
                <div className="flex-1 lg:flex-none bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-2xl md:rounded-[3rem] shadow-2xl shadow-indigo-500/5 border border-white/20 dark:border-white/5 p-4 md:p-10 lg:p-14 flex flex-col z-10 relative overflow-visible mb-0">
                    {/* Decorative Background Elements tightly bounded to not cause horizontal scroll */}
                    <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col items-stretch">
                        {stage === 1 && <Stage1Identity />}
                        {stage === 2 && <Stage2StayDetails />}
                        {stage === 3 && <Stage3Review />}
                    </div>
                </div>
            </div>
        </div>
    );
}
