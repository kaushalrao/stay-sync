import React from 'react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { InventoryDashboard } from '@components/inventory/InventoryDashboard';

export default function InventoryPage() {
    return (
        <ClientAuthGuard>
            <div className="mx-auto w-full px-0 md:px-8 py-0 md:py-6 safe-area-top h-screen overflow-hidden">
                <InventoryDashboard />
            </div>
        </ClientAuthGuard>
    );
}
