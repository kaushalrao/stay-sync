"use client";

import { useEffect } from 'react';
import { useApp } from './AppProvider';
import {
    useInventoryStore,
    useCleaningStore,
    usePropertyStore,
    useTemplateStore,
    useMaintenanceStore,
    useGuestStore
} from '@store/index';
import { inventoryService, cleaningService, maintenanceService, propertyService, templateService, guestService } from '@services/index';

export function StateInitializer() {
    const { user } = useApp();

    // Inventory Store
    const setNeeds = useInventoryStore((state) => state.setNeeds);
    const setLogs = useInventoryStore((state) => state.setLogs);
    const setMasterItems = useInventoryStore((state) => state.setMasterItems);
    const setIsInventoryLoading = useInventoryStore((state) => state.setIsInventoryLoading);

    // Cleaning Store
    const setTasks = useCleaningStore((state) => state.setTasks);
    const setIsCleaningLoading = useCleaningStore((state) => state.setIsCleaningLoading);

    // Property Store
    const setProperties = usePropertyStore((state) => state.setProperties);
    const setIsPropertiesLoading = usePropertyStore((state) => state.setIsPropertiesLoading);

    // Template Store
    const setTemplates = useTemplateStore((state) => state.setTemplates);
    const setIsTemplatesLoading = useTemplateStore((state) => state.setIsTemplatesLoading);

    // Maintenance Store
    const setIssues = useMaintenanceStore((state) => state.setIssues);
    const setIsIssuesLoading = useMaintenanceStore((state) => state.setIsIssuesLoading);

    // Guest Store
    const setGuests = useGuestStore((state) => state.setGuests);
    const setIsGuestsLoading = useGuestStore((state) => state.setIsGuestsLoading);

    const properties = usePropertyStore((state) => state.properties);
    const isPropertiesLoading = usePropertyStore((state) => state.isPropertiesLoading);

    // --- PHASE 1: LOAD PROPERTIES ---
    useEffect(() => {
        if (!user) return;

        const unsubProps = propertyService.subscribeToProperties(user.uid, (props) => {
            setProperties(props);
            setIsPropertiesLoading(false);
        });

        return () => {
            unsubProps();
        };
    }, [user, setProperties, setIsPropertiesLoading]);

    // --- PHASE 2: LOAD DEPENDENT DATA ---
    useEffect(() => {
        if (!user) return;
        if (isPropertiesLoading) return;

        if (properties.length === 0) {
            setTemplates([]);
            setIsTemplatesLoading(false);
            setIssues([]);
            setIsIssuesLoading(false);
            setGuests([], null);
            setIsGuestsLoading(false);
            setNeeds([]);
            setLogs([]);
            setMasterItems([]);
            setIsInventoryLoading(false);
            setTasks([]);
            setIsCleaningLoading(false);
            return;
        }

        // --- At this point, `properties` are guaranteed loaded in Zustand 
        // which means the Repositories relying on `usePropertyStore.getState().properties` will function correctly.

        const unsubTemplates = templateService.subscribeToTemplates((temps) => {
            setTemplates(temps);
            setIsTemplatesLoading(false);
        });

        const unsubIssues = maintenanceService.subscribeToIssues((issues) => {
            setIssues(issues);
            setIsIssuesLoading(false);
        });

        setIsGuestsLoading(true);
        guestService.getGuests(null, 20)
            .then(({ guests, lastDoc }) => {
                setGuests(guests, lastDoc);
            })
            .catch(err => console.error(err))
            .finally(() => setIsGuestsLoading(false));

        // --- INVENTORY LISTENERS ---
        const unsubNeeds = inventoryService.subscribeToNeeds((fetchedNeeds) => {
            setNeeds(fetchedNeeds);
            setIsInventoryLoading(false);
        });

        const unsubLogs = inventoryService.subscribeToLogs((fetchedLogs) => {
            setLogs(fetchedLogs);
        });

        const unsubMaster = inventoryService.subscribeToMasterItems((fetchedMasterItems) => {
            setMasterItems(fetchedMasterItems);
        });

        // --- CLEANING LISTENERS ---
        const unsubTasks = cleaningService.subscribeToTasks((fetchedTasks) => {
            setTasks(fetchedTasks);
            setIsCleaningLoading(false);
        });

        return () => {
            unsubNeeds();
            unsubLogs();
            unsubMaster();
            unsubTasks();
            unsubTemplates();
            unsubIssues();
        };
    }, [
        user,
        properties,
        isPropertiesLoading,
        setNeeds,
        setLogs,
        setMasterItems,
        setIsInventoryLoading,
        setTasks,
        setIsCleaningLoading,
        setTemplates,
        setIsTemplatesLoading,
        setIssues,
        setIsIssuesLoading,
        setGuests,
        setIsGuestsLoading
    ]);

    return null;
}
