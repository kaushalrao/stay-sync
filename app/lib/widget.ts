import { Preferences } from '@capacitor/preferences';
import { format, parseISO } from 'date-fns';
import { Guest } from './types';

export const WIDGET_DATA_KEY = 'widget_guest_data';

export interface WidgetData {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    property: string;
    totalAmount: number;
    advancePaid: number;
    checkInTime: string;
    checkOutTime: string;
    updatedAt: number;
}

export const updateWidgetData = async (guest: Guest | null, property?: any) => {
    try {
        if (!guest) {
            await Preferences.set({
                key: WIDGET_DATA_KEY,
                value: JSON.stringify(null)
            });
            return;
        }

        const data: WidgetData = {
            guestName: guest.guestName,
            checkInDate: guest.checkInDate ? format(parseISO(guest.checkInDate), 'MMM d') : '--',
            checkOutDate: guest.checkOutDate ? format(parseISO(guest.checkOutDate), 'MMM d') : '--',
            status: guest.status,
            property: guest.propName || 'Unknown Property',
            totalAmount: guest.totalAmount || 0,
            advancePaid: guest.advancePaid || 0,
            checkInTime: property?.checkInTime || '13:00',
            checkOutTime: property?.checkOutTime || '11:00',
            updatedAt: Date.now()
        };

        await Preferences.set({
            key: WIDGET_DATA_KEY,
            value: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Failed to update widget data:', error);
    }
};
