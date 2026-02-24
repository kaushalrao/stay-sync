import { CleaningTask, RoomSettings } from "@/app/lib/types";

export interface ICleaningRepository {
    // Task Management
    addTask(task: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>): Promise<string>;
    updateTaskStatus(taskId: string, isCompleted: boolean): Promise<void>;
    deleteTask(taskId: string): Promise<void>;
    resetTasks(taskIds: string[]): Promise<void>;

    // Subscriptions
    subscribeToTasks(callback: (tasks: CleaningTask[]) => void): () => void;

    // Presets
    addPresets(tasks: Omit<CleaningTask, 'id' | 'createdAt' | 'isCompleted'>[]): Promise<void>;

    // Room Settings
    saveRoomOrder(propertyId: string, order: string[]): Promise<void>;
    saveRoomType(propertyId: string, roomName: string, type: string): Promise<void>;

    // Complex Operations
    renameRoom(propertyId: string, oldName: string, newName: string, allRooms: string[], newType?: string): Promise<void>;
    deleteRoom(propertyId: string, roomName: string, currentOrder: string[]): Promise<void>;
    addRoom(propertyId: string, roomName: string, currentOrder: string[], type: string): Promise<void>;

    // Settings
    getRoomSettings(propertyId: string, callback: (settings: RoomSettings) => void): () => void;
    resetRoomSettings(propertyId: string): Promise<void>;
}
