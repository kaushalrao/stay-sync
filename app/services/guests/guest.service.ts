import { IGuestRepository } from './repository.interface';
import { FirebaseGuestRepository } from './firebase.repository';
import { Guest } from '@/app/lib/types';
import { triggerBookingNotification } from '@/app/lib/emailUtils';

export class GuestService {
    private repo: IGuestRepository;

    constructor(repo: IGuestRepository = new FirebaseGuestRepository()) {
        this.repo = repo;
    }

    async getGuests(lastDoc?: any, limit: number = 20, searchQuery?: string) {
        return this.repo.getGuests(lastDoc, limit, searchQuery);
    }

    async getUpcomingGuests(limit: number = 5) {
        return this.repo.getUpcomingGuests(limit);
    }

    async getGuest(guestId: string) {
        return this.repo.getGuest(guestId);
    }

    async addGuest(guest: Omit<Guest, 'id'>) {
        return this.repo.addGuest(guest);
    }

    async updateGuest(guestId: string, updates: Partial<Guest>) {
        return this.repo.updateGuest(guestId, updates);
    }

    async deleteGuest(guestId: string) {
        return this.repo.deleteGuest(guestId);
    }

    async sendNotification(params: {
        guest: Guest | any,
        property: any,
        type: 'new' | 'updated',
        totalAmount: number,
        origin: string
    }) {
        return triggerBookingNotification({
            guest: params.guest,
            property: params.property,
            type: params.type,
            totalAmount: params.totalAmount,
            dashboardLink: `${params.origin}/greeter?guestId=${params.guest.id}`
        });
    }
}

export const guestService = new GuestService();
