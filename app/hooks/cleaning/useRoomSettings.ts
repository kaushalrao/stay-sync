import { useState, useEffect, useCallback } from 'react';
import {
    doc, onSnapshot, setDoc, writeBatch, collection, query, where, getDocs
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';

export function useRoomSettings(propertyId: string) {
    const { user, showToast } = useApp();
    const [roomOrder, setRoomOrder] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user || !propertyId) {
            setRoomOrder([]);
            return;
        }

        const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.roomOrder && Array.isArray(data.roomOrder)) {
                    setRoomOrder(data.roomOrder);
                }
            } else {
                setRoomOrder([]);
            }
        });
        return () => unsubscribe();
    }, [user, propertyId]);

    const updateRoomOrder = useCallback(async (newOrder: string[]) => {
        if (!user || !propertyId) return;
        setRoomOrder(newOrder); // Optimistic update
        try {
            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`), {
                roomOrder: newOrder
            }, { merge: true });
        } catch (error) {
            console.error("Failed to save room order", error);
            showToast("Failed to save room order", "error");
        }
    }, [user, propertyId, showToast]);

    const renameRoom = useCallback(async (oldName: string, newName: string, allRooms: string[]) => {
        if (!user || !propertyId) return false;

        setIsSaving(true);
        try {
            const batch = writeBatch(db);

            // 1. Find all tasks with old room name
            const q = query(
                collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`),
                where("propertyId", "==", propertyId),
                where("room", "==", oldName)
            );
            const snapshot = await getDocs(q);

            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { room: newName });
            });

            // 2. Update room order
            const newOrder = allRooms.map(r => r === oldName ? newName : r);
            const settingsRef = doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`);
            batch.set(settingsRef, { roomOrder: newOrder }, { merge: true });

            await batch.commit();
            showToast(`Renamed to "${newName}"`, "success");
            return true;
        } catch (error) {
            console.error(error);
            showToast("Failed to rename room", "error");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [user, propertyId, showToast]);

    const deleteRoom = useCallback(async (roomToDelete: string, currentOrder: string[]) => {
        if (!user || !propertyId) return false;

        setIsSaving(true);
        try {
            const batch = writeBatch(db);

            // 1. Delete all tasks in this room
            const q = query(
                collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`),
                where("propertyId", "==", propertyId),
                where("room", "==", roomToDelete)
            );
            const snapshot = await getDocs(q);

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            // 2. Remove from room order
            const newOrder = currentOrder.filter(r => r !== roomToDelete);
            const settingsRef = doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`);
            batch.set(settingsRef, { roomOrder: newOrder }, { merge: true });

            await batch.commit();
            showToast(`Deleted room "${roomToDelete}"`, "success");
            return true;
        } catch (error) {
            console.error(error);
            showToast("Failed to delete room", "error");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [user, propertyId, showToast]);

    const addRoom = useCallback(async (newRoom: string, currentOrder: string[]) => {
        if (!user || !propertyId) return false;

        const roomName = newRoom.trim();
        if (!roomName) return false;
        if (currentOrder.includes(roomName)) {
            showToast("Room already exists", "error");
            return false;
        }

        setIsSaving(true);
        try {
            const newOrder = [...currentOrder, roomName];
            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`), {
                roomOrder: newOrder
            }, { merge: true });

            showToast(`Added room "${roomName}"`, "success");
            return true;
        } catch (error) {
            console.error("Failed to add room", error);
            showToast("Failed to add room", "error");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [user, propertyId, showToast]);

    return {
        roomOrder,
        updateRoomOrder,
        renameRoom,
        deleteRoom,
        addRoom,
        isSaving
    };
}
