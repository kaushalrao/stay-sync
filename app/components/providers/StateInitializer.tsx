"use client";

import { useEffect } from 'react';
import { collection, query, onSnapshot, limit } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from './AppProvider';
import { useStore } from '@store/useStore';
import { InventoryNeed, InventoryLog, InventoryMasterItem, CleaningTask } from '@lib/types';

import { dataService } from '@services/index';

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
        const unsubProps = dataService.properties.subscribe(user.uid, (props) => {
            setProperties(props);
            setIsPropertiesLoading(false);
        }, (err) => {
            console.error("Firestore Properties Error:", err);
            setIsPropertiesLoading(false);
        });

        const unsubTemplates = dataService.templates.subscribe(user.uid, (temps) => {
            setTemplates(temps);
            setIsTemplatesLoading(false);
        }, (err) => {
            console.error("Firestore Templates Error:", err);
            setIsTemplatesLoading(false);
        });

        const unsubIssues = dataService.maintenance.subscribe(user.uid, (issues) => {
            setIssues(issues);
            setIsIssuesLoading(false);
        }, (err) => {
            console.error("Firestore Issues Error:", err);
            setIsIssuesLoading(false);
        });

        const unsubGuests = dataService.guests.subscribe(user.uid, (guests) => {
            setGuests(guests);
            setIsGuestsLoading(false);
        }, (err) => {
            console.error("Firestore Guests Error:", err);
            setIsGuestsLoading(false);
        });

        // --- INVENTORY LISTENERS ---
        const needsQuery = query(
            collection(db, `artifacts/${appId}/users/${user.uid}/inventory-needs`)
        );

        const logsQuery = query(
            collection(db, `artifacts/${appId}/users/${user.uid}/inventory-logs`),
            limit(50)
        );

        const masterQuery = query(
            collection(db, `artifacts/${appId}/users/${user.uid}/inventory-master`)
        );

        const unsubNeeds = onSnapshot(needsQuery, (snapshot) => {
            const fetchedNeeds = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryNeed[];
            fetchedNeeds.sort((a, b) => b.createdAt - a.createdAt);
            setNeeds(fetchedNeeds);
            setIsInventoryLoading(false);
        }, (error) => {
            console.error("Firestore Needs Error:", error);
            setIsInventoryLoading(false);
        });

        const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
            const fetchedLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryLog[];
            fetchedLogs.sort((a, b) => b.createdAt - a.createdAt);
            setLogs(fetchedLogs);
        }, (error) => console.error("Firestore Logs Error:", error));

        const unsubMaster = onSnapshot(masterQuery, (snapshot) => {
            const fetchedMasterItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryMasterItem[];
            fetchedMasterItems.sort((a, b) => {
                if (a.category !== b.category) return a.category.localeCompare(b.category);
                return a.item.localeCompare(b.item);
            });
            setMasterItems(fetchedMasterItems);
        }, (error) => console.error("Firestore Master Error:", error));

        // --- CLEANING LISTENERS ---
        const tasksQuery = query(
            collection(db, `artifacts/${appId}/users/${user.uid}/cleaning-tasks`)
        );

        const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CleaningTask[];
            setTasks(fetchedTasks);
            setIsCleaningLoading(false);
        }, (error) => {
            console.error("Firestore Tasks Error:", error);
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
            unsubGuests();
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
