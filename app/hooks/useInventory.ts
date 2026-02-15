import { useState, useCallback, useEffect } from 'react';
import { collection, query, getDocs, limit, writeBatch, doc } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';
import { InventoryNeed, InventoryLog } from '@lib/types';

export function useInventory() {
    const { user, showToast } = useApp();
    const [needs, setNeeds] = useState<InventoryNeed[]>([]);
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Fetch Needs
            // Potential Optimization: Real-time listeners (onSnapshot) instead of getDocs
            // For now sticking to getDocs as per original logic to minimize reads if not needed
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

            // Fetch History
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

            // Optimistic update could be done here, but refreshing ensures data consistency
            fetchData();

        } catch (error) {
            console.error(error);
            showToast("Failed to update inventory", "error");
        } finally {
            setProcessingId(null);
        }
    };

    return {
        needs,
        logs,
        isLoading,
        processingId,
        refresh: fetchData,
        markRestocked
    };
}
