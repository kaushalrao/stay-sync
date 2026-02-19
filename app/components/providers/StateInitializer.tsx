"use client";

import { useEffect } from 'react';
import { useApp } from './AppProvider';
import { useStore } from '@store/useStore';
import { inventoryService, cleaningService, maintenanceService, propertyService, templateService, guestService } from '@services/index';

export function StateInitializer() {
    const { user } = useApp();
    const {
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
    } = useStore();

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
                const { setGuests } = useStore.getState();
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
