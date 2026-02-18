
import { InventoryNeed, InventoryLog, InventoryMasterItem } from '@lib/types';

export interface IInventoryRepository {
    // Queries (Subscriptions)
    subscribeToNeeds(userId: string, callback: (needs: InventoryNeed[]) => void): () => void;
    subscribeToLogs(userId: string, callback: (logs: InventoryLog[]) => void): () => void;
    subscribeToMasterItems(userId: string, callback: (items: InventoryMasterItem[]) => void): () => void;

    // Mutations
    markRestocked(userId: string, need: InventoryNeed): Promise<void>;
    addMasterItem(userId: string, category: string, item: string): Promise<string>;
    updateMasterItem(userId: string, itemId: string, updates: Partial<InventoryMasterItem>): Promise<void>;
    deleteMasterItem(userId: string, itemId: string): Promise<void>;
}
