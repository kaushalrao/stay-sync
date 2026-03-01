import { APP_URLS } from './urls';
import { COLOR_VARIANTS } from './constants';
import { Guest } from './types';
import { icons } from 'lucide-react';

export const getIconForTemplate = (label: string): string => {
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('trek') || lowerLabel.includes('hike') || lowerLabel.includes('mountain') || lowerLabel.includes('adventure')) return 'Mountain';
    if (lowerLabel.includes('booking') || lowerLabel.includes('confirm') || lowerLabel.includes('reservation')) return 'CalendarCheck';
    if (lowerLabel.includes('internet') || lowerLabel.includes('network')) return 'Wifi';
    if (lowerLabel.includes('location') || lowerLabel.includes('direction') || lowerLabel.includes('address')) return 'MapPin';
    if (lowerLabel.includes('welcome') || lowerLabel.includes('intro') || lowerLabel.includes('hello')) return 'Coffee';
    if (lowerLabel.includes('checkout') || lowerLabel.includes('check-out') || lowerLabel.includes('bye') || lowerLabel.includes('departure')) return 'LogOut';
    if (lowerLabel.includes('prop') || lowerLabel.includes('detail') || lowerLabel.includes('guide')) return 'FileText';
    if (lowerLabel.includes('food') || lowerLabel.includes('dining') || lowerLabel.includes('restaurant') || lowerLabel.includes('eat')) return 'Utensils';

    // Dynamic lookup: Check if any word in the label matches a Lucide icon
    const words = label.split(/[\s-_]+/);
    for (const word of words) {
        // Simple PascalCase conversion attempt: 'car' -> 'Car', 'wifi' -> 'Wifi'
        const pascalWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        if (pascalWord in icons) {
            return pascalWord;
        }
        // Check for direct match case-insensitive (e.g. 'dumbbell' -> 'Dumbbell')
        const match = Object.keys(icons).find(iconName => iconName.toLowerCase() === word.toLowerCase());
        if (match) return match;
    }

    return 'MessageCircle';
};

export const formatDate = (dateStr: string): string => {
    if (!dateStr) return '...';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const calculateNights = (inDate: string, outDate: string): number => {
    if (!inDate || !outDate) return 0;
    const [y1, m1, d1] = inDate.split('-').map(Number);
    const [y2, m2, d2] = outDate.split('-').map(Number);
    const start = new Date(y1, m1 - 1, d1);
    const end = new Date(y2, m2 - 1, d2);
    if (end <= start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN').format(amount);

export const processTemplate = (templateStr: string, data: Record<string, string | number>): string => {
    return templateStr.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? String(data[key]) : match;
    });
};

export const isValidBookingStatus = (status: Guest['status']): boolean => {
    return status !== 'cancelled' && status !== 'deleted' && status !== 'pending';
};

export const getStatusColor = (status: Guest['status'], isPast?: boolean) => {
    if (status === 'deleted') return 'bg-rose-400 shadow-[0_0_8px] shadow-rose-400/50';
    if (status === 'cancelled') return 'bg-slate-400';
    if (status === 'pending') return 'bg-amber-400 shadow-[0_0_8px] shadow-amber-400/50';

    // Status is 'booked'
    if (isPast) return 'bg-slate-400';
    return 'bg-blue-400 shadow-[0_0_8px] shadow-blue-400/50';
};

export const getDisplayStatus = (guest: Guest): string => {
    if (guest.status === 'deleted') return 'DELETED';
    if (guest.status === 'cancelled') return 'CANCELLED';
    if (guest.status === 'pending') return 'PENDING';

    const today = new Date().toISOString().split('T')[0];
    const isPastDate = !!(guest.checkOutDate && guest.checkOutDate < today);

    return isPastDate ? 'PAST' : 'UPCOMING';
};

export const getPropertyColorKey = (name: string) => {
    const keys = Object.keys(COLOR_VARIANTS);
    if (!name) return keys[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return keys[Math.abs(hash) % keys.length];
};

export const openWhatsApp = (message: string, phoneNumber?: string) => {
    if (!message) return;

    let url = `${APP_URLS.API.WHATSAPP_SEND}?text=${encodeURIComponent(message)}`;

    if (phoneNumber) {
        const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhone) {
            url += `&phone=${cleanPhone}`;
        }
    }

    window.open(url, '_blank');
};
