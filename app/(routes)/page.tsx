import React from 'react';
import { ClientAuthGuard } from '@components/providers/ClientAuthGuard';
import { DashboardHome } from '@components/dashboard/DashboardHome';

export default function HomePage() {
  return (
    <ClientAuthGuard>
      <DashboardHome />
    </ClientAuthGuard>
  );
}