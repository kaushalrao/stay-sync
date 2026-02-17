"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from '@lib/firebase';
import { SIDEBAR_NAV_ITEMS } from '@/app/lib/constants';
import { useTheme } from '@/app/components/providers/ThemeProvider';
import { SidebarLanguageSelector } from '@/app/components/ui/SidebarLanguageSelector';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation('common');

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 z-50 flex items-center px-4 justify-between">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <span className="font-bold text-lg text-slate-900 dark:text-white">{t('sidebar.mobileTitle')}</span>

                <div className="w-8" /> {/* Spacer for centering */}
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
      fixed top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-screen bg-white dark:bg-slate-900 z-50
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      w-64 flex flex-col shadow-xl border-r border-slate-200 dark:border-slate-800
    `}
            >
                {/* Logo */}
                <div className="hidden lg:block p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">StaySync</h1>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{t('sidebar.propertyManager')}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {SIDEBAR_NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    setIsOpen(false);
                                    if (pathname !== item.href && onNavigate) {
                                        onNavigate();
                                    }
                                }}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group
                  ${isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }
                `}
                            >
                                <Icon
                                    size={20}
                                    className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                                />
                                <span className="font-medium text-sm">
                                    {t(item.translationKey)}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? (
                                <Moon size={20} className="text-indigo-400" />
                            ) : (
                                <Sun size={20} className="text-amber-400" />
                            )}
                            <span className="font-medium text-sm">{t('sidebar.theme')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                            <span className="capitalize">{theme}</span>
                        </div>
                    </button>

                    {/* Sign Out */}
                    <button
                        onClick={() => signOut(auth)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">{t('sidebar.signOut')}</span>
                    </button>
                </div>

                {/* Language Selector */}
                <SidebarLanguageSelector />

                {/* Copyright */}
                <div className="text-xs text-slate-500 dark:text-slate-600 text-center py-4">
                    © 2026 StaySync
                </div>
            </aside>
        </>
    );
}
