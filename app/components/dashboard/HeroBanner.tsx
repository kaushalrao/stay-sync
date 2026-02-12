"use client";

import React from 'react';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { HeroBannerProps } from '@/app/lib/types';
import { useRouter } from 'next/navigation';

export function HeroBanner({ userName, bookingsToday = 0, upcomingCount = 0 }: HeroBannerProps) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };
    const router = useRouter();

    const firstName = userName?.split(' ')[0] || 'Host';
    const getEmoji = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '☀️';
        if (hour < 18) return '👋';
        return '🌙';
    };

    return (
        <div className="relative group">
            {/* Gradient border effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 group-hover:opacity-50 blur-sm transition-all duration-500" />

            {/* Main card */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 lg:p-8 xl:p-10 shadow-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                {/* Floating sparkles - hidden on mobile */}
                <div className="hidden md:block absolute top-8 right-20 animate-pulse">
                    <Sparkles className="text-yellow-400/30" size={20} />
                </div>
                <div className="hidden md:block absolute bottom-12 right-32 animate-pulse delay-300">
                    <Sparkles className="text-pink-400/30" size={16} />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-8">
                    {/* Text Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <div className="text-3xl md:text-4xl lg:text-5xl">{getEmoji()}</div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
                                {getGreeting()}, {firstName}
                            </h2>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base lg:text-lg mb-4 md:mb-6 max-w-2xl leading-relaxed">
                            {upcomingCount > 0 ? (
                                <>
                                    You have <span className="font-bold text-indigo-600 dark:text-indigo-400">{upcomingCount}</span> upcoming booking{upcomingCount > 1 ? 's' : ''}. Let&apos;s make them memorable! ✨
                                </>
                            ) : (
                                "Your properties are all set. Ready for new bookings! 🚀"
                            )}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <button
                                onClick={() => router.push('/guests')}
                                className="group/btn inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 lg:px-6 py-2.5 md:py-3 lg:py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg md:rounded-xl font-semibold text-white text-sm md:text-base transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
                            >
                                View Calendar
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>

                            {upcomingCount > 0 && (
                                <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-lg md:rounded-xl backdrop-blur-sm">
                                    <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={16} />
                                    <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <span className="text-emerald-600 dark:text-emerald-400">{upcomingCount}</span> Active
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Illustration - Premium version - hidden on mobile and tablet */}
                    <div className="hidden xl:block relative">
                        <div className="relative w-48 h-48">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" />

                            {/* Main circle */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    {/* Center icon container */}
                                    <div className="w-32 h-32 bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-3xl backdrop-blur-sm flex items-center justify-center border border-slate-600/50 shadow-2xl">
                                        <div className="text-6xl">💼</div>
                                    </div>

                                    {/* Floating elements with premium styling */}
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl animate-bounce shadow-lg shadow-yellow-500/50 flex items-center justify-center">
                                        <Sparkles className="text-white" size={20} />
                                    </div>
                                    <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl animate-pulse shadow-lg shadow-emerald-500/50 flex items-center justify-center">
                                        <TrendingUp className="text-white" size={18} />
                                    </div>
                                    <div className="absolute top-1/2 -right-6 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl animate-ping opacity-75" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
