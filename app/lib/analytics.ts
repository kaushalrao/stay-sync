import { Guest, Property, DashboardStats, RevenueData } from './types';
import { getMonth, parseISO, isSameYear, differenceInDays } from 'date-fns';

export const calculateDashboardMetrics = (
    guests: Guest[],
    properties: Property[],
    selectedProperty: string,
    selectedYear: number
) => {
    // 1. Filter by Property
    const filteredByProp = selectedProperty === 'all'
        ? guests
        : guests.filter(g => {
            const prop = properties.find(p => p.id === selectedProperty);
            return prop && g.propName === prop.name;
        });

    // 2. Filter by Year (for specific stats)
    const filteredByYear = filteredByProp.filter(g => {
        if (!g.checkInDate) return false;
        return isSameYear(parseISO(g.checkInDate), new Date(selectedYear, 0, 1));
    });

    // 3. Calculate Stats
    let totalRevenue = 0;
    let totalBookings = 0;
    let totalNights = 0;

    filteredByYear.forEach(g => {
        const amount = g.totalAmount || 0;
        totalRevenue += amount;
        totalBookings += 1; // Count bookings

        if (g.checkInDate && g.checkOutDate) {
            const nights = differenceInDays(parseISO(g.checkOutDate), parseISO(g.checkInDate));
            totalNights += Math.max(1, nights);
        }
    });

    const avgNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0;
    const numProps = selectedProperty === 'all' ? (properties.length || 1) : 1;
    const occupancyRate = Math.min(100, Math.round((totalNights / (365 * numProps)) * 100));

    // 4. Monthly Revenue
    const monthlyRevenue = Array(12).fill(0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    filteredByYear.forEach(g => {
        if (g.checkInDate) {
            const monthIdx = getMonth(parseISO(g.checkInDate));
            monthlyRevenue[monthIdx] += (g.totalAmount || 0);
        }
    });

    const chartData: RevenueData[] = months.map((m, i) => ({
        month: m,
        revenue: monthlyRevenue[i]
    }));

    // 5. Active/Upcoming Guests
    const upcomingGuests = filteredByProp.filter(g => {
        return g.status === 'upcoming' || g.status === 'active';
    }).sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
        .slice(0, 10);

    return {
        stats: {
            totalRevenue,
            totalBookings,
            occupancyRate,
            avgNightlyRate,
            activeStays: 0
        },
        chartData,
        upcomingGuests
    };
};
