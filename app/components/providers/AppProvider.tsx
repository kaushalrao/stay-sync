"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@lib/firebase';
import { Property, Template, MaintenanceIssue } from '@lib/types';
import { Toast } from '@components/ui/Toast';
import { useStore } from '@store/useStore';

interface AppContextType {
    user: User | null;
    loading: boolean;
    properties: Property[];
    templates: Template[];
    issues: MaintenanceIssue[];
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextType>({
    user: null,
    loading: true,
    properties: [],
    templates: [],
    issues: [],
    showToast: () => { },
});

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Core application data from global store
    const properties = useStore(state => state.properties);
    const templates = useStore(state => state.templates);
    const issues = useStore(state => state.issues);
    const isPropertiesLoading = useStore(state => state.isPropertiesLoading);
    const showToast = useStore(state => state.showToast);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loading = authLoading || isPropertiesLoading;

    return (
        <AppContext.Provider value={{ user, loading, properties, templates, issues, showToast }}>
            {children}
            <Toast />
        </AppContext.Provider>
    );
};
