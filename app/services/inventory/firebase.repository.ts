import {
    collection, addDoc, updateDoc, deleteDoc, doc, writeBatch,
    query, limit, onSnapshot, where
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IInventoryRepository } from './repository.interface';
import { InventoryNeed, InventoryLog, InventoryMasterItem } from '@lib/types';
import { getAllowedPropertyIds } from '@/app/store/propertyStore';

export class FirebaseInventoryRepository implements IInventoryRepository {
    private getNeedsRef() {
        return collection(db, `artifacts/${appId}/inventory-needs`);
    }

    private getLogsRef() {
        return collection(db, `artifacts/${appId}/inventory-logs`);
    }

    private getMasterRef() {
        return collection(db, `artifacts/${appId}/inventory-master`);
    }

    // --- Subscriptions ---

    subscribeToNeeds(callback: (needs: InventoryNeed[]) => void): () => void {
        const allowedPropIds = getAllowedPropertyIds();
        if (allowedPropIds.length === 0) {
            callback([]);
            return () => { };
        }

        const q = query(
            this.getNeedsRef(),
            where('propertyId', 'in', allowedPropIds.slice(0, 10))
        );
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryNeed[];
            // Maintain original sorting logic: newest first
            items.sort((a, b) => b.createdAt - a.createdAt);
            callback(items);
        });
    }

    subscribeToLogs(callback: (logs: InventoryLog[]) => void): () => void {
        const allowedPropIds = getAllowedPropertyIds();
        if (allowedPropIds.length === 0) {
            callback([]);
            return () => { };
        }

        const q = query(
            this.getLogsRef(),
            where('propertyId', 'in', allowedPropIds.slice(0, 10)),
            limit(50)
        );
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryLog[];
            items.sort((a, b) => b.createdAt - a.createdAt);
            callback(items);
        });
    }

    subscribeToMasterItems(callback: (items: InventoryMasterItem[]) => void): () => void {
        const allowedPropIds = getAllowedPropertyIds();
        if (allowedPropIds.length === 0) {
            callback([]);
            return () => { };
        }

        const q = query(
            this.getMasterRef(),
            where('propertyId', 'in', allowedPropIds.slice(0, 10))
        );
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryMasterItem[];
            // Maintain original sorting
            items.sort((a, b) => {
                if (a.category !== b.category) return a.category.localeCompare(b.category);
                return a.item.localeCompare(b.item);
            });
            callback(items);
        });
    }

    // --- Mutations ---

    async markRestocked(need: InventoryNeed): Promise<void> {
        const batch = writeBatch(db);

        // 1. Delete from needs
        const needRef = doc(this.getNeedsRef(), need.id);
        batch.delete(needRef);

        // 2. Add to logs
        const logRef = doc(this.getLogsRef());
        let targetPropertyId = need.propertyId;
        if (!targetPropertyId) {
            const allowed = getAllowedPropertyIds();
            targetPropertyId = allowed.length > 0 ? allowed[0] : 'unknown';
        }

        batch.set(logRef, {
            item: need.item,
            quantity: need.quantity,
            propertyId: targetPropertyId,
            room: need.room,
            type: 'restock',
            createdAt: Date.now()
        });

        await batch.commit();
    }

    async addMasterItem(category: string, item: string): Promise<string> {
        const allowed = getAllowedPropertyIds();
        const targetPropertyId = allowed.length > 0 ? allowed[0] : 'unknown';

        const docRef = await addDoc(this.getMasterRef(), {
            category,
            item,
            propertyId: targetPropertyId, // Attach Property ID
            createdAt: Date.now()
        });
        return docRef.id;
    }

    async updateMasterItem(itemId: string, updates: Partial<InventoryMasterItem>): Promise<void> {
        const itemRef = doc(this.getMasterRef(), itemId);
        await updateDoc(itemRef, updates);
    }

    async deleteMasterItem(itemId: string): Promise<void> {
        const itemRef = doc(this.getMasterRef(), itemId);
        await deleteDoc(itemRef);
    }
}
