import { ICleaningRepository } from './repository.interface';
import { FirebaseCleaningRepository } from './firebase.repository';
import { PRESET_TASKS } from '@constants/cleaning';
import { CleaningTask } from '@/app/lib/types';

export class CleaningService {
    private repo: ICleaningRepository;

    constructor(repo: ICleaningRepository = new FirebaseCleaningRepository()) {
        this.repo = repo;
    }

    // --- Task Management ---
    async addTask(propertyId: string, title: string, room: string) {
        return this.repo.addTask({
            propertyId,
            title,
            room: room.toLowerCase()
        });
    }

    async toggleTask(taskId: string, currentStatus: boolean) {
        return this.repo.updateTaskStatus(taskId, !currentStatus);
    }

    async deleteTask(taskId: string) {
        return this.repo.deleteTask(taskId);
    }

    async resetTasks(tasks: CleaningTask[]) {
        const completedIds = tasks.filter(t => t.isCompleted).map(t => t.id);
        if (completedIds.length === 0) return;
        return this.repo.resetTasks(completedIds);
    }

    subscribeToTasks(callback: (tasks: CleaningTask[]) => void) {
        return this.repo.subscribeToTasks(callback);
    }

    // --- Presets ---

    async initializePresets(propertyId: string) {
        const tasks: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>[] = [];

        Object.entries(PRESET_TASKS).forEach(([room, titles]) => {
            titles.forEach(title => {
                tasks.push({ propertyId, room, title });
            });
        });

        await this.repo.addPresets(tasks);
    }

    // ... Additional room logic wrappers ...

    async addRoomPresets(propertyId: string, roomName: string) {
        const lowerRoom = roomName.toLowerCase();
        let tasksToAdd: string[] = [];

        // Simple matching logic
        if (lowerRoom.includes('living') || lowerRoom.includes('lounge')) {
            tasksToAdd = PRESET_TASKS['Living'];
        } else if (lowerRoom.includes('kitchen')) {
            tasksToAdd = PRESET_TASKS['Kitchen'];
        } else if (lowerRoom.includes('bath') || lowerRoom.includes('toilet') || lowerRoom.includes('restroom')) {
            tasksToAdd = PRESET_TASKS['Bathroom 1'];
        } else if (lowerRoom.includes('bedroom') || lowerRoom.includes('bed')) {
            tasksToAdd = PRESET_TASKS['Bedroom 1'];
        } else if (lowerRoom.includes('balcony') || lowerRoom.includes('terrace')) {
            tasksToAdd = PRESET_TASKS['Balcony'];
        } else {
            const roomKey = Object.keys(PRESET_TASKS).find(key => roomName.includes(key)) || 'Other';
            tasksToAdd = PRESET_TASKS[roomKey];
        }

        if (!tasksToAdd || tasksToAdd.length === 0) {
            throw new Error('No presets found for this room');
        }

        const tasksInfo = tasksToAdd.map(title => ({
            propertyId,
            room: roomName,
            title
        }));

        await this.repo.addPresets(tasksInfo);
    }

    // --- Room Management ---

    async updateRoomOrder(propertyId: string, order: string[]) {
        return this.repo.saveRoomOrder(propertyId, order);
    }

    async setRoomType(propertyId: string, roomName: string, type: string) {
        return this.repo.saveRoomType(propertyId, roomName, type);
    }

    async renameRoom(propertyId: string, oldName: string, newName: string, allRooms: string[], newType?: string) {
        return this.repo.renameRoom(propertyId, oldName, newName, allRooms, newType);
    }

    async deleteRoom(propertyId: string, roomName: string, currentOrder: string[]) {
        return this.repo.deleteRoom(propertyId, roomName, currentOrder);
    }

    async addRoom(propertyId: string, roomName: string, currentOrder: string[], type: string) {
        return this.repo.addRoom(propertyId, roomName, currentOrder, type);
    }

    async resetRoomSettings(propertyId: string) {
        return this.repo.resetRoomSettings(propertyId);
    }

    getRoomSettings(propertyId: string, callback: (settings: any) => void) {
        return this.repo.getRoomSettings(propertyId, callback);
    }
}

export const cleaningService = new CleaningService();
