"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { SidebarLayoutProps } from '@/app/lib/types';

export function SidebarLayout({ children }: SidebarLayoutProps) {
    const pathname = usePathname();

    const isAuth = pathname === '/auth' || pathname.startsWith('/auth/');

    const showSidebar = !isAuth;

    if (!showSidebar) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 lg:pl-64 w-full pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
