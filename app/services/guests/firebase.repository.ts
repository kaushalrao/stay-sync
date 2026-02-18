import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, onSnapshot, getDoc
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IGuestRepository } from './repository.interface';
import { Guest } from '@/app/lib/types';

export class FirebaseGuestRepository implements IGuestRepository {
    private getCollectionRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/guests`);
    }

    subscribeToGuests(userId: string, callback: (guests: Guest[]) => void): () => void {
        const q = query(this.getCollectionRef(userId));
        return onSnapshot(q, (snapshot) => {
            const guests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Guest[];
            callback(guests);
        });
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
