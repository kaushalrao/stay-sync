import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collectionGroup, query, where, getDocs, collection } from 'firebase/firestore';
import { addDays, format } from 'date-fns';

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
    // 1. Security Check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tomorrow = addDays(new Date(), 1);
        const dateStr = format(tomorrow, 'yyyy-MM-dd');

        console.log(`Running Check-in Reminders (Optimized) for: ${dateStr}`);

        // OPTIMIZATION: Instead of collectionGroup query on guests (which needs indexes),
        // we iterate properties that have configured Chat IDs.
        const propsQuery = query(collectionGroup(db, 'properties'), where('telegramChatId', '!=', ''));
        const propsSnap = await getDocs(propsQuery);

        const results = [];

        for (const propDoc of propsSnap.docs) {
            const property = propDoc.data();
            const chatId = property.telegramChatId;
            if (!chatId) continue;

            const pathSegments = propDoc.ref.path.split('/');
            const appId = pathSegments[1];
            const userId = pathSegments[3];

            // Specific Collection query for this user's guests
            const guestsRef = collection(db, `artifacts/${appId}/users/${userId}/guests`);

            // Query by propName only (Equality). Filter rest in JS.
            const guestsQuery = query(
                guestsRef,
                where('propName', '==', property.name)
            );

            const guestsSnap = await getDocs(guestsQuery);

            for (const guestDoc of guestsSnap.docs) {
                const guest = guestDoc.data();

                // In-Memory Filter: Check-in Date Match AND Status Booked
                if (guest.checkInDate === dateStr && guest.status === 'booked') {
                    const message = `🔔 *Upcoming Guest Arrival*\n\n` +
                        `👤 *Guest:* ${guest.guestName}\n` +
                        `📅 *Check-in:* ${guest.checkInDate}\n` +
                        `🏠 *Property:* ${guest.propName}\n` +
                        `👥 *Pax:* ${guest.numberOfGuests}\n` +
                        `💰 *Paid:* ${guest.advancePaid}\n\n` +
                        `Please ensure the property is ready!`;

                    await sendTelegramMessage(chatId, message);
                    results.push({ guest: guest.guestName, recipient: chatId, status: 'sent' });
                }
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });

    } catch (error) {
        console.error('Reminder Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
