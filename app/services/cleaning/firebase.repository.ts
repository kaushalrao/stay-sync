import {
    collection, addDoc, updateDoc, deleteDoc, doc, writeBatch,
    query, where, getDocs, setDoc, onSnapshot
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { ICleaningRepository } from './repository.interface';
import { CleaningTask, RoomSettings } from '@/app/lib/types';
import { STANDARD_ROOMS, DEFAULT_ROOM_TYPES } from '@/app/constants/cleaning';

export class FirebaseCleaningRepository implements ICleaningRepository {
    private getCollectionRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/cleaning-tasks`);
    }

    private getSettingsRef(userId: string, propertyId: string) {
        return doc(db, `artifacts/${appId}/users/${userId}/cleaning-settings/${propertyId}`);
    }

    async addTask(userId: string, task: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>): Promise<string> {
        const docRef = await addDoc(this.getCollectionRef(userId), {
            ...task,
            isCompleted: false,
            createdAt: Date.now()
        });
        return docRef.id;
    }

    async updateTaskStatus(userId: string, taskId: string, isCompleted: boolean): Promise<void> {
        const ref = doc(db, `artifacts/${appId}/users/${userId}/cleaning-tasks/${taskId}`);
        await updateDoc(ref, { isCompleted });
    }

    async deleteTask(userId: string, taskId: string): Promise<void> {
        const ref = doc(db, `artifacts/${appId}/users/${userId}/cleaning-tasks/${taskId}`);
        await deleteDoc(ref);
    }

    async resetTasks(userId: string, taskIds: string[]): Promise<void> {
        if (!taskIds.length) return;
        const batch = writeBatch(db);
        taskIds.forEach(id => {
            const ref = doc(db, `artifacts/${appId}/users/${userId}/cleaning-tasks/${id}`);
            batch.update(ref, { isCompleted: false });
        });
        await batch.commit();
    }

    subscribeToTasks(userId: string, callback: (tasks: CleaningTask[]) => void): () => void {
        const q = query(this.getCollectionRef(userId));
        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CleaningTask[];
            callback(tasks);
        });
    }

    async addPresets(userId: string, tasks: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>[]): Promise<void> {
        const batch = writeBatch(db);
        const colRef = this.getCollectionRef(userId);

        tasks.forEach(task => {
            const docRef = doc(colRef);
            batch.set(docRef, {
                ...task,
                isCompleted: false,
                createdAt: Date.now()
            });
        });
        await batch.commit();
    }

    async saveRoomOrder(userId: string, propertyId: string, order: string[]): Promise<void> {
        await setDoc(this.getSettingsRef(userId, propertyId), { roomOrder: order }, { merge: true });
    }

    async saveRoomType(userId: string, propertyId: string, roomName: string, type: string): Promise<void> {
        await setDoc(this.getSettingsRef(userId, propertyId), {
            roomTypes: { [roomName]: type }
        }, { merge: true });
    }

    async renameRoom(userId: string, propertyId: string, oldName: string, newName: string, allRooms: string[], newType?: string): Promise<void> {
        const batch = writeBatch(db);

        // 1. Update Tasks
        const q = query(
            this.getCollectionRef(userId),
            where("propertyId", "==", propertyId),
            where("room", "==", oldName)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(d => batch.update(d.ref, { room: newName }));

        // 2. Update Settings
        const newOrder = allRooms.map(r => r === oldName ? newName : r);
        const updates: any = { roomOrder: newOrder };

        // We'd fetch types first in a real scenario or pass them in.
        // Simplified for this snippet:
        if (newType) updates[`roomTypes.${newName}`] = newType;

        const settingsRef = this.getSettingsRef(userId, propertyId);
        batch.update(settingsRef, updates);

        await batch.commit();
    }

    async deleteRoom(userId: string, propertyId: string, roomName: string, currentOrder: string[]): Promise<void> {
        const batch = writeBatch(db);
        const lowerName = roomName.toLowerCase();

        // Delete tasks (Exact + Lowercase)
        const q1 = query(this.getCollectionRef(userId), where("propertyId", "==", propertyId), where("room", "==", roomName));
        const q2 = query(this.getCollectionRef(userId), where("propertyId", "==", propertyId), where("room", "==", lowerName));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const deletedIds = new Set<string>();

        [...snap1.docs, ...snap2.docs].forEach(d => {
            if (!deletedIds.has(d.id)) {
                batch.delete(d.ref);
                deletedIds.add(d.id);
            }
        });

        // Update Order
        const newOrder = currentOrder.filter(r => r.toLowerCase() !== lowerName);
        batch.set(this.getSettingsRef(userId, propertyId), { roomOrder: newOrder }, { merge: true });

        await batch.commit();
    }

    async addRoom(userId: string, propertyId: string, roomName: string, currentOrder: string[], type: string): Promise<void> {
        const newOrder = [...currentOrder, roomName];
        await setDoc(this.getSettingsRef(userId, propertyId), {
            roomOrder: newOrder,
            roomTypes: { [roomName]: type }
        }, { merge: true });
    }

    getRoomSettings(userId: string, propertyId: string, callback: (settings: RoomSettings) => void): () => void {
        const ref = this.getSettingsRef(userId, propertyId);

        return onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                callback(snap.data() as RoomSettings);
            } else {
                callback({ roomOrder: [], roomTypes: {} });
            }
        });
    }

    async resetRoomSettings(userId: string, propertyId: string): Promise<void> {
        await setDoc(this.getSettingsRef(userId, propertyId), {
            roomOrder: STANDARD_ROOMS,
            roomTypes: DEFAULT_ROOM_TYPES
        }, { merge: true });
    }
}
