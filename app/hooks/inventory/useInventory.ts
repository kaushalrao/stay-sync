import { useState } from 'react';
import { collection, writeBatch, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';
import { useStore } from '@store/useStore';
import { InventoryNeed, InventoryMasterItem } from '@lib/types';


export function useInventory() {
    const { user, showToast } = useApp();
    const needs = useStore(state => state.needs);
    const logs = useStore(state => state.logs);
    const masterItems = useStore(state => state.masterItems);
    const isLoading = useStore(state => state.isInventoryLoading);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const markRestocked = async (need: InventoryNeed) => {
        if (!user) return;
        setProcessingId(need.id);

        try {
            const batch = writeBatch(db);

            // 1. Delete from needs
            const needRef = doc(db, `artifacts/${appId}/users/${user.uid}/inventory-needs`, need.id);
            batch.delete(needRef);

            // 2. Add to logs
            const logRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/inventory-logs`));
            batch.set(logRef, {
                item: need.item,
                quantity: need.quantity,
                propertyId: need.propertyId,
                room: need.room,
                type: 'restock',
                createdAt: Date.now()
            });

            await batch.commit();
            showToast("Item marked as restocked", "success");

        } catch (error) {
            console.error(error);
            showToast("Failed to update inventory", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const addMasterItem = async (category: string, item: string) => {
        if (!user) return;
        try {
            const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/inventory-master`), {
                category,
                item,
                createdAt: Date.now()
            });
            showToast("Item added to master list", "success");
            return docRef.id;
        } catch (error) {
            console.error("Error adding master item:", error);
            showToast("Failed to add item", "error");
        }
    };

    const updateMasterItem = async (id: string, updates: Partial<InventoryMasterItem>) => {
        if (!user) return;
        try {
            const itemRef = doc(db, `artifacts/${appId}/users/${user.uid}/inventory-master`, id);
            await updateDoc(itemRef, updates);
            showToast("Item updated", "success");
        } catch (error) {
            console.error("Error updating master item:", error);
            showToast("Failed to update item", "error");
        }
    };

    const deleteMasterItem = async (id: string) => {
        if (!user) return;
        try {
            const itemRef = doc(db, `artifacts/${appId}/users/${user.uid}/inventory-master`, id);
            await deleteDoc(itemRef);
            showToast("Item deleted", "success");
        } catch (error) {
            console.error("Error deleting master item:", error);
            showToast("Failed to delete item", "error");
        }
    };

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
