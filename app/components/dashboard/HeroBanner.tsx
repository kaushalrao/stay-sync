"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
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

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 shadow-xl">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Text Content */}
                <div className="flex-1">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        {getGreeting()} {firstName} 👋
                    </h2>
                    <p className="text-indigo-100 text-base lg:text-lg mb-6">
                        {upcomingCount > 0
                            ? `You have ${upcomingCount} upcoming booking${upcomingCount > 1 ? 's' : ''}. Let's make them memorable!`
                            : "Your properties are all set. Ready for new bookings!"
                        }
                    </p>
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:scale-105" onClick={() => router.push('/guests')}>
                        View Calendar
                        <ArrowRight size={18} />
                    </button>
                </div>

                {/* Illustration */}
                <div className="hidden lg:block relative">
                    <div className="w-48 h-48 relative">
                        {/* Simple illustration using CSS */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                {/* Person sitting */}
                                <div className="w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                                    <div className="text-6xl">💼</div>
                                </div>
                                {/* Floating elements */}
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full animate-bounce" />
                                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-green-400 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
