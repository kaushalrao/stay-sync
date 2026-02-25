import React from 'react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { MaintenanceClient } from '@components/maintenance/MaintenanceClient';

export default function MaintenancePage() {
    return (
        <ClientAuthGuard>
            <MaintenanceClient />
        </ClientAuthGuard>
    );
}
