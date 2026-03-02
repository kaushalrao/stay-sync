"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, ArrowRight, Sparkles, MessageSquare, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpcomingBookingsWidgetProps } from '@lib/types';

export function UpcomingBookingsWidget({ bookings, loading }: UpcomingBookingsWidgetProps) {
    const router = useRouter();

    // Limit to 4 for card density, keeping the view clean
    const activeBookings = bookings.slice(0, 4);

    return (
        <div className="relative group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[32px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Main Container */}
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[32px] p-5 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/5 overflow-hidden">

                {/* Decorative Accents */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Calendar className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Arrivals <span className="text-indigo-600 dark:text-indigo-400">expected</span>
                            </h3>
                            <p className="text-[11px] md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                {loading ? 'Fetching bookings...' : `${activeBookings.length} this week`}
                                {!loading && activeBookings.some(b => {
                                    const diff = parseISO(b.checkInDate).getTime() - new Date().getTime();
                                    return diff > 0 && diff < 86400000;
                                }) && (
                                        <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                                            <Clock size={10} /> Live
                                        </span>
                                    )}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/guests')}
                        className="group/btn flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5 active:scale-95"
                    >
                        Manage All
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* List Body */}
                <div className="relative z-10 space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-800" />
                            ))}
                        </div>
                    ) : activeBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                <Sparkles className="text-slate-300 dark:text-slate-600" size={32} />
                            </div>
                            <p className="text-slate-900 dark:text-white font-semibold text-lg">Your calendar is clear</p>
                            <p className="text-slate-500 text-sm">New arrivals will show up here.</p>
                        </div>
                    ) : (activeBookings.map((booking, index) => {
                        const nights = booking.checkOutDate ? Math.ceil((parseISO(booking.checkOutDate).getTime() - parseISO(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                        return (
                            <div
                                key={booking.id}
                                onClick={() => router.push(`/greeter?guestId=${booking.id}`)}
                                style={{ animationDelay: `${index * 100}ms` }}
                                className="group/card relative cursor-pointer animate-slide-up"
                            >
                                {/* Stabilized Inner Wrapper: decoupled transform for hit-area stability */}
                                <div className="transform transition-all duration-300 group-hover/card:-translate-y-1 group-active/card:scale-[0.99]">
                                    {/* Desktop Grid (Hidden on Mobile) */}
                                    <div className="hidden md:grid grid-cols-12 items-center gap-4 p-5 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-white/5 transition-colors shadow-sm hover:shadow-xl group-hover/card:border-indigo-500/30">

                                        {/* 1-4: Guest Profile */}
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-0 group-hover/card:opacity-20 transition-opacity" />
                                                <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
                                                    <span className="text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                                                        {booking.guestName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-slate-900 dark:text-white font-bold truncate text-lg">
                                                    {booking.guestName}
                                                </p>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                    Booked
                                                </span>
                                            </div>
                                        </div>

                                        {/* 5-8: Stay Context */}
                                        <div className="col-span-4 space-y-1">
                                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                <MapPin size={14} fill="currentColor" fillOpacity={0.1} />
                                                <span className="text-sm font-bold truncate">{booking.propName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                                <Calendar size={14} className="opacity-50" />
                                                <span>{format(parseISO(booking.checkInDate), 'MMM dd')} — {booking.checkOutDate ? format(parseISO(booking.checkOutDate), 'MMM dd') : '?'}</span>
                                            </div>
                                        </div>

                                        {/* 9-11: Revenue */}
                                        <div className="col-span-3 text-right">
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                ₹{booking.totalAmount?.toLocaleString('en-IN') || 0}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">
                                                Stay: {nights} nights
                                            </p>
                                        </div>

                                        {/* 12: Action Reveal */}
                                        <div className="col-span-1 flex justify-end">
                                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white opacity-0 group-hover/card:opacity-100 transform translate-x-2 group-hover/card:translate-x-0 transition-all duration-300 shadow-lg shadow-indigo-500/20">
                                                <MessageSquare size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Cluster (Hidden on Desktop) */}
                                    <div className="md:hidden flex flex-col gap-3 p-4 bg-white dark:bg-slate-800/40 rounded-[24px] border border-slate-200 dark:border-white/10 active:bg-slate-100 dark:active:bg-slate-800 transition-colors shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{booking.guestName.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">{booking.guestName}</p>
                                                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                                                        <Clock size={10} /> {nights} nights
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-base font-bold text-slate-900 dark:text-white">₹{booking.totalAmount?.toLocaleString('en-IN') || 0}</p>
                                                <div className="w-8 h-8 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-500/20">
                                                    <MessageSquare size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <MapPin size={12} className="text-indigo-500 shrink-0" />
                                                <span className="text-xs font-semibold text-slate-800 dark:text-indigo-300 truncate">{booking.propName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 pl-2 ml-2 border-l border-indigo-200 dark:border-indigo-500/20">
                                                <Calendar size={12} className="text-indigo-500" />
                                                <span className="text-xs font-bold text-slate-800 dark:text-indigo-300">{format(parseISO(booking.checkInDate), 'MMM dd')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }))}
                </div>

                {/* Bottom Stats Insight */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between opacity-60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Peak Arrival Window: <span className="text-indigo-600 dark:text-indigo-400 font-bold">14:00 - 16:00</span>
                    </p>
                    <div className="flex -space-x-2">
                        {bookings.slice(0, 3).map((b, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-semibold">
                                {b.guestName.charAt(0)}
                            </div>
                        ))}
                        {bookings.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 flex items-center justify-center text-white text-[8px] font-semibold">
                                +{bookings.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
