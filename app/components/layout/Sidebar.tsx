"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    LogOut,
    Sun,
    Moon,
    AlertCircle
} from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from '@lib/firebase';
import { SIDEBAR_NAV_ITEMS } from '@/app/lib/constants';
import { useInventoryStore, useUIStore } from '@store/index';
import { flushSync } from 'react-dom';

interface SidebarProps {
    onNavigate?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function Sidebar({ onNavigate, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const theme = useUIStore(state => state.theme);
    const toggleTheme = useUIStore(state => state.toggleTheme);
    const setSelectedPropertyId = useUIStore(state => state.setSelectedPropertyId);
    const needs = useInventoryStore(state => state.needs);
    const hasLowStock = needs.length > 0;

    const handleThemeToggle = async (e: React.MouseEvent) => {
        // Fallback for browsers that don't support View Transitions
        // @ts-ignore
        if (!document.startViewTransition) {
            toggleTheme();
            return;
        }

        const x = e.clientX;
        const y = e.clientY;

        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        // @ts-ignore
        const transition = document.startViewTransition(() => {
            toggleTheme();
        });

        transition.ready.then(() => {
            requestAnimationFrame(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${endRadius}px at ${x}px ${y}px)`
                        ],
                    },
                    {
                        duration: 500,
                        easing: 'ease-out',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
            });
        });
    };

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

                <span className="font-bold text-lg text-slate-900 dark:text-white">StaySync</span>

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
      transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      w-64 flex flex-col shadow-xl border-r border-slate-200 dark:border-slate-800
    `}
            >
                {/* Logo */}
                <div className={`
                    hidden lg:flex items-center 
                    ${isCollapsed ? 'justify-center p-4' : 'p-6 gap-3'} 
                    border-b border-slate-200 dark:border-slate-800 h-[89px] 
                    relative group
                `}>
                    <div className="w-10 h-10 min-w-[2.5rem] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>

                    {!isCollapsed && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">StaySync</h1>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Property Manager</p>
                        </div>
                    )}

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={onToggleCollapse}
                        className={`
                            absolute -right-3 top-1/2 -translate-y-1/2
                            w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                            flex items-center justify-center text-slate-500 hover:text-indigo-500
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            shadow-sm z-50
                        `}
                    >
                        {isCollapsed ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
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
                                    setSelectedPropertyId('all');
                                    if (pathname !== item.href && onNavigate) {
                                        onNavigate();
                                    }
                                }}
                                title={isCollapsed ? item.label : ''}
                                className={`
                  flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'} py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }
                `}
                            >
                                <Icon
                                    size={20}
                                    className={`
                                        flex-shrink-0
                                        ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                                    `}
                                />

                                {!isCollapsed && (
                                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                        {item.label}
                                    </span>
                                )}

                                {item.label === 'Inventory' && hasLowStock && (
                                    <AlertCircle
                                        size={10}
                                        className={`
                                            absolute top-2 right-2 animate-pulse
                                            ${isActive ? 'text-white' : 'text-rose-500'}
                                            ${isCollapsed ? 'block' : 'ml-auto static'}
                                        `}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className={`
                    p-3 space-y-2 border-t border-slate-200 dark:border-slate-800
                    ${isCollapsed ? 'flex flex-col items-center' : ''}
                `}>
                    {/* Theme Toggle */}
                    <button
                        onClick={handleThemeToggle}
                        title={isCollapsed ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : ''}
                        className={`
                            w-full flex items-center 
                            ${isCollapsed ? 'justify-center p-2' : 'justify-between px-4 py-3 gap-3'} 
                            rounded-xl text-slate-600 dark:text-slate-400 
                            hover:bg-slate-100 dark:hover:bg-slate-800 
                            hover:text-slate-900 dark:hover:text-slate-200 
                            transition-all duration-200 group
                        `}
                    >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            {theme === 'dark' ? (
                                <Moon size={20} className="text-indigo-400" />
                            ) : (
                                <Sun size={20} className="text-amber-400" />
                            )}
                            {!isCollapsed && <span className="font-medium text-sm">Theme</span>}
                        </div>
                        {!isCollapsed && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                                <span className="capitalize">{theme}</span>
                            </div>
                        )}
                    </button>

                    {/* Sign Out */}
                    <button
                        onClick={() => signOut(auth)}
                        title={isCollapsed ? 'Sign Out' : ''}
                        className={`
                            w-full flex items-center 
                            ${isCollapsed ? 'justify-center p-2' : 'px-4 py-3 gap-3'} 
                            rounded-xl text-slate-600 dark:text-slate-400 
                            hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 
                            transition-all duration-200
                        `}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="font-medium text-sm">Sign Out</span>}
                    </button>
                </div>

                {/* Copyright */}
                {!isCollapsed && (
                    <div className="text-xs text-slate-500 dark:text-slate-600 text-center py-4 whitespace-nowrap overflow-hidden">
                        © 2026 StaySync
                    </div>
                )}
            </aside>
        </>
    );
}
