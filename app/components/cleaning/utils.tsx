import { LayoutGrid, CheckCircle } from 'lucide-react';
import { ROOM_ICON_MAP, ROOM_STYLES, TASK_ICON_MAP } from '@constants/cleaning';

export const getRoomLabel = (room: string) => {
    if (!room) return 'Unknown Room';
    return room.charAt(0).toUpperCase() + room.slice(1);
};

export const getTaskIcon = (taskTitle: string, size = 18) => {
    const lower = taskTitle.toLowerCase();
    const match = TASK_ICON_MAP.find(entry => entry.keywords.some(k => lower.includes(k)));
    const Icon = match ? match.icon : CheckCircle;
    return <Icon size={size} />;
};

export const getRoomIcon = (room: string, size = 32) => {
    const lower = room.toLowerCase();
    const match = ROOM_ICON_MAP.find(entry => entry.keywords.some(k => lower.includes(k)));
    const Icon = match ? match.icon : LayoutGrid;
    return <Icon size={size} />;
};

export const getRoomGradient = (room: string, isDone: boolean) => {
    if (isDone) return ROOM_STYLES.done;

    const lower = room?.toLowerCase() || '';
    if (lower.includes('kitchen')) return ROOM_STYLES.kitchen;
    if (lower.includes('bedroom') || lower.includes('bed')) return ROOM_STYLES.bedroom;
    if (lower.includes('bath') || lower.includes('toilet')) return ROOM_STYLES.bathroom;
    if (lower.includes('living') || lower.includes('lounge')) return ROOM_STYLES.living;
    if (lower.includes('balcony') || lower.includes('terrace')) return ROOM_STYLES.balcony;

    return ROOM_STYLES.default || ROOM_STYLES.other;
};
