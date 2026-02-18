
import { IInventoryRepository } from './repository.interface';
import { FirebaseInventoryRepository } from './firebase.repository';
import { InventoryNeed, InventoryLog, InventoryMasterItem } from '@lib/types';

export class InventoryService {
    private repo: IInventoryRepository;

    constructor(repo: IInventoryRepository = new FirebaseInventoryRepository()) {
        this.repo = repo;
    }

    // --- Subscriptions ---

    subscribeToNeeds(userId: string | undefined | null, callback: (needs: InventoryNeed[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToNeeds(userId, callback);
    }

    subscribeToLogs(userId: string | undefined | null, callback: (logs: InventoryLog[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToLogs(userId, callback);
    }

    subscribeToMasterItems(userId: string | undefined | null, callback: (items: InventoryMasterItem[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToMasterItems(userId, callback);
    }

    // --- Mutations ---

    async markRestocked(userId: string | undefined | null, need: InventoryNeed) {
        if (!userId) throw new Error("User ID required");
        return this.repo.markRestocked(userId, need);
    }

    async addMasterItem(userId: string | undefined | null, category: string, item: string) {
        if (!userId) throw new Error("User ID required");
        return this.repo.addMasterItem(userId, category, item);
    }

    async updateMasterItem(userId: string | undefined | null, itemId: string, updates: Partial<InventoryMasterItem>) {
        if (!userId) throw new Error("User ID required");
        return this.repo.updateMasterItem(userId, itemId, updates);
    }

    async deleteMasterItem(userId: string | undefined | null, itemId: string) {
        if (!userId) throw new Error("User ID required");
        return this.repo.deleteMasterItem(userId, itemId);
    }
}

export const inventoryService = new InventoryService();
