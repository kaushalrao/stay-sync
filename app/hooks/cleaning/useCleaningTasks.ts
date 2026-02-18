import { useCallback } from 'react';
import { useApp } from '@components/providers/AppProvider';
import { useStore } from '@store/useStore';
import { cleaningService } from '@services/cleaning/cleaning.service';

export function useCleaningTasks(propertyId: string) {
    const { user } = useApp();
    const showToast = useStore(state => state.showToast);
    const allTasks = useStore(state => state.tasks);
    const isLoading = useStore(state => state.isCleaningLoading);
    const tasks = (allTasks || []).filter(t => t.propertyId === propertyId);

    const addTask = useCallback(async (title: string, room: string) => {
        if (!user || !propertyId) return false;
        try {
            await cleaningService.addTask(user.uid, propertyId, title, room);
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
            await cleaningService.toggleTask(user.uid, taskId, currentStatus);
        } catch (error) {
            console.error(error);
            showToast('Failed to update task', 'error');
        }
    }, [user, showToast]);

    const deleteTask = useCallback(async (taskId: string) => {
        if (!user) return;
        if (!confirm('Delete this task?')) return;
        try {
            await cleaningService.deleteTask(user.uid, taskId);
            showToast('Task deleted', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to delete task', 'error');
        }
    }, [user, showToast]);

    const resetTasks = useCallback(async (showConfirmation = true) => {
        if (!user || !tasks.length) return;
        const completedTasks = tasks.filter(t => t.isCompleted);

        if (completedTasks.length === 0) {
            if (showConfirmation) showToast("No completed tasks to reset.", "success");
            return;
        }

        if (showConfirmation && !confirm('Are you sure you want to reset all tasks?')) return;

        try {
            await cleaningService.resetTasks(user.uid, tasks);
            if (showConfirmation) showToast("All tasks reset successfully!", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to reset tasks", "error");
        }
    }, [user, tasks, showToast]);

    const initializePresets = useCallback(async () => {
        if (!user || !propertyId) return;
        if (!confirm('Add default tasks?')) return;
        try {
            await cleaningService.initializePresets(user.uid, propertyId);
            showToast('Presets added', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed', 'error');
        }
    }, [user, propertyId, showToast]);

    const addRoomPresets = useCallback(async (roomName: string) => {
        if (!user || !propertyId) return;
        if (!confirm(`Add default tasks to ${roomName}?`)) return;

        try {
            await cleaningService.addRoomPresets(user.uid, propertyId, roomName);
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
