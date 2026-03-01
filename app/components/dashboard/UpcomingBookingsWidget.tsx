"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpcomingBookingsWidgetProps } from '@lib/types';

export function UpcomingBookingsWidget({ bookings, loading }: UpcomingBookingsWidgetProps) {
    const router = useRouter();

    // Filter out bookings with 'pending' status
    const activeBookings = bookings.filter(b => b.status !== 'pending');

    return (
        <div className="relative group">
            {/* Gradient border effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 group-hover:opacity-40 blur-sm transition-all duration-500" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between mb-4 md:mb-6 lg:mb-8 gap-2">
                    <div className="flex items-start gap-2 md:gap-3 lg:gap-4">
                        <div className="p-2 md:p-2.5 lg:p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl md:rounded-2xl border border-indigo-500/20 backdrop-blur-sm flex-shrink-0">
                            <Calendar className="text-indigo-400" size={20} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-0.5 md:mb-1 tracking-tight">
                                Upcoming Arrivals
                            </h3>
                            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5 md:gap-2">
                                {loading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                                        Loading...
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeBookings.length}</span>
                                        <span>booking{activeBookings.length !== 1 ? 's' : ''} coming up</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/guests')}
                        className="group/btn flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200 transition-all duration-300 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 flex-shrink-0"
                    >
                        View All
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Bookings List */}
                <div className="relative z-10">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex items-center gap-3 md:gap-4 lg:gap-5 p-3 md:p-4 lg:p-5 bg-slate-100 dark:bg-slate-800/40 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700/30">
                                        <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 rounded-xl md:rounded-2xl flex-shrink-0" />
                                        <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                                            <div className="h-3 md:h-4 bg-slate-300 dark:bg-slate-700 rounded-lg w-1/2 md:w-1/3" />
                                            <div className="h-2 md:h-3 bg-slate-300/70 dark:bg-slate-700/70 rounded-lg w-2/3 md:w-1/2" />
                                        </div>
                                        <div className="space-y-1.5 md:space-y-2 flex-shrink-0">
                                            <div className="h-4 md:h-5 bg-slate-300 dark:bg-slate-700 rounded-lg w-16 md:w-20" />
                                            <div className="h-2 md:h-3 bg-slate-300/70 dark:bg-slate-700/70 rounded-lg w-12 md:w-16" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activeBookings.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="relative inline-flex items-center justify-center mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center border border-slate-600/50">
                                    <Calendar className="text-slate-500" size={36} />
                                </div>
                            </div>
                            <p className="text-slate-300 font-semibold text-lg mb-2">No upcoming bookings</p>
                            <p className="text-sm text-slate-500">New arrivals will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeBookings.map((booking, index) => (
                                <div
                                    key={booking.id}
                                    className="group/card relative cursor-pointer"
                                    onClick={() => router.push(`/greeter?guestId=${booking.id}`)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Card hover glow */}
                                    <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover/card:from-indigo-500/30 group-hover/card:via-purple-500/30 group-hover/card:to-pink-500/30 rounded-2xl opacity-0 group-hover/card:opacity-100 blur-sm transition-all duration-500" />

                                    {/* Card content */}
                                    <div className="relative flex items-center gap-3 md:gap-4 lg:gap-5 p-3 md:p-4 lg:p-5 bg-slate-100 dark:bg-slate-800/40 group-hover/card:bg-slate-200 dark:group-hover/card:bg-slate-800/60 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700/30 group-hover/card:border-slate-300 dark:group-hover/card:border-slate-600/50 transition-all duration-300 backdrop-blur-sm">
                                        {/* Avatar with gradient */}
                                        <div className="relative flex-shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl blur-md opacity-50 group-hover/card:opacity-75 transition-opacity" />
                                            <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-base md:text-lg lg:text-xl shadow-lg">
                                                {booking.guestName.charAt(0).toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1 md:mb-1.5 lg:mb-2 truncate text-sm md:text-base lg:text-lg group-hover/card:text-slate-800 dark:group-hover/card:text-indigo-100 transition-colors">
                                                {booking.guestName}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm">
                                                <div className="flex items-center gap-1 md:gap-1.5 text-slate-600 dark:text-slate-400 group-hover/card:text-slate-700 dark:group-hover/card:text-slate-300 transition-colors max-w-[120px] md:max-w-none">
                                                    <MapPin size={12} className="text-indigo-400/70 flex-shrink-0" />
                                                    <span className="truncate font-medium">{booking.propName}</span>
                                                </div>
                                                <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md md:rounded-lg text-indigo-600 dark:text-indigo-300 font-semibold flex-shrink-0">
                                                    <Calendar size={12} />
                                                    <span className="text-xs md:text-sm">{format(parseISO(booking.checkInDate), 'MMM dd')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount with premium styling */}
                                        <div className="text-right flex-shrink-0">
                                            <div className="flex items-center gap-1 md:gap-1.5 mb-0.5 md:mb-1 justify-end">
                                                <Sparkles size={12} className="text-yellow-400/70 hidden md:block" />
                                                <p className="font-bold text-sm md:text-base lg:text-xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                                    ₹{booking.totalAmount?.toLocaleString('en-IN') || 0}
                                                </p>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-500 font-medium">
                                                {booking.checkOutDate && Math.ceil((parseISO(booking.checkOutDate).getTime() - parseISO(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                                            </p>
                                        </div>

                                        {/* Hover arrow indicator - hidden on mobile */}
                                        <ArrowRight
                                            size={20}
                                            className="hidden md:block text-slate-400 dark:text-slate-600 group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 opacity-0 group-hover/card:opacity-100 -translate-x-2 group-hover/card:translate-x-0 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
