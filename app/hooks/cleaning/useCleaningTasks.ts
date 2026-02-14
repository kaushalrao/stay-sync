import { useState, useEffect, useCallback } from 'react';
import {
    collection, query, onSnapshot, addDoc, updateDoc,
    deleteDoc, doc, writeBatch, where
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { CleaningTask } from '@lib/types';
import { PRESET_TASKS, STANDARD_ROOMS } from '@constants/cleaning';
import { useApp } from '@components/providers/AppProvider';

export function useCleaningTasks(propertyId: string) {
    const { user, showToast } = useApp();
    const [tasks, setTasks] = useState<CleaningTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !propertyId) {
            setTasks([]);
            setIsLoading(false);
            return;
        }

        const q = query(
            collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`),
            where("propertyId", "==", propertyId)
        );

        const qAll = query(collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`));

        const unsubscribe = onSnapshot(qAll, (snapshot) => {
            const allTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CleaningTask[];
            // Client side filter to match selected property
            setTasks(allTasks.filter(t => t.propertyId === propertyId));
            setIsLoading(false);
        }, (error) => {
            console.error(error);
            showToast('Failed to load tasks', 'error');
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, propertyId, showToast]);

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

    return {
        tasks,
        isLoading,
        addTask,
        toggleTask,
        deleteTask,
        resetTasks,
        initializePresets
    };
}
