import { IGuestRepository } from './repository.interface';
import { FirebaseGuestRepository } from './firebase.repository';
import { Guest } from '@/app/lib/types';

export class GuestService {
    private repo: IGuestRepository;

    constructor(repo: IGuestRepository = new FirebaseGuestRepository()) {
        this.repo = repo;
    }

    subscribeToGuests(userId: string | undefined | null, callback: (guests: Guest[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToGuests(userId, callback);
    }

    async getGuest(userId: string | undefined | null, guestId: string) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.getGuest(userId, guestId);
    }

    async addGuest(userId: string | undefined | null, guest: Omit<Guest, 'id'>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.addGuest(userId, guest);
    }

    async updateGuest(userId: string | undefined | null, guestId: string, updates: Partial<Guest>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.updateGuest(userId, guestId, updates);
    }

    async deleteGuest(userId: string | undefined | null, guestId: string) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.deleteGuest(userId, guestId);
    }
}

export const guestService = new GuestService();
