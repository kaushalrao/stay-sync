import { useState, useEffect, useCallback } from 'react';
import { cleaningService } from '@services/cleaning/cleaning.service';
import { useApp } from '@components/providers/AppProvider';
import { useUIStore } from '@store/index';

export function useRoomSettings(propertyId: string) {
    const { user } = useApp();
    const showToast = useUIStore(state => state.showToast);
    const [roomOrder, setRoomOrder] = useState<string[]>([]);
    const [roomTypes, setRoomTypes] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user || !propertyId) {
            setRoomOrder([]);
            setRoomTypes({});
            return;
        }

        const unsubscribe = cleaningService.getRoomSettings(propertyId, (settings) => {
            if (settings.roomOrder) setRoomOrder(settings.roomOrder);
            if (settings.roomTypes) setRoomTypes(settings.roomTypes);
        });

        return () => unsubscribe();
    }, [user, propertyId]);

    const updateRoomOrder = useCallback(async (newOrder: string[]) => {
        if (!user || !propertyId) return;
        setRoomOrder(newOrder); // Optimistic update
        try {
            await cleaningService.updateRoomOrder(propertyId, newOrder);
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
            await cleaningService.setRoomType(propertyId, roomName, type);
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
            await cleaningService.renameRoom(propertyId, oldName, newName, allRooms, newType);
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
            await cleaningService.deleteRoom(propertyId, roomToDelete, currentOrder);
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
            await cleaningService.addRoom(propertyId, roomName, currentOrder, type);
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
            await cleaningService.resetRoomSettings(propertyId);
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
