import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, getDoc, orderBy, limit, startAfter, getDocs, startAt, endAt, where
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IGuestRepository } from './repository.interface';
import { Guest } from '@/app/lib/types';

export class FirebaseGuestRepository implements IGuestRepository {
    private getCollectionRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/guests`);
    }

    async getGuests(userId: string, lastDoc?: any, limitCount: number = 20, searchQuery?: string): Promise<{ guests: Guest[], lastDoc: any }> {
        let q;

        if (searchQuery) {
            // Search Mode: Order by searchName for case-insensitive prefix search
            const normalizedQuery = searchQuery.toLowerCase();
            let queryConstraints: any[] = [
                orderBy('searchName'),
                startAt(normalizedQuery),
                endAt(normalizedQuery + '\uf8ff'),
                limit(limitCount)
            ];

            if (lastDoc) {
                queryConstraints = [
                    orderBy('searchName'),
                    startAfter(lastDoc),
                    endAt(normalizedQuery + '\uf8ff'), // Ensure we don't go past the prefix range
                    limit(limitCount)
                ];
            }

            q = query(
                this.getCollectionRef(userId),
                ...queryConstraints
            );
        } else {
            // Default Mode: Order by createdAt desc
            q = query(
                this.getCollectionRef(userId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            if (lastDoc) {
                q = query(this.getCollectionRef(userId), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
            }
        }

        const snapshot = await getDocs(q);
        const guests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Guest[];

        return {
            guests,
            lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
    }

    async getUpcomingGuests(userId: string, limitCount: number = 5): Promise<Guest[]> {
        const today = new Date().toISOString().split('T')[0];

        // We query slightly more to handle potential filtering if needed, but primarily reliance on checkInDate
        // Note: 'upcoming' usually means checkInDate >= today. 
        // We also want to filter out cancelled if possible, but Firestore doesn't support != easily with range.
        // So we fetch, then filter in memory if needed.

        const q = query(
            this.getCollectionRef(userId),
            where('checkInDate', '>=', today),
            orderBy('checkInDate', 'asc'),
            limit(limitCount * 2) // Fetch double to allow for some filtering (e.g. cancelled)
        );

        const snapshot = await getDocs(q);
        const guests = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Guest))
            .filter(g => g.status !== 'cancelled')
            .slice(0, limitCount);

        return guests;
    }

    async getGuest(userId: string, guestId: string): Promise<Guest | null> {
        const ref = doc(this.getCollectionRef(userId), guestId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Guest;
        }
        return null;
    }

    async addGuest(userId: string, guest: Omit<Guest, 'id'>): Promise<string> {
        const guestWithSearch = {
            ...guest,
            searchName: guest.guestName.toLowerCase()
        };
        const docRef = await addDoc(this.getCollectionRef(userId), guestWithSearch);
        return docRef.id;
    }

    async updateGuest(userId: string, guestId: string, updates: Partial<Guest>): Promise<void> {
        console.log(`[GuestRepo] Updating guest: ${guestId}`);
        const ref = doc(this.getCollectionRef(userId), guestId);

        const finalUpdates = { ...updates };
        if (updates.guestName) {
            finalUpdates.searchName = updates.guestName.toLowerCase();
        }

        await updateDoc(ref, finalUpdates);
    }

    async deleteGuest(userId: string, guestId: string): Promise<void> {
        console.log(`[GuestRepo] Deleting guest: ${guestId}`);
        const ref = doc(this.getCollectionRef(userId), guestId);
        await deleteDoc(ref);
    }
}
