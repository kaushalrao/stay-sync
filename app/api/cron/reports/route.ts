import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collectionGroup, query, where, getDocs, collection } from 'firebase/firestore';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { isValidBookingStatus } from '@/app/lib/utils';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;

async function sendTelegramMessage(chatId: string, text: string) {
    if (!TELEGRAM_BOT_TOKEN || !chatId) return;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text }),
        });
    } catch (e) {
        console.error("Failed to send telegram message", e);
    }
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        const lastMonthRaw = subMonths(now, 1);
        const startObj = startOfMonth(lastMonthRaw);
        const endObj = endOfMonth(lastMonthRaw);
        const startStr = format(startObj, 'yyyy-MM-dd');
        const endStr = format(endObj, 'yyyy-MM-dd');
        const monthName = format(lastMonthRaw, 'MMMM yyyy');

        console.log(`Running Monthly Report (Optimized) for: ${monthName}`);

        // 1. Get all properties with Chat IDs
        const propsQuery = query(collectionGroup(db, 'properties'), where('telegramChatId', '!=', ''));
        const propsSnap = await getDocs(propsQuery);

        const reportMap = new Map<string, {
            totalRevenue: number,
            totalBookings: number,
            breakdown: Array<{ name: string, revenue: number, bookings: number }>
        }>();

        // 2. Iterate properties
        for (const propDoc of propsSnap.docs) {
            const property = propDoc.data();
            const chatId = property.telegramChatId;
            if (!chatId) continue;

            const pathSegments = propDoc.ref.path.split('/');
            const appId = pathSegments[1];
            const userId = pathSegments[3];

            if (!reportMap.has(chatId)) {
                reportMap.set(chatId, { totalRevenue: 0, totalBookings: 0, breakdown: [] });
            }
            const report = reportMap.get(chatId)!;

            const guestsRef = collection(db, `artifacts/${appId}/users/${userId}/guests`);

            // OPTIMIZATION: Query by propName only (Equality).
            const q = query(guestsRef,
                where('propName', '==', property.name)
            );

            const guestSnap = await getDocs(q);
            let propRevenue = 0;
            let propBookings = 0;

            guestSnap.docs.forEach(doc => {
                const data = doc.data();
                // In-Memory Filter: Valid Booking AND Date Range
                if (isValidBookingStatus(data.status) && data.checkInDate >= startStr && data.checkInDate <= endStr) {
                    propBookings += 1;
                    propRevenue += (data.totalAmount || 0);
                }
            });

            if (propBookings > 0) {
                report.totalRevenue += propRevenue;
                report.totalBookings += propBookings;
                report.breakdown.push({
                    name: property.name,
                    revenue: propRevenue,
                    bookings: propBookings
                });
            }
        }

        const results = [];

        // 3. Send Aggregated Reports
        for (const [chatId, data] of reportMap.entries()) {
            if (data.totalBookings === 0) continue;

            let message = `📊 *Monthly Revenue Report*\n` +
                `🗓️ *Period:* ${monthName}\n` +
                `💰 *Grand Total:* $${data.totalRevenue.toLocaleString()}\n` +
                `📅 *Total Bookings:* ${data.totalBookings}\n\n`;

            if (data.breakdown.length > 0) {
                message += `*Breakdown:*\n`;
                data.breakdown.forEach(item => {
                    message += `▫️ ${item.name}: $${item.revenue.toLocaleString()} (${item.bookings})\n`;
                });
            }

            await sendTelegramMessage(chatId, message);
            results.push({ recipient: chatId, total: data.totalRevenue, status: 'sent' });
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });

    } catch (error) {
        console.error('Report Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
