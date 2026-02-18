import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, onSnapshot
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IPropertyRepository } from './repository.interface';
import { Property } from '@/app/lib/types';

export class FirebasePropertyRepository implements IPropertyRepository {
    private getCollectionRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/properties`);
    }

    subscribeToProperties(userId: string, callback: (properties: Property[]) => void): () => void {
        const q = query(this.getCollectionRef(userId));
        return onSnapshot(q, (snapshot) => {
            const properties = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Property[];
            callback(properties);
        });
    }

    async addProperty(userId: string, property: Omit<Property, 'id'>): Promise<string> {
        const docRef = await addDoc(this.getCollectionRef(userId), property);
        return docRef.id;
    }

    async updateProperty(userId: string, propertyId: string, updates: Partial<Property>): Promise<void> {
        console.log(`[PropertyRepo] Updating property: ${propertyId}`);
        const ref = doc(this.getCollectionRef(userId), propertyId);
        await updateDoc(ref, updates);
    }

    async deleteProperty(userId: string, propertyId: string): Promise<void> {
        console.log(`[PropertyRepo] Deleting property: ${propertyId}`);
        const ref = doc(this.getCollectionRef(userId), propertyId);
        await deleteDoc(ref);
    }
}
