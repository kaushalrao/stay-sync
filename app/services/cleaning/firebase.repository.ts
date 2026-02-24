import {
    collection, addDoc, updateDoc, deleteDoc, doc, writeBatch,
    query, where, getDocs, setDoc, onSnapshot
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { ICleaningRepository } from './repository.interface';
import { CleaningTask, RoomSettings } from '@/app/lib/types';
import { STANDARD_ROOMS, DEFAULT_ROOM_TYPES } from '@/app/constants/cleaning';
import { getAllowedPropertyIds } from '@/app/store/propertyStore';

export class FirebaseCleaningRepository implements ICleaningRepository {
    private getCollectionRef() {
        return collection(db, `artifacts/${appId}/cleaning-tasks`);
    }

    private getSettingsRef(propertyId: string) {
        return doc(db, `artifacts/${appId}/cleaning-settings/${propertyId}`);
    }



    async addTask(task: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>): Promise<string> {
        let targetPropertyId = task.propertyId;
        if (!targetPropertyId) {
            const allowed = getAllowedPropertyIds();
            targetPropertyId = allowed.length > 0 ? allowed[0] : 'unknown';
        }

        const docRef = await addDoc(this.getCollectionRef(), {
            ...task,
            propertyId: targetPropertyId,
            isCompleted: false,
            createdAt: Date.now()
        });
        return docRef.id;
    }

    async updateTaskStatus(taskId: string, isCompleted: boolean): Promise<void> {
        const ref = doc(this.getCollectionRef(), taskId);
        await updateDoc(ref, { isCompleted });
    }

    async deleteTask(taskId: string): Promise<void> {
        const ref = doc(this.getCollectionRef(), taskId);
        await deleteDoc(ref);
    }

    async resetTasks(taskIds: string[]): Promise<void> {
        if (!taskIds.length) return;
        const batch = writeBatch(db);
        taskIds.forEach(id => {
            const ref = doc(this.getCollectionRef(), id);
            batch.update(ref, { isCompleted: false });
        });
        await batch.commit();
    }

    subscribeToTasks(callback: (tasks: CleaningTask[]) => void): () => void {
        const allowedPropIds = getAllowedPropertyIds();
        if (allowedPropIds.length === 0) {
            callback([]);
            return () => { };
        }

        const q = query(
            this.getCollectionRef(),
            where('propertyId', 'in', allowedPropIds.slice(0, 10))
        );
        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CleaningTask[];
            callback(tasks);
        });
    }

    async addPresets(tasks: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>[]): Promise<void> {
        const batch = writeBatch(db);
        const colRef = this.getCollectionRef();

        tasks.forEach(task => {
            const docRef = doc(colRef);
            let targetPropertyId = task.propertyId;
            if (!targetPropertyId) {
                const allowed = getAllowedPropertyIds();
                targetPropertyId = allowed.length > 0 ? allowed[0] : 'unknown';
            }
            batch.set(docRef, {
                ...task,
                propertyId: targetPropertyId,
                isCompleted: false,
                createdAt: Date.now()
            });
        });
        await batch.commit();
    }

    async saveRoomOrder(propertyId: string, order: string[]): Promise<void> {
        await setDoc(this.getSettingsRef(propertyId), { roomOrder: order }, { merge: true });
    }

    async saveRoomType(propertyId: string, roomName: string, type: string): Promise<void> {
        await setDoc(this.getSettingsRef(propertyId), {
            roomTypes: { [roomName]: type }
        }, { merge: true });
    }

    async renameRoom(propertyId: string, oldName: string, newName: string, allRooms: string[], newType?: string): Promise<void> {
        const batch = writeBatch(db);

        // 1. Update Tasks
        const q = query(
            this.getCollectionRef(),
            where("propertyId", "==", propertyId),
            where("room", "==", oldName)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(d => batch.update(d.ref, { room: newName }));

        // 2. Update Settings
        const newOrder = allRooms.map(r => r === oldName ? newName : r);
        const updates: any = { roomOrder: newOrder };

        if (newType) updates[`roomTypes.${newName}`] = newType;

        const settingsRef = this.getSettingsRef(propertyId);
        batch.update(settingsRef, updates);

        await batch.commit();
    }

    async deleteRoom(propertyId: string, roomName: string, currentOrder: string[]): Promise<void> {
        const batch = writeBatch(db);
        const lowerName = roomName.toLowerCase();

        // Delete tasks (Exact + Lowercase)
        const q1 = query(this.getCollectionRef(), where("propertyId", "==", propertyId), where("room", "==", roomName));
        const q2 = query(this.getCollectionRef(), where("propertyId", "==", propertyId), where("room", "==", lowerName));

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
        batch.set(this.getSettingsRef(propertyId), { roomOrder: newOrder }, { merge: true });

        await batch.commit();
    }

    async addRoom(propertyId: string, roomName: string, currentOrder: string[], type: string): Promise<void> {
        const newOrder = [...currentOrder, roomName];
        await setDoc(this.getSettingsRef(propertyId), {
            roomOrder: newOrder,
            roomTypes: { [roomName]: type }
        }, { merge: true });
    }

    getRoomSettings(propertyId: string, callback: (settings: RoomSettings) => void): () => void {
        const ref = this.getSettingsRef(propertyId);

        return onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                callback(snap.data() as RoomSettings);
            } else {
                callback({ roomOrder: [], roomTypes: {} });
            }
        }, (error) => {
            console.error("[CleaningRepo] Failed to fetch room settings:", error.message);
        });
    }

    async resetRoomSettings(propertyId: string): Promise<void> {
        await setDoc(this.getSettingsRef(propertyId), {
            roomOrder: STANDARD_ROOMS,
            roomTypes: DEFAULT_ROOM_TYPES
        }, { merge: true });
    }
}
