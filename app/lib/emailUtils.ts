import { Guest, Property } from './types';
import { calculateNights, formatDate, formatCurrency } from './utils';

interface NotificationParams {
    guest: Partial<Guest> & { guestName: string; checkInDate: string; checkOutDate: string; numberOfGuests: number };
    property: Property;
    type: 'new' | 'cancelled';
    totalAmount?: string | number; // Can be pre-formatted string or number
    dashboardLink?: string;
}

export const triggerBookingNotification = async ({
    guest,
    property,
    type,
    totalAmount,
    dashboardLink
}: NotificationParams) => {
    const recipients = [];
    if (property.hostEmail) recipients.push(property.hostEmail);
    if (property.coHostEmail) recipients.push(property.coHostEmail);

    if (recipients.length === 0) return;

    const nights = calculateNights(guest.checkInDate, guest.checkOutDate);

    // Format total amount if it's a number, otherwise use as string
    const formattedTotalAmount = typeof totalAmount === 'number'
        ? formatCurrency(totalAmount)
        : (totalAmount || '');

    const checkIn = formatDate(guest.checkInDate);
    const checkOut = formatDate(guest.checkOutDate);

    // Default dashboard link if not provided
    const link = dashboardLink || `${window.location.origin}/greeter${guest.id ? `?guestId=${guest.id}` : ''}`;

    try {
        await fetch('/api/guests/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                recipients,
                guestName: guest.guestName,
                propName: property.name,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                numberOfGuests: guest.numberOfGuests,
                nights,
                totalAmount: formattedTotalAmount,
                dashboardLink: link
            })
        });
    } catch (err) {
        console.error(`Failed to trigger ${type} booking notification`, err);
    }
};
