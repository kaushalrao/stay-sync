import React from 'react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { GreeterPageClient } from '@components/greeter/GreeterPageClient';

export default function GreeterPage() {
    return (
        <ClientAuthGuard>
            <GreeterPageClient />
        </ClientAuthGuard>
    );
}
