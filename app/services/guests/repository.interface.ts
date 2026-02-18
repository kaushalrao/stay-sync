import { Guest } from '@/app/lib/types';

export interface IGuestRepository {
    subscribeToGuests(userId: string, callback: (guests: Guest[]) => void): () => void;
    getGuest(userId: string, guestId: string): Promise<Guest | null>;
    addGuest(userId: string, guest: Omit<Guest, 'id'>): Promise<string>;
    updateGuest(userId: string, guestId: string, updates: Partial<Guest>): Promise<void>;
    deleteGuest(userId: string, guestId: string): Promise<void>;
}
