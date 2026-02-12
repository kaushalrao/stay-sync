"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@components/providers/AppProvider';
import { dataService } from '@/app/services';
import { Guest } from '@/app/lib/types';
import { DashboardHeader } from '@components/analytics/DashboardHeader';
import { StatsGrid } from '@components/analytics/StatsGrid';
import { RevenueChart } from '@components/analytics/RevenueChart';
import { RecentActivity } from '@components/analytics/RecentActivity';
import { calculateDashboardMetrics } from '@/app/lib/analytics';
import { Loader } from '@components/ui/Loader';

export default function AnalyticsPage() {
    const { user, properties, loading: appLoading } = useApp();
    const router = useRouter();

    const [guests, setGuests] = useState<Guest[]>([]);
    const [loadingGuests, setLoadingGuests] = useState(true);

    // Filters
    const [selectedProperty, setSelectedProperty] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Auth Redirect
    useEffect(() => {
        if (!appLoading && !user) {
            router.push('/auth');
        }
    }, [user, appLoading, router]);

    // Fetch Data
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

    // Aggregation Logic
    const dashboardData = useMemo(() => {
        return calculateDashboardMetrics(guests, properties, selectedProperty, selectedYear);
    }, [guests, selectedProperty, selectedYear, properties]);


    if (appLoading || !user) {
        return <Loader className="min-h-screen flex items-center justify-center text-white" iconClassName="text-orange-500" size={48} />;
    }

    return (
        <div className="animate-fade-in mx-auto w-full px-6 py-8 md:py-10 pb-24">
            {/* Header */}
            <DashboardHeader
                userName={user.displayName || 'Host'}
                properties={properties}
                selectedProperty={selectedProperty}
                onPropertyChange={setSelectedProperty}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            {/* Stats Grid */}
            <StatsGrid stats={dashboardData.stats} loading={loadingGuests} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <RevenueChart data={dashboardData.chartData} year={selectedYear} loading={loadingGuests} />
                </div>
                <div>
                    <RecentActivity upcomingGuests={dashboardData.upcomingGuests} loading={loadingGuests} />
                </div>
            </div>
        </div>
    );
}
