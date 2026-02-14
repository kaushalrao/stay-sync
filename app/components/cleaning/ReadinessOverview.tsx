import React, { useMemo } from 'react';
import { Wand2, RotateCcw } from 'lucide-react';
import { Button } from '@components/ui/Button';

interface ReadinessOverviewProps {
    totalTasks: number;
    completedTasks: number;
    onInitializePresets: () => void;
    onResetTasks: () => void;
}

export function ReadinessOverview({ totalTasks, completedTasks, onInitializePresets, onResetTasks }: ReadinessOverviewProps) {
    const globalProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="mb-6 md:mb-10 animate-fade-in relative overflow-hidden bg-slate-900 text-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl md:shadow-2xl">
            <div className="absolute top-0 right-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-emerald-500/20 rounded-full blur-[60px] md:blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-blue-500/20 rounded-full blur-[40px] md:blur-[60px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="text-center md:text-left w-full md:w-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Property Readiness</h2>
                    <p className="text-slate-300 text-sm md:text-base">
                        {globalProgress === 100
                            ? "Excellent! This property is fully prepared for guests."
                            : `${totalTasks - completedTasks} tasks remaining to be guest-ready.`}
                    </p>

                    <div className="flex gap-3 mt-4 justify-center md:justify-start w-full">
                        {/* Preset Button (only if no tasks) */}
                        {totalTasks === 0 && (
                            <Button onClick={onInitializePresets} variant="purple" className="rounded-xl text-xs md:text-sm py-2 px-3 md:px-4 w-full md:w-auto">
                                <Wand2 size={16} className="mr-2" /> Auto-Fill Default Tasks
                            </Button>
                        )}

                        {/* Reset Button (visible if there are completed tasks) */}
                        {completedTasks > 0 && (
                            <Button onClick={onResetTasks} variant="secondary" className="rounded-xl text-xs md:text-sm py-2 px-3 md:px-4 bg-white/10 text-white hover:bg-white/20 border-white/10 w-full md:w-auto">
                                <RotateCcw size={16} className="mr-2" /> Reset Checklist
                            </Button>
                        )}
                    </div>
                </div>

                {/* Circular Progress */}
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                            <circle
                                cx="50" cy="50" r="40"
                                stroke="currentColor" strokeWidth="8"
                                fill="transparent"
                                strokeDasharray="251.2" /* 2 * pi * 40 */
                                strokeDashoffset={251.2 - (251.2 * globalProgress) / 100}
                                className={`text-emerald-400 transition-all duration-1000 ease-out`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl md:text-3xl font-bold">{globalProgress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
