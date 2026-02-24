
import { InventoryNeed, InventoryLog, InventoryMasterItem } from '@lib/types';

export interface IInventoryRepository {
    // Queries (Subscriptions)
    subscribeToNeeds(callback: (needs: InventoryNeed[]) => void): () => void;
    subscribeToLogs(callback: (logs: InventoryLog[]) => void): () => void;
    subscribeToMasterItems(callback: (items: InventoryMasterItem[]) => void): () => void;

    // Mutations
    markRestocked(need: InventoryNeed): Promise<void>;
    addMasterItem(category: string, item: string): Promise<string>;
    updateMasterItem(itemId: string, updates: Partial<InventoryMasterItem>): Promise<void>;
    deleteMasterItem(itemId: string): Promise<void>;
}
