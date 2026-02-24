import { Guest } from '@/app/lib/types';

export interface IGuestRepository {
    getGuests(lastDoc?: any, limitCount?: number, searchQuery?: string): Promise<{ guests: Guest[], lastDoc: any }>;
    getGuest(guestId: string): Promise<Guest | null>;
    addGuest(guest: Omit<Guest, 'id'>): Promise<string>;
    updateGuest(guestId: string, updates: Partial<Guest>): Promise<void>;
    deleteGuest(guestId: string): Promise<void>;
    getUpcomingGuests(limitCount?: number): Promise<Guest[]>;
}
