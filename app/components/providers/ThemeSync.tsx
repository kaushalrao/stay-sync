"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@store/useStore';

export function ThemeSync() {
    const theme = useStore(state => state.theme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
            // We don't need to manually save to localStorage as persist middleware handles it
        }
    }, [theme, mounted]);

    return null;
}
