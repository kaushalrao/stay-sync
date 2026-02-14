import React from 'react';
import { Bath, BedDouble, Utensils, Armchair, LayoutGrid } from 'lucide-react';
import { ROOM_STYLES } from '@constants/cleaning';

export const getRoomLabel = (room: string) => {
    return room.charAt(0).toUpperCase() + room.slice(1);
};

export const getRoomIcon = (room: string, size = 32) => {
    const lower = room.toLowerCase();

    // Check direct matches from ROOM_STYLES keys first if we want strict mapping
    // But currently using loose matching:
    if (lower.includes('kitchen')) return <Utensils size={size} />;
    if (lower.includes('bedroom') || lower.includes('bed')) return <BedDouble size={size} />;
    if (lower.includes('bath') || lower.includes('toilet') || lower.includes('restroom')) return <Bath size={size} />;
    if (lower.includes('living') || lower.includes('lounge') || lower.includes('sitting')) return <Armchair size={size} />;

    return <LayoutGrid size={size} />;
};

export const getRoomGradient = (room: string, isDone: boolean) => {
    if (isDone) return ROOM_STYLES.done.gradient;

    const lower = room.toLowerCase();
    if (lower.includes('kitchen')) return ROOM_STYLES.kitchen.gradient;
    if (lower.includes('bedroom') || lower.includes('bed')) return ROOM_STYLES.bedroom.gradient;
    if (lower.includes('bath') || lower.includes('toilet')) return ROOM_STYLES.bathroom.gradient;
    if (lower.includes('living') || lower.includes('lounge')) return ROOM_STYLES.living.gradient;

    return ROOM_STYLES.default.gradient;
};
