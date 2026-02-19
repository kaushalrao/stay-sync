"use client";

import React, { useMemo, useEffect } from 'react';
import { useApp } from '@components/providers/AppProvider';
import { IndianRupee, Calendar, TrendingUp, Users } from 'lucide-react';
import { UpcomingBookingsWidget } from './UpcomingBookingsWidget';
import { HeroBanner } from './HeroBanner';
import { QuickActionCards } from './QuickActionCards';
import { useGuestStore, usePropertyStore } from '@store/index';
import { analyticsService, widgetService } from '@services/index';

export function DashboardHome() {
    const { user } = useApp();
    const properties = usePropertyStore(state => state.properties);
    const guests = useGuestStore(state => state.guests);
    const upcomingBookings = useGuestStore(state => state.upcomingGuests);
    const isGuestsLoading = useGuestStore(state => state.isGuestsLoading);
    const isUpcomingLoading = useGuestStore(state => state.isUpcomingGuestsLoading);
    const fetchUpcomingGuests = useGuestStore(state => state.fetchUpcomingGuests);
    const selectedProperty = 'all'; // Home page always shows all properties

    const { monthStats } = useMemo(() => {
        return {
            monthStats: analyticsService.getCurrentMonthStats(guests, properties, selectedProperty),
        };
    }, [guests, properties]); // Removed selectedProperty from deps as it's now constant 'all'

    // Fetch upcoming guests on mount
    useEffect(() => {
        if (user && fetchUpcomingGuests) {
            fetchUpcomingGuests(user.uid);
        }
    }, [user, fetchUpcomingGuests]);

    // Sync to Android Widget
    useEffect(() => {
        if (upcomingBookings.length > 0) {
            const guest = upcomingBookings[0];
            // Find property for time details
            const statsProperty = properties.find(p => p.name === guest.propName);
            widgetService.updateWidgetData(guest, statsProperty);
        } else {
            widgetService.updateWidgetData(null);
        }
    }, [upcomingBookings, properties]);

    const statCards = [
        {
            label: 'Monthly Revenue',
            value: isGuestsLoading ? '...' : `₹${monthStats.totalRevenue.toLocaleString('en-IN')}`,
            icon: IndianRupee,
            gradient: 'from-emerald-400 to-green-500',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            label: 'Total Bookings',
            value: isGuestsLoading ? '...' : monthStats.totalBookings,
            icon: Calendar,
            gradient: 'from-blue-400 to-indigo-500',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Avg Nightly Rate',
            value: isGuestsLoading ? '...' : `₹${Math.round(monthStats.avgNightlyRate).toLocaleString('en-IN')}`,
            icon: TrendingUp,
            gradient: 'from-purple-400 to-pink-500',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            label: 'Total Guests',
            value: isGuestsLoading ? '...' : monthStats.totalGuests || 0,
            icon: Users,
            gradient: 'from-orange-400 to-rose-500',
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600'
        }
    ];

    return (
        <div className="w-full px-4 md:px-6 py-6 space-y-6">
            {/* Hero Banner */}
            <HeroBanner
                userName={user?.displayName || 'Host'}
                upcomingCount={upcomingBookings.length}
            />

            {/* Quick Action Cards */}
            <QuickActionCards />

            {/* Upcoming Bookings */}
            <UpcomingBookingsWidget bookings={upcomingBookings} loading={isUpcomingLoading} />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="group relative bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-200/80 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:scale-105 overflow-hidden">
                        {/* Gradient background overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`} />

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.iconBg} dark:bg-slate-700/50 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                    <stat.icon className={`${stat.iconColor} dark:text-slate-300 group-hover:rotate-12 transition-transform duration-300`} size={24} />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{stat.label}</p>
                            <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">{stat.value}</p>
                        </div>

                        {/* Subtle shine effect */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent dark:from-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                ))}
            </div>
        </div>
    );
}
