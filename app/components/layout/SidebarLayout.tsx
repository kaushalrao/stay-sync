"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { SidebarLayoutProps } from '@/app/lib/types';

import { Loader } from '../ui/Loader';

export function SidebarLayout({ children }: SidebarLayoutProps) {
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = React.useState(false);
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Reset loading state when pathname changes
    React.useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    const isAuth = pathname === '/auth' || pathname.startsWith('/auth/');

    const showSidebar = !isAuth;

    if (!showSidebar) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar
                onNavigate={() => setIsNavigating(true)}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
            <main
                className={`
                    flex-1 flex flex-col w-full pt-16 lg:pt-0 transition-all duration-300 ease-in-out overflow-hidden
                    ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
                `}
            >
                <div className="relative flex-1 flex flex-col overflow-hidden">
                    {isNavigating && (
                        <div className="absolute inset-0 z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center animate-fade-in rounded-3xl">
                            <Loader className="flex flex-col items-center gap-4" iconClassName="text-indigo-500 w-10 h-10" />
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
