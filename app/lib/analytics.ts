import { Guest, Property, RevenueData } from './types';
import { getMonth, parseISO, isSameYear, differenceInDays } from 'date-fns';

// Helper to check if guest stay is valid (not expired)
export const isGuestStayValid = (g: Guest, properties: Property[]) => {
    // 1. Status Check
    if (g.status !== 'active' && g.status !== 'upcoming') return false;

    // 2. Checkout Date Check
    if (!g.checkOutDate) return true;

    // 3. Time Check
    const now = new Date();
    const property = properties.find(p => p.name === g.propName);
    const checkOutTime = property?.checkOutTime || '11:00';

    const [year, month, day] = g.checkOutDate.split('-').map(Number);
    const [hours, minutes] = checkOutTime.split(':').map(Number);

    const checkOutDateTime = new Date(year, month - 1, day, hours, minutes);

    const isValid = now <= checkOutDateTime;

    if (g.guestName.toLowerCase().includes('akshay') || !isValid) {
        console.log(`Checking validity for ${g.guestName}:`, {
            status: g.status,
            checkOutDate: g.checkOutDate,
            checkOutTime,
            checkOutDateTime: checkOutDateTime.toLocaleString(),
            now: now.toLocaleString(),
            isValid
        });
    }

    return isValid;
};

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
    const upcomingGuests = filteredByProp
        .filter(g => isGuestStayValid(g, properties))
        .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
        .slice(0, 10);

    const activeStays = filteredByProp.filter(g => g.status === 'active' && isGuestStayValid(g, properties)).length;

    return {
        stats: {
            totalRevenue,
            totalBookings,
            occupancyRate,
            avgNightlyRate,
            activeStays
        },
        chartData,
        upcomingGuests
    };
};

// Get current month statistics
export const getCurrentMonthStats = (
    guests: Guest[],
    properties: Property[],
    selectedProperty: string = 'all'
) => {
    // Safety check
    if (!guests || guests.length === 0) {
        return {
            totalRevenue: 0,
            totalBookings: 0,
            avgNightlyRate: 0,
        };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filteredByProp = selectedProperty === 'all'
        ? guests
        : guests.filter(g => {
            const prop = properties.find(p => p.id === selectedProperty);
            return prop && g.propName === prop.name;
        });

    const currentMonthGuests = filteredByProp.filter(g => {
        if (!g.checkInDate) return false;
        const checkIn = parseISO(g.checkInDate);
        return getMonth(checkIn) === currentMonth && isSameYear(checkIn, now);
    });

    let totalRevenue = 0;
    let totalNights = 0;

    currentMonthGuests.forEach(g => {
        totalRevenue += g.totalAmount || 0;
        if (g.checkInDate && g.checkOutDate) {
            const nights = differenceInDays(parseISO(g.checkOutDate), parseISO(g.checkInDate));
            totalNights += Math.max(1, nights);
        }
    });

    return {
        totalRevenue,
        totalBookings: currentMonthGuests.length,
        avgNightlyRate: totalNights > 0 ? totalRevenue / totalNights : 0,
        totalGuests: currentMonthGuests.length,
    };
};

// Get upcoming bookings (next 5)
export const getUpcomingBookings = (
    guests: Guest[],
    properties: Property[],
    selectedProperty: string = 'all',
    limit: number = 5
) => {
    // Safety check
    if (!guests || guests.length === 0) {
        return [];
    }

    const filteredByProp = selectedProperty === 'all'
        ? guests
        : guests.filter(g => {
            const prop = properties.find(p => p.id === selectedProperty);
            return prop && g.propName === prop.name;
        });

    return filteredByProp
        .filter(g => isGuestStayValid(g, properties))
        .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
        .slice(0, limit);
};

// Get revenue sparkline data (last 6 months)
export const getRevenueSparkline = (
    guests: Guest[],
    properties: Property[],
    selectedProperty: string
) => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sparklineData = [];

    // Safety check
    if (!guests || guests.length === 0) {
        // Return empty data for last 6 months
        for (let i = 5; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthIdx = targetDate.getMonth();
            const year = targetDate.getFullYear();
            sparklineData.push({
                month: months[monthIdx],
                revenue: 0,
                isCurrent: monthIdx === now.getMonth() && year === now.getFullYear()
            });
        }
        return sparklineData;
    }

    const filteredByProp = selectedProperty === 'all'
        ? guests
        : guests.filter(g => {
            const prop = properties.find(p => p.id === selectedProperty);
            return prop && g.propName === prop.name;
        });

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthIdx = targetDate.getMonth();
        const year = targetDate.getFullYear();

        const monthRevenue = filteredByProp
            .filter(g => {
                if (!g.checkInDate) return false;
                const checkIn = parseISO(g.checkInDate);
                return getMonth(checkIn) === monthIdx && isSameYear(checkIn, targetDate);
            })
            .reduce((sum, g) => sum + (g.totalAmount || 0), 0);

        sparklineData.push({
            month: months[monthIdx],
            revenue: monthRevenue,
            isCurrent: monthIdx === now.getMonth() && year === now.getFullYear()
        });
    }

    return sparklineData;
};
