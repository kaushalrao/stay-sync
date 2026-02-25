import React from 'react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { AnalyticsClient } from '@components/analytics/AnalyticsClient';

export default function AnalyticsPage() {
    return (
        <ClientAuthGuard>
            <AnalyticsClient />
        </ClientAuthGuard>
    );
}
