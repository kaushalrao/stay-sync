import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import { GuestArrivalEmail } from '../emails/GuestArrivalEmail';
import { GuestCheckoutEmail } from '../emails/GuestCheckoutEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'StaySync <notifications@staysync.app>'; // Unified sender

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
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        return null;
    }

    try {
        const emailHtml = await render(component);

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: emailHtml,
        });

        if (error) {
            console.error('Resend Error:', error);
            throw error;
        }

        console.log(`Email sent successfully to ${to}`);
        return data;
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
