import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/app/services/EmailService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            recipients,
            guestName,
            propName,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            nights,
            totalAmount,
            dashboardLink,
            status
        } = body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
        }

        // Send email to all recipients concurrently
        const emailPromises = recipients.map(to =>
            emailService.sendBookingNotification(
                to,
                guestName,
                propName,
                checkInDate,
                checkOutDate,
                numberOfGuests,
                nights,
                totalAmount,
                dashboardLink,
                status
            )
        );

        await Promise.all(emailPromises);

        return NextResponse.json({ success: true, message: `Sent notification to ${recipients.length} recipients` });

    } catch (error) {
        console.error('Failed to send booking notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
