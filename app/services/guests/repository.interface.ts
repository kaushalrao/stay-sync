import { Guest } from '@/app/lib/types';

export interface IGuestRepository {
    getGuests(userId: string, lastDoc?: any, limitCount?: number, searchQuery?: string): Promise<{ guests: Guest[], lastDoc: any }>;
    getGuest(userId: string, guestId: string): Promise<Guest | null>;
    addGuest(userId: string, guest: Omit<Guest, 'id'>): Promise<string>;
    updateGuest(userId: string, guestId: string, updates: Partial<Guest>): Promise<void>;
    deleteGuest(userId: string, guestId: string): Promise<void>;
    getUpcomingGuests(userId: string, limitCount?: number): Promise<Guest[]>;
}
