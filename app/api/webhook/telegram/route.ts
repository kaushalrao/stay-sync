import { NextRequest, NextResponse } from 'next/server';
import { getRevenueReportForChat, getUpcomingBookingsForChat } from '@/app/lib/telegram-helpers';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: number | string, text: string) {
    if (!TELEGRAM_BOT_TOKEN) return;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text }),
        });
    } catch (e) {
        console.error("Failed to send message", e);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const msg = body.message || body.my_chat_member;

        if (msg) {
            const chatId = msg.chat.id;
            let text = msg.text || '';

            // Handle commands
            if (text.startsWith('/setup') || body.my_chat_member) {
                const title = msg.chat.title || 'this chat';
                await sendTelegramMessage(chatId, `✅ Setup Helper\n\nTo connect this group ("${title}") to a property:\n\n1. Copy this ID: \`${chatId}\`\n2. Open Guest Greeter App > Settings.\n3. Edit the Property.\n4. Paste this ID into the "Telegram Chat ID" field.`);
            } else if (text.startsWith('/revenue')) {
                await sendTelegramMessage(chatId, "⏳ Calculation in progress...");
                const report = await getRevenueReportForChat(chatId);
                await sendTelegramMessage(chatId, report);
            } else if (text.startsWith('/booking')) {
                await sendTelegramMessage(chatId, "⏳ Fetching bookings...");
                const bookings = await getUpcomingBookingsForChat(chatId);
                await sendTelegramMessage(chatId, bookings);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Telegram Webhook Error:', error);
        return NextResponse.json({ ok: true });
    }
}
