import {
    collection, addDoc, updateDoc, doc,
    query, getDoc, orderBy, limit, startAfter, getDocs, startAt, endAt, where
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IGuestRepository } from './repository.interface';
import { Guest } from '@/app/lib/types';
import { getAllowedPropertyIds } from '@/app/store/propertyStore';

export class FirebaseGuestRepository implements IGuestRepository {
    private getCollectionRef() {
        return collection(db, `artifacts/${appId}/guests`);
    }

    async getGuests(lastDoc?: any, limitCount: number = 20, searchQuery?: string): Promise<{ guests: Guest[], lastDoc: any }> {
        const allowedPropIds = getAllowedPropertyIds();
        if (allowedPropIds.length === 0) return { guests: [], lastDoc: null };

        let q;

        // Note: Firestore does not support 'in' AND 'orderBy' easily without complex composite indexes on every propertyId.
        // For standard UI, we query 'in' allowedPropIds.
        const baseConstraints: any[] = [where('propertyId', 'in', allowedPropIds.slice(0, 10))];

        if (searchQuery) {
            const normalizedQuery = searchQuery.toLowerCase();
            let queryConstraints: any[] = [
                ...baseConstraints,
                orderBy('searchName'),
                startAt(normalizedQuery),
                endAt(normalizedQuery + '\uf8ff'),
                limit(limitCount)
            ];

            if (lastDoc) {
                queryConstraints = [
                    ...baseConstraints,
                    orderBy('searchName'),
                    startAfter(lastDoc),
                    endAt(normalizedQuery + '\uf8ff'), // Ensure we don't go past the prefix range
                    limit(limitCount)
                ];
            }

            q = query(
                this.getCollectionRef(),
                ...queryConstraints
            );
        } else {
            // Default Mode: Order by createdAt desc
            q = query(
                this.getCollectionRef(),
                ...baseConstraints,
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            if (lastDoc) {
                q = query(this.getCollectionRef(), ...baseConstraints, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
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

    async getUpcomingGuests(limitCount: number = 5): Promise<Guest[]> {
        const allowedPropIds = getAllowedPropertyIds();
        if (allowedPropIds.length === 0) return [];

        const today = new Date().toISOString().split('T')[0];

        // We query slightly more to handle potential filtering if needed, but primarily reliance on checkInDate
        // Note: 'upcoming' usually means checkInDate >= today. 
        // We also want to filter out cancelled if possible, but Firestore doesn't support != easily with range.
        // So we fetch, then filter in memory if needed.

        const q = query(
            this.getCollectionRef(),
            where('propertyId', 'in', allowedPropIds.slice(0, 10)),
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

    async getGuest(guestId: string): Promise<Guest | null> {
        const ref = doc(this.getCollectionRef(), guestId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Guest;
        }
        return null;
    }

    async addGuest(guest: Omit<Guest, 'id'>): Promise<string> {
        let targetPropertyId = guest.propertyId;
        if (!targetPropertyId) {
            const allowed = getAllowedPropertyIds();
            targetPropertyId = allowed.length > 0 ? allowed[0] : 'unknown';
        }

        const guestWithSearch = {
            ...guest,
            propertyId: targetPropertyId,
            searchName: guest.guestName.toLowerCase()
        };
        const docRef = await addDoc(this.getCollectionRef(), guestWithSearch);
        return docRef.id;
    }

    async updateGuest(guestId: string, updates: Partial<Guest>): Promise<void> {
        console.log(`[GuestRepo] Updating guest: ${guestId}`);
        const ref = doc(this.getCollectionRef(), guestId);

        const finalUpdates = { ...updates };
        if (updates.guestName) {
            finalUpdates.searchName = updates.guestName.toLowerCase();
        }

        await updateDoc(ref, finalUpdates);
    }

    async deleteGuest(guestId: string): Promise<void> {
        const ref = doc(this.getCollectionRef(), guestId);
        await updateDoc(ref, { status: 'deleted' });
    }
}
