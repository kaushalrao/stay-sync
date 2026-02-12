"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '@components/providers/AppProvider';
import { dataService } from '@/app/services';
import { Guest } from '@lib/types';
import { getCurrentMonthStats, getUpcomingBookings } from '@lib/analytics';
import { IndianRupee, Calendar, TrendingUp, Users } from 'lucide-react';
import { UpcomingBookingsWidget } from './UpcomingBookingsWidget';
import { HeroBanner } from './HeroBanner';
import { QuickActionCards } from './QuickActionCards';

export function DashboardHome() {
    const { properties, user } = useApp();
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loadingGuests, setLoadingGuests] = useState(true);
    const selectedProperty = 'all';

    // Fetch guests data
    useEffect(() => {
        if (!user) return;
        const unsubscribe = dataService.guests.subscribe(user.uid, (data: Guest[]) => {
            setGuests(data);
            setLoadingGuests(false);
        }, (err: any) => {
            console.error(err);
            setLoadingGuests(false);
        });
        return () => unsubscribe();
    }, [user]);

    const { monthStats, upcomingBookings } = useMemo(() => {
        return {
            monthStats: getCurrentMonthStats(guests, properties, selectedProperty),
            upcomingBookings: getUpcomingBookings(guests, properties, selectedProperty, 5),
        };
    }, [guests, properties]);

    const statCards = [
        {
            label: 'Monthly Revenue',
            value: loadingGuests ? '...' : `₹${monthStats.totalRevenue.toLocaleString('en-IN')}`,
            icon: IndianRupee,
            gradient: 'from-emerald-400 to-green-500',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            label: 'Total Bookings',
            value: loadingGuests ? '...' : monthStats.totalBookings,
            icon: Calendar,
            gradient: 'from-blue-400 to-indigo-500',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Avg Nightly Rate',
            value: loadingGuests ? '...' : `₹${Math.round(monthStats.avgNightlyRate).toLocaleString('en-IN')}`,
            icon: TrendingUp,
            gradient: 'from-purple-400 to-pink-500',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            label: 'Total Guests',
            value: loadingGuests ? '...' : monthStats.totalGuests || 0,
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
            <UpcomingBookingsWidget bookings={upcomingBookings} loading={loadingGuests} />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-slate-700/50 hover:shadow-xl transition-all hover:scale-105"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-slate-700/50 ${stat.iconBg}`}>
                                    <Icon className={stat.iconColor} size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
