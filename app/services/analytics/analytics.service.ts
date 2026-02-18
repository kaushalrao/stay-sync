import { Guest, Property } from '@/app/lib/types';
import { calculateDashboardMetrics, getCurrentMonthStats, getUpcomingBookings, getRevenueSparkline } from '@/app/lib/analytics';

export class AnalyticsService {
    calculateDashboardMetrics(guests: Guest[], properties: Property[], selectedProperty: string, selectedYear: number) {
        return calculateDashboardMetrics(guests, properties, selectedProperty, selectedYear);
    }

    getCurrentMonthStats(guests: Guest[], properties: Property[], selectedProperty: string) {
        return getCurrentMonthStats(guests, properties, selectedProperty);
    }

    getUpcomingBookings(guests: Guest[], properties: Property[], selectedProperty: string, limit: number = 5) {
        return getUpcomingBookings(guests, properties, selectedProperty, limit);
    }

    getRevenueSparkline(guests: Guest[], properties: Property[], selectedProperty: string) {
        return getRevenueSparkline(guests, properties, selectedProperty);
    }
}

export const analyticsService = new AnalyticsService();
