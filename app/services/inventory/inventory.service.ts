
import { IInventoryRepository } from './repository.interface';
import { FirebaseInventoryRepository } from './firebase.repository';
import { InventoryNeed, InventoryLog, InventoryMasterItem } from '@lib/types';

export class InventoryService {
    private repo: IInventoryRepository;

    constructor(repo: IInventoryRepository = new FirebaseInventoryRepository()) {
        this.repo = repo;
    }

    // --- Subscriptions ---

    subscribeToNeeds(callback: (needs: InventoryNeed[]) => void) {
        return this.repo.subscribeToNeeds(callback);
    }

    subscribeToLogs(callback: (logs: InventoryLog[]) => void) {
        return this.repo.subscribeToLogs(callback);
    }

    subscribeToMasterItems(callback: (items: InventoryMasterItem[]) => void) {
        return this.repo.subscribeToMasterItems(callback);
    }

    // --- Mutations ---

    async markRestocked(need: InventoryNeed) {
        return this.repo.markRestocked(need);
    }

    async addMasterItem(category: string, item: string) {
        return this.repo.addMasterItem(category, item);
    }

    async updateMasterItem(itemId: string, updates: Partial<InventoryMasterItem>) {
        return this.repo.updateMasterItem(itemId, updates);
    }

    async deleteMasterItem(itemId: string) {
        return this.repo.deleteMasterItem(itemId);
    }
}

export const inventoryService = new InventoryService();
