"use client";

import React from 'react';
import { Check, User, Home, BadgeCheck, Loader2 } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
}

const steps: Step[] = [
    {
        id: 1,
        title: "Guest Identity",
        description: "Name & Contact",
        icon: User
    },
    {
        id: 2,
        title: "Stay Details",
        description: "Property & Dates",
        icon: Home
    },
    {
        id: 3,
        title: "Final Review",
        description: "Payment & Save",
        icon: BadgeCheck
    }
];

interface WizardStepperProps {
    currentStage: number;
}

export function WizardStepper({ currentStage }: WizardStepperProps) {
    const currentStep = steps.find(s => s.id === currentStage) || steps[0];
    const progress = (currentStage / steps.length) * 100;

    return (
        <div className="w-full">
            {/* Mobile UI: Ultra-Thin Progress Bar (No titles, redundant with header) */}
            <div className="lg:hidden w-full px-2">
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 transition-all duration-[1000ms] ease-out shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Desktop UI: Vertical High-Fidelity side-stepper */}
            <div className="hidden lg:flex flex-col relative py-4">
                {/* Vertical Background Line */}
                <div className="absolute left-[27px] top-8 bottom-8 w-0.5 z-0">
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="w-full bg-gradient-to-b from-emerald-500 via-indigo-500 to-indigo-600 transition-all duration-700 ease-in-out"
                            style={{
                                height: currentStage === 1 ? '0%' : currentStage === 2 ? '50%' : '100%'
                            }}
                        />
                    </div>
                </div>

                {/* Steps Mapping */}
                <div className="space-y-12">
                    {steps.map((step) => {
                        const isCompleted = currentStage > step.id;
                        const isActive = currentStage === step.id;
                        const StepIcon = step.icon;

                        return (
                            <div key={step.id} className="relative z-10 flex items-center group">
                                {/* Indicator Circle */}
                                <div className={`
                                    relative flex items-center justify-center 
                                    w-14 h-14 rounded-full 
                                    transition-all duration-500 shrink-0
                                    ${isCompleted
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : isActive
                                            ? 'bg-white dark:bg-slate-900 border-2 border-indigo-500 text-indigo-500 shadow-xl shadow-indigo-500/10 scale-110'
                                            : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-600'
                                    }
                                `}>
                                    {isCompleted ? (
                                        <Check size={24} strokeWidth={3} />
                                    ) : (
                                        <StepIcon size={24} className={isActive ? 'animate-pulse' : ''} strokeWidth={2.5} />
                                    )}

                                    {isActive && (
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping pointer-events-none" />
                                    )}
                                </div>

                                {/* Label Content */}
                                <div className="ml-5 flex flex-col">
                                    <span className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 transition-colors duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                        Step {step.id}
                                    </span>
                                    <span className={`text-[15px] font-bold tracking-tight leading-none mb-2 whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {step.title}
                                    </span>

                                    <div className={`
                                        px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter w-fit
                                        ${isCompleted
                                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                            : isActive
                                                ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 opacity-60'
                                        }
                                    `}>
                                        {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
