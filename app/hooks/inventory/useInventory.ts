import { useState, useCallback } from 'react';
import { useApp } from '@components/providers/AppProvider';
import { useStore } from '@store/useStore';
import { InventoryNeed, InventoryMasterItem } from '@lib/types';
import { inventoryService } from '@services/index';

export function useInventory() {
    const { user } = useApp();
    const showToast = useStore(state => state.showToast);
    const needs = useStore(state => state.needs);
    const logs = useStore(state => state.logs);
    const masterItems = useStore(state => state.masterItems);
    const isLoading = useStore(state => state.isInventoryLoading);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const markRestocked = useCallback(async (need: InventoryNeed) => {
        setProcessingId(need.id);

        try {
            await inventoryService.markRestocked(user?.uid, need);
            showToast("Item marked as restocked", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to update inventory", "error");
        } finally {
            setProcessingId(null);
        }
    }, [user, showToast]);

    const addMasterItem = useCallback(async (category: string, item: string) => {
        try {
            const id = await inventoryService.addMasterItem(user?.uid, category, item);
            showToast("Item added to master list", "success");
            return id;
        } catch (error) {
            console.error("Error adding master item:", error);
            showToast("Failed to add item", "error");
        }
    }, [user, showToast]);

    const updateMasterItem = useCallback(async (id: string, updates: Partial<InventoryMasterItem>) => {
        try {
            await inventoryService.updateMasterItem(user?.uid, id, updates);
            showToast("Item updated", "success");
        } catch (error) {
            console.error("Error updating master item:", error);
            showToast("Failed to update item", "error");
        }
    }, [user, showToast]);

    const deleteMasterItem = useCallback(async (id: string) => {
        try {
            await inventoryService.deleteMasterItem(user?.uid, id);
            showToast("Item deleted", "success");
        } catch (error) {
            console.error("Error deleting master item:", error);
            showToast("Failed to delete item", "error");
        }
    }, [user, showToast]);

    return {
        needs,
        logs,
        masterItems,
        isLoading,
        processingId,
        refresh: () => { },
        markRestocked,
        addMasterItem,
        updateMasterItem,
        deleteMasterItem
    };
}
