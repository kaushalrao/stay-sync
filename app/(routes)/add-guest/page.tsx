import React from 'react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { WizardContainer } from '@components/add-guest/WizardContainer';

export default function AddGuestPage() {
    return (
        <ClientAuthGuard>
            <WizardContainer />
        </ClientAuthGuard>
    );
}
