import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import * as React from 'react';
import { GuestArrivalEmail } from '../emails/GuestArrivalEmail';
import { GuestCheckoutEmail } from '../emails/GuestCheckoutEmail';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const FROM_EMAIL = `StaySync <${process.env.GMAIL_USER}>`;

// Private helper for sending emails
async function sendEmail({
    to,
    subject,
    component,
}: {
    to: string | string[];
    subject: string;
    component: React.ReactElement;
}) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('GMAIL_USER or GMAIL_APP_PASSWORD is not set. Skipping email sending.');
        return null;
    }

    try {
        const emailHtml = await render(component);

        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: Array.isArray(to) ? to.join(',') : to,
            subject: subject,
            html: emailHtml,
        });

        console.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

export const emailService = {
    sendGuestArrivalNotification: async (
        toEmail: string,
        guestName: string,
        propName: string,
        checkInDate: string,
        checkOutDate: string,
        numberOfGuests: number,
        dashboardLink: string
    ) => {
        return sendEmail({
            to: toEmail,
            subject: `Upcoming Arrival: ${guestName} at ${propName}`,
            component: (
                <GuestArrivalEmail
                    guestName={guestName}
                    propName={propName}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    numberOfGuests={numberOfGuests}
                    dashboardLink={dashboardLink}
                />
            ),
        });
    },

    sendGuestCheckoutNotification: async (
        to: string,
        guestName: string,
        propName: string,
        checkInDate: string,
        checkOutDate: string,
        totalAmount: number,
        advancePaid: number,
        dashboardLink: string
    ) => {
        return sendEmail({
            to: to,
            subject: `Checkout Payment Reminder: ${guestName} at ${propName}`,
            component: (
                <GuestCheckoutEmail
                    guestName={guestName}
                    propName={propName}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    totalAmount={totalAmount}
                    advancePaid={advancePaid}
                    dashboardLink={dashboardLink}
                />
            ),
        });
    },
};
