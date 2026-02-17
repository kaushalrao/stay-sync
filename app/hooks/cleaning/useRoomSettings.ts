import { useState, useEffect, useCallback } from 'react';
import {
    doc, onSnapshot, setDoc, writeBatch, collection, query, where, getDocs
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';
import { STANDARD_ROOMS, DEFAULT_ROOM_TYPES } from '@constants/cleaning';

export function useRoomSettings(propertyId: string) {
    const { user, showToast } = useApp();
    const [roomOrder, setRoomOrder] = useState<string[]>([]);
    const [roomTypes, setRoomTypes] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user || !propertyId) {
            setRoomOrder([]);
            setRoomTypes({});
            return;
        }

        const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.roomOrder && Array.isArray(data.roomOrder)) {
                    setRoomOrder(data.roomOrder);
                }
                if (data.roomTypes) {
                    setRoomTypes(data.roomTypes);
                }
            } else {
                setRoomOrder([]);
                setRoomTypes({});
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

    const setRoomType = useCallback(async (roomName: string, type: string) => {
        if (!user || !propertyId) return;

        // Optimistic
        setRoomTypes(prev => ({ ...prev, [roomName]: type }));

        try {
            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`), {
                roomTypes: { [roomName]: type }
            }, { merge: true });
            showToast(`Set category for ${roomName}`, "success");
        } catch (error) {
            console.error("Failed to save room type", error);
            showToast("Failed to save category", "error");
        }
    }, [user, propertyId, showToast]);

    const renameRoom = useCallback(async (oldName: string, newName: string, allRooms: string[], newType?: string) => {
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

            // 3. Migrate/Update room type
            const currentType = roomTypes[oldName];
            const updates: any = { roomOrder: newOrder };

            if (newType) {
                updates[`roomTypes.${newName}`] = newType;
            } else if (currentType) {
                updates[`roomTypes.${newName}`] = currentType;
            }

            const settingsRef = doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`);
            batch.update(settingsRef, updates); // Use update for dot notation

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
    }, [user, propertyId, showToast, roomTypes]);

    const deleteRoom = useCallback(async (roomToDelete: string, currentOrder: string[]) => {
        if (!user || !propertyId) return false;

        setIsSaving(true);
        try {
            const batch = writeBatch(db);
            const lowerRoom = roomToDelete.toLowerCase();

            // 1. Find all tasks with this room name (case-insensitive simulation)
            const exactQuery = query(
                collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`),
                where("propertyId", "==", propertyId),
                where("room", "==", roomToDelete)
            );

            const lowerQuery = query(
                collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`),
                where("propertyId", "==", propertyId),
                where("room", "==", lowerRoom)
            );

            const [exactSnap, lowerSnap] = await Promise.all([
                getDocs(exactQuery),
                getDocs(lowerQuery)
            ]);

            const deletedIds = new Set();

            exactSnap.docs.forEach(doc => {
                deletedIds.add(doc.id);
                batch.delete(doc.ref);
            });

            lowerSnap.docs.forEach(doc => {
                if (!deletedIds.has(doc.id)) {
                    batch.delete(doc.ref);
                }
            });

            // 2. Remove from room order
            const newOrder = currentOrder.filter(r => r.toLowerCase() !== lowerRoom);
            const settingsRef = doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`);

            // We also want to remove from roomTypes if present, but ignore for now (orphan data is fine small scale)
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

    const addRoom = useCallback(async (newRoom: string, currentOrder: string[], type: string = 'General') => {
        if (!user || !propertyId) return false;

        const roomName = newRoom.trim();
        if (!roomName) return false;

        // Case insensitive check
        if (currentOrder.some(r => r.toLowerCase() === roomName.toLowerCase())) {
            showToast("Room already exists", "error");
            return false;
        }

        setIsSaving(true);
        try {
            const newOrder = [...currentOrder, roomName];
            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`), {
                roomOrder: newOrder,
                roomTypes: { [roomName]: type }
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

    const resetToDefaults = useCallback(async () => {
        if (!user || !propertyId) return false;

        setIsSaving(true);
        try {
            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`), {
                roomOrder: STANDARD_ROOMS,
                roomTypes: DEFAULT_ROOM_TYPES
            }, { merge: true });

            showToast("Restored default rooms", "success");
            return true;
        } catch (error) {
            console.error("Failed to reset rooms", error);
            showToast("Failed to restore defaults", "error");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [user, propertyId, showToast]);

    return {
        roomOrder,
        roomTypes,
        updateRoomOrder,
        setRoomType,
        renameRoom,
        deleteRoom,
        addRoom,
        resetToDefaults,
        isSaving
    };
}
