"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@components/providers/AppProvider';
import { Loader } from '@components/ui/Loader';

export function ClientAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <Loader className="min-h-screen flex items-center justify-center" iconClassName="text-indigo-500" size={48} />;
    }

    return <>{children}</>;
}
