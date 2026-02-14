import { GuestDetails, NavItem, QuickAction } from './types';
import {
    CalendarCheck, MapPin, Coffee, Wifi,
    Utensils, MessageCircle, LogOut, Home, FileText, Mountain,
    PlusCircle,
    Users,
    BarChart3,
    Settings,
    Wrench,
    LayoutDashboard,
    Sparkles
} from 'lucide-react';
import React from 'react';

export const AVAILABLE_ICONS: Record<string, React.ElementType> = {
    CalendarCheck, MapPin, Coffee, Wifi, Utensils, LogOut, MessageCircle, Home, FileText, Mountain
};

export const FEATURE_CARD_STYLES = {
    indigo: {
        bg: 'bg-indigo-600',
        shadow: 'hover:shadow-indigo-500/30',
        labelBg: 'bg-indigo-950/30',
        labelText: 'text-indigo-100',
        descText: 'text-indigo-100/80',
        icon: 'text-indigo-400',
    },
    rose: {
        bg: 'bg-rose-600',
        shadow: 'hover:shadow-rose-500/30',
        labelBg: 'bg-rose-950/30',
        labelText: 'text-rose-100',
        descText: 'text-rose-100/80',
        icon: 'text-rose-400',
    },
    orange: {
        bg: 'bg-orange-600',
        shadow: 'hover:shadow-orange-500/30',
        labelBg: 'bg-orange-950/30',
        labelText: 'text-orange-100',
        descText: 'text-orange-100/80',
        icon: 'text-orange-400',
    },
    cyan: {
        bg: 'bg-cyan-600',
        shadow: 'hover:shadow-cyan-500/30',
        labelBg: 'bg-cyan-950/30',
        labelText: 'text-cyan-100',
        descText: 'text-cyan-100/80',
        icon: 'text-cyan-500',
    },
    purple: {
        bg: 'bg-purple-600',
        shadow: 'hover:shadow-purple-500/30',
        labelBg: 'bg-purple-950/30',
        labelText: 'text-purple-100',
        descText: 'text-purple-100/80',
        icon: 'text-purple-400',
    }
};

export const GUEST_FILTER_OPTIONS = ['all', 'upcoming', 'past'] as const;

export const VARIABLE_CATEGORIES = {
    "Property Details": ['propertyName', 'wifiName', 'wifiPass', 'locationLink', 'propertyLink', 'checkInTime', 'checkOutTime', 'baseGuests'],
    "Guest & Booking": ['guestName', 'numberOfGuests', 'nights', 'checkInDate', 'checkOutDate'],
    "Host & Contact": ['hostName', 'coHostName', 'contactPrimary', 'contactSecondary'],
    "Financials": ['totalAmount', 'advancePaid', 'balanceDue', 'basePrice', 'extraGuestPrice']
};

export const DEFAULT_GUEST_DETAILS: GuestDetails = {
    guestName: '',
    numberOfGuests: 2,
    advancePaid: 0,
    discount: 0,
    checkInDate: '',
    checkOutDate: '',
    phoneNumber: ''
};

export const DEFAULT_PROPERTY_TIMES = {
    checkIn: '13:00',
    checkOut: '11:00'
};

export const DEFAULT_PROPERTY_VALUES = {
    baseGuests: 2,
    basePrice: 0,
    extraGuestPrice: 0
};

export const COLOR_VARIANTS: Record<string, { bg: string, border: string, text: string, icon: string }> = {
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/10', border: 'border-indigo-300 dark:border-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300', icon: 'text-indigo-600 dark:text-indigo-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/10', border: 'border-purple-300 dark:border-purple-500/20', text: 'text-purple-700 dark:text-purple-300', icon: 'text-purple-600 dark:text-purple-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-500/10', border: 'border-rose-300 dark:border-rose-500/20', text: 'text-rose-700 dark:text-rose-300', icon: 'text-rose-600 dark:text-rose-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-500/10', border: 'border-orange-300 dark:border-orange-500/20', text: 'text-orange-700 dark:text-orange-300', icon: 'text-orange-600 dark:text-orange-400' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', border: 'border-cyan-300 dark:border-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-300', icon: 'text-cyan-600 dark:text-cyan-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/10', border: 'border-emerald-300 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', icon: 'text-emerald-600 dark:text-emerald-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-500/10', border: 'border-blue-300 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-300', icon: 'text-blue-600 dark:text-blue-400' },
    fuchsia: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/10', border: 'border-fuchsia-300 dark:border-fuchsia-500/20', text: 'text-fuchsia-700 dark:text-fuchsia-300', icon: 'text-fuchsia-600 dark:text-fuchsia-400' },
};

export const QUICK_ACTIONS: QuickAction[] = [
    {
        label: 'Add Booking',
        subtitle: 'New reservation',
        icon: PlusCircle,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        href: '/greeter'
    },
    {
        label: 'Guests',
        subtitle: 'View guests',
        icon: Users,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10',
        href: '/guests'
    },
    {
        label: 'Cleaning',
        subtitle: 'Room checklist',
        icon: Sparkles,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10',
        href: '/cleaning-checklist'
    },
    {
        label: 'Properties',
        subtitle: 'Manage listings',
        icon: Home,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        href: '/settings'
    },
    {
        label: 'Analytics',
        subtitle: 'View insights',
        icon: BarChart3,
        color: 'text-pink-600 dark:text-pink-400',
        bgColor: 'bg-pink-500/10',
        href: '/analytics'
    },
    {
        label: 'Maintenance',
        subtitle: 'Report issues',
        icon: Wrench,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        href: '/maintenance'
    }
];

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'New Guest', href: '/greeter', icon: PlusCircle },
    { label: 'Guests', href: '/guests', icon: Users },
    { label: 'Cleaning Checklist', href: '/cleaning-checklist', icon: Sparkles },
    { label: 'Maintenance', href: '/maintenance', icon: Wrench },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
];
