import { useCallback } from 'react';
import {
    collection, addDoc, updateDoc,
    deleteDoc, doc, writeBatch
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { PRESET_TASKS, STANDARD_ROOMS } from '@constants/cleaning';
import { useApp } from '@components/providers/AppProvider';
import { useStore } from '@store/useStore';

export function useCleaningTasks(propertyId: string) {
    const { user, showToast } = useApp();
    const allTasks = useStore(state => state.tasks);
    const isLoading = useStore(state => state.isCleaningLoading);
    const tasks = (allTasks || []).filter(t => t.propertyId === propertyId);

    const addTask = useCallback(async (title: string, room: string) => {
        if (!user || !propertyId) return false;
        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`), {
                title,
                propertyId,
                room: room.toLowerCase(),
                isCompleted: false,
                createdAt: Date.now()
            });
            showToast('Task added', 'success');
            return true;
        } catch (error) {
            console.error(error);
            showToast('Failed to add task', 'error');
            return false;
        }
    }, [user, propertyId, showToast]);

    const toggleTask = useCallback(async (taskId: string, currentStatus: boolean) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`, taskId), {
                isCompleted: !currentStatus
            });
        } catch (error) {
            console.error(error);
            showToast('Failed to update task', 'error');
        }
    }, [user, showToast]);

    const deleteTask = useCallback(async (taskId: string) => {
        if (!user) return;
        if (!confirm('Delete this task?')) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`, taskId));
            showToast('Task deleted', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to delete task', 'error');
        }
    }, [user, showToast]);

    // Batch operations
    const resetTasks = useCallback(async () => {
        if (!user || !tasks.length) return;
        const completedTasks = tasks.filter(t => t.isCompleted);
        if (completedTasks.length === 0) {
            showToast("No completed tasks to reset.", "success");
            return;
        }

        if (!confirm('Are you sure you want to reset all tasks to "Not Completed"?')) return;

        try {
            const batch = writeBatch(db);
            completedTasks.forEach(task => {
                const ref = doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`, task.id);
                batch.update(ref, { isCompleted: false });
            });
            await batch.commit();
            showToast("All tasks reset successfully!", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to reset tasks", "error");
        }
    }, [user, tasks, showToast]);

    const initializePresets = useCallback(async () => {
        if (!user || !propertyId) return;
        if (!confirm('This will add default tasks to all standard rooms. Continue?')) return;

        try {
            const batch = writeBatch(db);
            const collectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`);

            Object.entries(PRESET_TASKS).forEach(([room, titles]) => {
                titles.forEach(title => {
                    const docRef = doc(collectionRef);
                    batch.set(docRef, {
                        title,
                        propertyId,
                        room,
                        isCompleted: false,
                        createdAt: Date.now()
                    });
                });
            });

            // Also save default order
            batch.set(doc(db, `artifacts/${appId}/users/${user.uid}/cleaning-settings/${propertyId}`), {
                roomOrder: STANDARD_ROOMS
            }, { merge: true });

            await batch.commit();
            showToast('Presets added successfully!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to add presets', 'error');
        }
    }, [user, propertyId, showToast]);

    const addRoomPresets = useCallback(async (roomName: string) => {
        if (!user || !propertyId) return;

        const lowerRoom = roomName.toLowerCase();
        let tasksToAdd: string[] = [];

        // Robust matching logic
        if (lowerRoom.includes('living') || lowerRoom.includes('lounge')) {
            tasksToAdd = PRESET_TASKS['Living'];
        } else if (lowerRoom.includes('kitchen')) {
            tasksToAdd = PRESET_TASKS['Kitchen'];
        } else if (lowerRoom.includes('bath') || lowerRoom.includes('toilet') || lowerRoom.includes('restroom')) {
            // Check bath first to avoid "room" matching issues if we were using it, 
            // but mainly to be safe.
            tasksToAdd = PRESET_TASKS['Bathroom 1'];
        } else if (lowerRoom.includes('bedroom') || lowerRoom.includes('bed')) {
            tasksToAdd = PRESET_TASKS['Bedroom 1'];
        } else if (lowerRoom.includes('balcony') || lowerRoom.includes('terrace')) {
            tasksToAdd = PRESET_TASKS['Balcony'];
        } else {
            // Fallback to strict matching or Other
            const roomKey = Object.keys(PRESET_TASKS).find(key => roomName.includes(key)) || 'Other';
            tasksToAdd = PRESET_TASKS[roomKey];
        }

        if (!tasksToAdd || tasksToAdd.length === 0) {
            showToast('No presets found for this room', 'error');
            return;
        }

        if (!confirm(`Add ${tasksToAdd.length} default tasks to ${roomName}?`)) return;

        try {
            const batch = writeBatch(db);
            const collectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`);

            tasksToAdd.forEach(title => {
                const docRef = doc(collectionRef);
                batch.set(docRef, {
                    title,
                    propertyId,
                    room: roomName,
                    isCompleted: false,
                    createdAt: Date.now()
                });
            });

            await batch.commit();
            showToast(`Added default tasks for ${roomName}`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to add room presets', 'error');
        }
    }, [user, propertyId, showToast]);

    return {
        tasks,
        isLoading,
        addTask,
        toggleTask,
        deleteTask,
        resetTasks,
        initializePresets,
        addRoomPresets
    };
}
