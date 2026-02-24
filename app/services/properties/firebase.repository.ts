import {
    collection, updateDoc, doc,
    query, onSnapshot, where, writeBatch, getDoc
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IPropertyRepository } from './repository.interface';
import { Property } from '@/app/lib/types';

export class FirebasePropertyRepository implements IPropertyRepository {
    private getCollectionRef() {
        return collection(db, `artifacts/${appId}/properties`);
    }

    private getMappingRef() {
        return collection(db, `artifacts/${appId}/property_users`);
    }

    subscribeToProperties(userId: string, callback: (properties: Property[]) => void): () => void {
        const mappingQuery = query(this.getMappingRef(), where("userId", "==", userId));

        return onSnapshot(mappingQuery, async (mapSnapshot) => {
            const propertyIds = mapSnapshot.docs.map(doc => doc.data().propertyId);

            if (propertyIds.length === 0) {
                callback([]);
                return;
            }

            try {
                // Fetch each property document explicitly by ID. This is 100% reliable, scalable past 10,
                // and avoids missing index or documentId() evaluation bugs.
                const promises = propertyIds.map(id => getDoc(doc(this.getCollectionRef(), id)));
                const propSnaps = await Promise.all(promises);

                const allProperties: Property[] = [];
                for (const snap of propSnaps) {
                    if (snap.exists()) {
                        allProperties.push({ id: snap.id, ...snap.data() } as Property);
                    }
                }

                callback(allProperties);
            } catch (error) {
                console.error("[PropertyRepo] Failed to fetch individual properties:", error);
                callback([]);
            }
        }, (error) => {
            console.error("[PropertyRepo] Mapping query failed:", error);
            callback([]);
        });
    }

    async addProperty(userId: string, property: Omit<Property, 'id'>): Promise<string> {
        const batch = writeBatch(db);
        const newPropRef = doc(this.getCollectionRef());

        batch.set(newPropRef, { ...property, id: newPropRef.id }); // Ensure ID in doc

        const mappingRef = doc(this.getMappingRef(), `${userId}_${newPropRef.id}`);
        batch.set(mappingRef, {
            userId,
            propertyId: newPropRef.id,
            role: 'owner',
            createdAt: Date.now()
        });

        await batch.commit();
        return newPropRef.id;
    }

    async updateProperty(userId: string, propertyId: string, updates: Partial<Property>): Promise<void> {
        console.log(`[PropertyRepo] Updating property: ${propertyId}`);
        const ref = doc(this.getCollectionRef(), propertyId);
        await updateDoc(ref, updates);
    }

    async deleteProperty(userId: string, propertyId: string): Promise<void> {
        console.log(`[PropertyRepo] Deleting property: ${propertyId}`);
        const batch = writeBatch(db);

        // 1. Delete property doc
        const propRef = doc(this.getCollectionRef(), propertyId);
        batch.delete(propRef);

        // 2. Delete mapping doc
        const mappingRef = doc(this.getMappingRef(), `${userId}_${propertyId}`);
        batch.delete(mappingRef);

        await batch.commit();
    }
}
