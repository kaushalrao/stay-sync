"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@components/providers/AppProvider';
import { Loader } from '@components/ui/Loader';
import { InventoryDashboard } from '@components/inventory/InventoryDashboard';

export default function InventoryPage() {
    const { user, loading } = useApp();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <Loader className="min-h-screen flex items-center justify-center" iconClassName="text-emerald-500" size={48} />;
    }

    return (
        <div className="mx-auto w-full px-0 md:px-8 py-0 md:py-6 safe-area-top h-screen overflow-hidden">
            <InventoryDashboard />
        </div>
    );
}
