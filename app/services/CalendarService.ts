import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { APP_URLS } from '../lib/urls';
import { Guest, CalendarEvent, Property } from '../lib/types';
import { isValidBookingStatus } from '../lib/utils';

export interface CalendarService {
    fetchExternal(url: string): Promise<{ start: string, end: string, summary: string }[]>;
    aggregateEvents(internalGuests: Guest[], property: Property): Promise<CalendarEvent[]>;
}

const parseICal = (text: string): { start: string, end: string, summary: string }[] => {
    const events: { start: string, end: string, summary: string }[] = [];
    const eventBlocks = text.split('BEGIN:VEVENT');

    for (const block of eventBlocks) {
        const dtStartMatch = block.match(/DTSTART(?:;[^:]+)*:(\d{8})/);
        const dtEndMatch = block.match(/DTEND(?:;[^:]+)*:(\d{8})/);
        const summaryMatch = block.match(/SUMMARY:(.*)/);

        if (dtStartMatch && dtEndMatch) {
            const s = dtStartMatch[1];
            const e = dtEndMatch[1];
            const formatDate = (d: string) => `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

            events.push({
                start: formatDate(s),
                end: formatDate(e),
                summary: summaryMatch ? summaryMatch[1].trim() : 'Booked'
            });
        }
    }
    return events;
};

export const defaultCalendarService: CalendarService = {
    fetchExternal: async (url: string) => {
        try {
            if (Capacitor.isNativePlatform()) {
                // Mobile: Use CapacitorHttp to bypass CORS
                const response = await CapacitorHttp.get({ url });
                if (response.status === 200) {
                    const text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                    return parseICal(text);
                }
            } else {
                // Web: Use proxy API to avoid CORS
                const res = await fetch(`${APP_URLS.API.CALENDAR_PROXY}?url=${encodeURIComponent(url)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.events) return data.events;
                }
            }
        } catch (error) {
            console.error("Error fetching calendar:", url, error);
        }
        return [];
    },

    aggregateEvents: async (internalGuests: Guest[], property: any): Promise<CalendarEvent[]> => {
        let allEvents: CalendarEvent[] = [];

        // 1. Internal Bookings
        const internalEvents: CalendarEvent[] = [];

        internalGuests.forEach((data) => {
            // Filter by propName
            if (data.propName !== property.name) return;
            // Only block for valid statuses (not cancelled, not deleted, not pending)
            if (isValidBookingStatus(data.status) && data.checkInDate && data.checkOutDate) {
                internalEvents.push({
                    start: data.checkInDate,
                    end: data.checkOutDate,
                    summary: `Hosted: ${data.guestName}`,
                    source: 'manual',
                    color: '#3b82f6' // Host Pilot Blue
                });
            }
        });

        allEvents = [...allEvents, ...internalEvents];

        // 2. External iCal Feeds
        const feeds = property.icalFeeds || [];

        const feedPromises = feeds.map(async (feed: any) => {
            const events = await defaultCalendarService.fetchExternal(feed.url);
            return events.map(e => ({
                ...e,
                source: feed.name,
                color: feed.color
            }));
        });

        try {
            const externalResults = await Promise.all(feedPromises);
            externalResults.forEach((events: any[]) => {
                allEvents = [...allEvents, ...events];
            });
        } catch (err) {
            console.error("Error fetching external calendars", err);
        }

        return allEvents;
    }
};
