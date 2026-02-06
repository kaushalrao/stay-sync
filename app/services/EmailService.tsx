import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import { GuestArrivalEmail } from '../emails/GuestArrivalEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'StaySync <notifications@resend.dev>'; // Or your verified domain

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
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not set. Skipping email sending.');
            return;
        }

        try {
            const emailHtml = await render(<GuestArrivalEmail
                guestName={guestName}
                propName={propName}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                numberOfGuests={numberOfGuests}
                dashboardLink={dashboardLink}
            />);

            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: toEmail,
                subject: `Upcoming Guest Arrival: ${guestName} at ${propName}`,
                html: emailHtml,
            });

            if (error) {
                console.error('Error sending email:', error);
                throw error;
            }

            console.log('Email sent successfully:', data);
            return data;
        } catch (error) {
            console.error('Failed to send guest arrival email', error);
            throw error;
        }
    },
};
