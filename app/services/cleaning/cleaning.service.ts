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

    async addTask(userId: string, propertyId: string, title: string, room: string) {
        return this.repo.addTask(userId, {
            propertyId,
            title,
            room: room.toLowerCase()
        });
    }

    async toggleTask(userId: string, taskId: string, currentStatus: boolean) {
        return this.repo.updateTaskStatus(userId, taskId, !currentStatus);
    }

    async deleteTask(userId: string, taskId: string) {
        return this.repo.deleteTask(userId, taskId);
    }

    async resetTasks(userId: string, tasks: CleaningTask[]) {
        const completedIds = tasks.filter(t => t.isCompleted).map(t => t.id);
        if (completedIds.length === 0) return;
        return this.repo.resetTasks(userId, completedIds);
    }

    subscribeToTasks(userId: string | undefined | null, callback: (tasks: CleaningTask[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToTasks(userId, callback);
    }

    // --- Presets ---

    async initializePresets(userId: string, propertyId: string) {
        const tasks: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>[] = [];

        Object.entries(PRESET_TASKS).forEach(([room, titles]) => {
            titles.forEach(title => {
                tasks.push({ propertyId, room, title });
            });
        });

        await this.repo.addPresets(userId, tasks);
    }

    // ... Additional room logic wrappers ...

    async addRoomPresets(userId: string, propertyId: string, roomName: string) {
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

        await this.repo.addPresets(userId, tasksInfo);
    }

    // --- Room Management ---

    async updateRoomOrder(userId: string, propertyId: string, order: string[]) {
        return this.repo.saveRoomOrder(userId, propertyId, order);
    }

    async setRoomType(userId: string, propertyId: string, roomName: string, type: string) {
        return this.repo.saveRoomType(userId, propertyId, roomName, type);
    }

    async renameRoom(userId: string, propertyId: string, oldName: string, newName: string, allRooms: string[], newType?: string) {
        return this.repo.renameRoom(userId, propertyId, oldName, newName, allRooms, newType);
    }

    async deleteRoom(userId: string, propertyId: string, roomName: string, currentOrder: string[]) {
        return this.repo.deleteRoom(userId, propertyId, roomName, currentOrder);
    }

    async addRoom(userId: string, propertyId: string, roomName: string, currentOrder: string[], type: string) {
        return this.repo.addRoom(userId, propertyId, roomName, currentOrder, type);
    }

    async resetRoomSettings(userId: string, propertyId: string) {
        return this.repo.resetRoomSettings(userId, propertyId);
    }

    getRoomSettings(userId: string, propertyId: string, callback: (settings: any) => void) {
        return this.repo.getRoomSettings(userId, propertyId, callback);
    }
}

export const cleaningService = new CleaningService();
