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

    useEffect(() => {
        if (!user) return;

        // --- CORE DATA LISTENERS ---
        const unsubProps = propertyService.subscribeToProperties(user.uid, (props) => {
            setProperties(props);
            setIsPropertiesLoading(false);
        });

        const unsubTemplates = templateService.subscribeToTemplates(user.uid, (temps) => {
            setTemplates(temps);
            setIsTemplatesLoading(false);
        });

        const unsubIssues = maintenanceService.subscribeToIssues(user.uid, (issues) => {
            setIssues(issues);
            setIsIssuesLoading(false);
        });

        setIsGuestsLoading(true);
        guestService.getGuests(user.uid, null, 20)
            .then(({ guests, lastDoc }) => {
                setGuests(guests, lastDoc);
            })
            .catch(err => console.error(err))
            .finally(() => setIsGuestsLoading(false));

        // --- INVENTORY LISTENERS ---
        const unsubNeeds = inventoryService.subscribeToNeeds(user.uid, (fetchedNeeds) => {
            setNeeds(fetchedNeeds);
            setIsInventoryLoading(false);
        });

        const unsubLogs = inventoryService.subscribeToLogs(user.uid, (fetchedLogs) => {
            setLogs(fetchedLogs);
        });

        const unsubMaster = inventoryService.subscribeToMasterItems(user.uid, (fetchedMasterItems) => {
            setMasterItems(fetchedMasterItems);
        });

        // --- CLEANING LISTENERS ---
        const unsubTasks = cleaningService.subscribeToTasks(user.uid, (fetchedTasks) => {
            setTasks(fetchedTasks);
            setIsCleaningLoading(false);
        });

        return () => {
            unsubNeeds();
            unsubLogs();
            unsubMaster();
            unsubTasks();
            unsubProps();
            unsubTemplates();
            unsubIssues();
            // unsubGuests();
        };
    }, [
        user,
        setNeeds,
        setLogs,
        setMasterItems,
        setIsInventoryLoading,
        setTasks,
        setIsCleaningLoading,
        setProperties,
        setIsPropertiesLoading,
        setTemplates,
        setIsTemplatesLoading,
        setIssues,
        setIsIssuesLoading,
        setGuests,
        setIsGuestsLoading
    ]);

    return null;
}
