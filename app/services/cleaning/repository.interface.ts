import { CleaningTask, RoomSettings } from "@/app/lib/types";

export interface ICleaningRepository {
    // Task Management
    addTask(userId: string, task: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>): Promise<string>;
    updateTaskStatus(userId: string, taskId: string, isCompleted: boolean): Promise<void>;
    deleteTask(userId: string, taskId: string): Promise<void>;
    resetTasks(userId: string, taskIds: string[]): Promise<void>;

    // Subscriptions
    subscribeToTasks(userId: string, callback: (tasks: CleaningTask[]) => void): () => void;

    // Presets
    addPresets(userId: string, tasks: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>[]): Promise<void>;

    // Room Settings
    saveRoomOrder(userId: string, propertyId: string, order: string[]): Promise<void>;
    saveRoomType(userId: string, propertyId: string, roomName: string, type: string): Promise<void>;

    // Complex Operations
    renameRoom(userId: string, propertyId: string, oldName: string, newName: string, allRooms: string[], newType?: string): Promise<void>;
    deleteRoom(userId: string, propertyId: string, roomName: string, currentOrder: string[]): Promise<void>;
    addRoom(userId: string, propertyId: string, roomName: string, currentOrder: string[], type: string): Promise<void>;

    // Settings
    getRoomSettings(userId: string, propertyId: string, callback: (settings: RoomSettings) => void): () => void;
    resetRoomSettings(userId: string, propertyId: string): Promise<void>;
}
