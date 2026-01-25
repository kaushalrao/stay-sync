"use client";

import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '../../lib/firebase';
import { Property, Template, ToastState } from '../../lib/types';
import { Toast } from '../ui/Toast';

interface AppContextType {
    user: User | null;
    loading: boolean;
    properties: Property[];
    templates: Template[];
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextType>({
    user: null,
    loading: true,
    properties: [],
    templates: [],
    showToast: () => { },
});

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<Property[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Data Fetching
    useEffect(() => {
        if (!user) {
            setProperties([]);
            setTemplates([]);
            return;
        }

        const qProps = query(collection(db, `artifacts/${appId}/users/${user.uid}/properties`));
        const unsubProps = onSnapshot(qProps, (snapshot) => {
            const props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
            setProperties(props);
        });

        const qTemps = query(collection(db, `artifacts/${appId}/users/${user.uid}/templates`));
        const unsubTemps = onSnapshot(qTemps, (snapshot) => {
            const temps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
            setTemplates(temps);
        });

        return () => {
            unsubProps();
            unsubTemps();
        };
    }, [user]);

    return (
        <AppContext.Provider value={{ user, loading, properties, templates, showToast }}>
            {children}
            <Toast toast={toast} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
        </AppContext.Provider>
    );
};
