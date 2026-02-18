import {
    collection, addDoc, updateDoc, deleteDoc, doc, writeBatch,
    query, limit, onSnapshot
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IInventoryRepository } from './repository.interface';
import { InventoryNeed, InventoryLog, InventoryMasterItem } from '@lib/types';

export class FirebaseInventoryRepository implements IInventoryRepository {
    private getNeedsRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/inventory-needs`);
    }

    private getLogsRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/inventory-logs`);
    }

    private getMasterRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/inventory-master`);
    }

    // --- Subscriptions ---

    subscribeToNeeds(userId: string, callback: (needs: InventoryNeed[]) => void): () => void {
        const q = query(this.getNeedsRef(userId)); // Ordering handled in client for now to match old logic, or can be added here
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

    subscribeToLogs(userId: string, callback: (logs: InventoryLog[]) => void): () => void {
        const q = query(this.getLogsRef(userId), limit(50));
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryLog[];
            items.sort((a, b) => b.createdAt - a.createdAt);
            callback(items);
        });
    }

    subscribeToMasterItems(userId: string, callback: (items: InventoryMasterItem[]) => void): () => void {
        const q = query(this.getMasterRef(userId));
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

    async markRestocked(userId: string, need: InventoryNeed): Promise<void> {
        const batch = writeBatch(db);

        // 1. Delete from needs
        const needRef = doc(this.getNeedsRef(userId), need.id);
        batch.delete(needRef);

        // 2. Add to logs
        const logRef = doc(this.getLogsRef(userId));
        batch.set(logRef, {
            item: need.item,
            quantity: need.quantity,
            propertyId: need.propertyId,
            room: need.room,
            type: 'restock',
            createdAt: Date.now()
        });

        await batch.commit();
    }

    async addMasterItem(userId: string, category: string, item: string): Promise<string> {
        const docRef = await addDoc(this.getMasterRef(userId), {
            category,
            item,
            createdAt: Date.now()
        });
        return docRef.id;
    }

    async updateMasterItem(userId: string, itemId: string, updates: Partial<InventoryMasterItem>): Promise<void> {
        const itemRef = doc(this.getMasterRef(userId), itemId);
        await updateDoc(itemRef, updates);
    }

    async deleteMasterItem(userId: string, itemId: string): Promise<void> {
        const itemRef = doc(this.getMasterRef(userId), itemId);
        await deleteDoc(itemRef);
    }
}
