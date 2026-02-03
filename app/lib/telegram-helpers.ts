import { db } from '@/app/lib/firebase';
import { collectionGroup, query, where, getDocs, collection } from 'firebase/firestore';
import { subMonths, startOfMonth, endOfMonth, format, addDays } from 'date-fns';

export async function getRevenueReportForChat(chatId: number | string) {
    const now = new Date();
    // Default to "Current Month" as requested for /revenue
    const startObj = startOfMonth(now);
    const endObj = endOfMonth(now);
    const startStr = format(startObj, 'yyyy-MM-dd');
    const endStr = format(endObj, 'yyyy-MM-dd');
    const monthName = format(now, 'MMMM yyyy');

    // 1. Get properties for this Chat ID
    const propsQuery = query(collectionGroup(db, 'properties'), where('telegramChatId', '==', String(chatId)));
    const propsSnap = await getDocs(propsQuery);

    if (propsSnap.empty) {
        return `⚠️ No properties configured for this chat.\nUse /setup to get your Chat ID.`;
    }

    let totalRevenue = 0;
    let totalBookings = 0;
    const breakdown: string[] = [];

    for (const propDoc of propsSnap.docs) {
        const property = propDoc.data();
        const pathSegments = propDoc.ref.path.split('/');
        const appId = pathSegments[1];
        const userId = pathSegments[3];

        const guestsRef = collection(db, `artifacts/${appId}/users/${userId}/guests`);

        // OPTIMIZATION: Query by propName only to avoid Composite Index requirement.
        // We fetch all guests for this property and filter dates in memory.
        const q = query(guestsRef,
            where('propName', '==', property.name)
        );

        const guestSnap = await getDocs(q);
        let propRevenue = 0;
        let propBookings = 0;

        guestSnap.docs.forEach(doc => {
            const data = doc.data();
            // In-memory Filter: Not Cancelled AND Date within range
            if (data.status !== 'cancelled' && data.checkInDate >= startStr && data.checkInDate <= endStr) {
                propBookings += 1;
                propRevenue += (data.totalAmount || 0);
            }
        });

        if (propBookings > 0) {
            totalRevenue += propRevenue;
            totalBookings += propBookings;
            breakdown.push(`▫️ ${property.name}: $${propRevenue.toLocaleString()} (${propBookings})`);
        }
    }

    if (totalBookings === 0) {
        return `📊 *Revenue So Far (${monthName})*\nNo bookings found yet.`;
    }

    let message = `📊 *Revenue So Far (${monthName})*\n` +
        `💰 *Grand Total:* $${totalRevenue.toLocaleString()}\n` +
        `📅 *Total Bookings:* ${totalBookings}\n\n`;

    if (breakdown.length > 0) {
        message += `*Breakdown:*\n` + breakdown.join('\n');
    }

    return message;
}

export async function getUpcomingBookingsForChat(chatId: number | string) {
    const today = new Date();
    const startStr = format(today, 'yyyy-MM-dd');

    // 1. Get properties
    const propsQuery = query(collectionGroup(db, 'properties'), where('telegramChatId', '==', String(chatId)));
    const propsSnap = await getDocs(propsQuery);

    if (propsSnap.empty) {
        return `⚠️ No properties configured for this chat.`;
    }

    const allGuests: any[] = [];

    for (const propDoc of propsSnap.docs) {
        const property = propDoc.data();
        const pathSegments = propDoc.ref.path.split('/');
        const appId = pathSegments[1];
        const userId = pathSegments[3];

        const guestsRef = collection(db, `artifacts/${appId}/users/${userId}/guests`);

        // OPTIMIZATION: Query by propName only to avoid Composite Index requirement.
        const q = query(guestsRef,
            where('propName', '==', property.name)
        );

        const guestSnap = await getDocs(q);
        guestSnap.docs.forEach(doc => {
            const data = doc.data();
            // In-memory Filter: Status 'upcoming' AND Date >= Today
            if (data.status === 'upcoming' && data.checkInDate >= startStr) {
                allGuests.push(data);
            }
        });
    }

    // Sort by Date
    allGuests.sort((a, b) => a.checkInDate.localeCompare(b.checkInDate));
    const next5 = allGuests.slice(0, 5);

    if (next5.length === 0) {
        return `📅 *Upcoming Bookings*\nNo upcoming bookings found.`;
    }

    let message = `📅 *Upcoming Bookings (Next 5)*\n\n`;
    next5.forEach(g => {
        message += `👤 *${g.guestName}*\n` +
            `🏠 ${g.propName}\n` +
            `🗓️ ${g.checkInDate} (${g.numberOfGuests} pax)\n\n`;
    });

    return message;
}
