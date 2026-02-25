import React from 'react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { CleaningChecklistClient } from '@components/cleaning/CleaningChecklistClient';

export default function CleaningChecklistPage() {
    return (
        <ClientAuthGuard>
            <CleaningChecklistClient />
        </ClientAuthGuard>
    );
}
