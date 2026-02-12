"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpcomingBookingsWidgetProps } from '@lib/types';

export function UpcomingBookingsWidget({ bookings, loading }: UpcomingBookingsWidgetProps) {
    const router = useRouter();

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-700/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Upcoming Arrivals</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        {loading ? 'Loading...' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} coming up`}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/guests')}
                    className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:gap-2 transition-all"
                >
                    View All
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                                <div className="w-12 h-12 bg-slate-600 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-600 rounded w-1/3" />
                                    <div className="h-3 bg-slate-600 rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-2">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 font-medium">No upcoming bookings</p>
                    <p className="text-sm text-slate-500 mt-1">New arrivals will appear here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="group p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-700/30 transition-all cursor-pointer"
                            onClick={() => router.push(`/greeter?guestId=${booking.id}`)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {booking.guestName.charAt(0).toUpperCase()}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-white mb-1 truncate">
                                        {booking.guestName}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            <span className="truncate">{booking.propName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{format(parseISO(booking.checkInDate), 'MMM dd')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-white">₹{booking.totalAmount?.toLocaleString('en-IN') || 0}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {booking.checkOutDate && Math.ceil((parseISO(booking.checkOutDate).getTime() - parseISO(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
