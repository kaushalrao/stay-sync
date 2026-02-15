import { useState, useCallback, useEffect } from 'react';
import { collection, query, getDocs, limit, writeBatch, doc, addDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';
import { InventoryNeed, InventoryLog, InventoryMasterItem } from '@lib/types';
import { CONSUMABLE_ITEMS } from '@constants/cleaning';

export function useInventory() {
    const { user, showToast } = useApp();
    const [needs, setNeeds] = useState<InventoryNeed[]>([]);
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [masterItems, setMasterItems] = useState<InventoryMasterItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // 1. Fetch Needs
            const needsQuery = query(
                collection(db, `artifacts/${appId}/users/${user.uid}/inventory-needs`)
            );
            const needsSnap = await getDocs(needsQuery);
            const fetchedNeeds = needsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryNeed[];

            fetchedNeeds.sort((a, b) => b.createdAt - a.createdAt);
            setNeeds(fetchedNeeds);

            // 2. Fetch History
            const logsQuery = query(
                collection(db, `artifacts/${appId}/users/${user.uid}/inventory-logs`),
                limit(50)
            );
            const logsSnap = await getDocs(logsQuery);
            const fetchedLogs = logsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryLog[];

            fetchedLogs.sort((a, b) => b.createdAt - a.createdAt);
            setLogs(fetchedLogs);

            // 3. Fetch Master Inventory (with migration check)
            const masterQuery = query(
                collection(db, `artifacts/${appId}/users/${user.uid}/inventory-master`)
            );
            const masterSnap = await getDocs(masterQuery);

            let fetchedMasterItems = masterSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryMasterItem[];

            // Migration: If empty, seed from constants
            if (fetchedMasterItems.length === 0 && Object.keys(CONSUMABLE_ITEMS).length > 0) {
                console.log("Seeding Master Inventory from constants...");
                const batch = writeBatch(db);
                fetchedMasterItems = []; // Reset locally to populate

                Object.entries(CONSUMABLE_ITEMS).forEach(([category, items]) => {
                    items.forEach(item => {
                        const newRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/inventory-master`));
                        const newItem: InventoryMasterItem = {
                            id: newRef.id,
                            category,
                            item,
                            createdAt: Date.now()
                        };
                        batch.set(newRef, newItem); // Use set instead of add to include ID if needed or just data
                        // Actually better to just save data without ID field if ID is doc.id, but type expects ID.
                        // Firestore doc data usually doesn't strictly need ID if we map it back. 
                        // But let's save what we map.
                        batch.set(newRef, {
                            category,
                            item,
                            createdAt: Date.now()
                        });
                        fetchedMasterItems.push({ ...newItem, id: newRef.id });
                    });
                });

                await batch.commit();
                console.log("Seeding complete.");
            }

            // Sort by category then item name
            fetchedMasterItems.sort((a, b) => {
                if (a.category !== b.category) return a.category.localeCompare(b.category);
                return a.item.localeCompare(b.item);
            });

            setMasterItems(fetchedMasterItems);

        } catch (error) {
            console.error("Error fetching inventory:", error);
            showToast("Failed to load inventory data", "error");
        } finally {
            setIsLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            fetchData();

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
            fetchData(); // Refresh to get the new item with ID
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
            fetchData();
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
            fetchData();
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
        refresh: fetchData,
        markRestocked,
        addMasterItem,
        updateMasterItem,
        deleteMasterItem
    };
}
