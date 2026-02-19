import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, getDoc, orderBy, limit, startAfter, getDocs
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IGuestRepository } from './repository.interface';
import { Guest } from '@/app/lib/types';

export class FirebaseGuestRepository implements IGuestRepository {
    private getCollectionRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/guests`);
    }

    async getGuests(userId: string, lastDoc?: any, limitCount: number = 20): Promise<{ guests: Guest[], lastDoc: any }> {
        let q = query(
            this.getCollectionRef(userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        if (lastDoc) {
            q = query(this.getCollectionRef(userId), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
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

    async getGuest(userId: string, guestId: string): Promise<Guest | null> {
        const ref = doc(this.getCollectionRef(userId), guestId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Guest;
        }
        return null;
    }

    async addGuest(userId: string, guest: Omit<Guest, 'id'>): Promise<string> {
        const docRef = await addDoc(this.getCollectionRef(userId), guest);
        return docRef.id;
    }

    async updateGuest(userId: string, guestId: string, updates: Partial<Guest>): Promise<void> {
        console.log(`[GuestRepo] Updating guest: ${guestId}`);
        const ref = doc(this.getCollectionRef(userId), guestId);
        await updateDoc(ref, updates);
    }

    async deleteGuest(userId: string, guestId: string): Promise<void> {
        console.log(`[GuestRepo] Deleting guest: ${guestId}`);
        const ref = doc(this.getCollectionRef(userId), guestId);
        await deleteDoc(ref);
    }
}
