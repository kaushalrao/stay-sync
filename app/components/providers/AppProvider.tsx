"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@lib/firebase';
import { Toast } from '@components/ui/Toast';

interface AppContextType {
    user: User | null;
    loading: boolean;
}

const AppContext = createContext<AppContextType>({
    user: null,
    loading: true,
});

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);


    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loading = authLoading;

    return (
        <AppContext.Provider value={{ user, loading }}>
            {children}
            <Toast />
        </AppContext.Provider>
    );
};
