import { Bath, BedDouble, Utensils, Armchair, LayoutGrid } from 'lucide-react';
import React from 'react';

export const PRESET_TASKS: Record<string, string[]> = {
    'kitchen': ['Wipe counters', 'Clean sink', 'Empty fridge', 'Take out trash', 'Sweep floor', 'Check appliances'],
    'bedroom': ['Change linens', 'Dust surfaces', 'Vacuum floor', 'Check closet', 'Fluff pillows'],
    'bathroom': ['Scrub toilet', 'Clean shower/tub', 'Wipe mirror', 'Restock toilet paper', 'Replace towels', 'Empty bin'],
    'living': ['Vacuum rugs', 'Dust TV/electronics', 'Straighten cushions', 'Wipe coffee table', 'Check windows'],
    'other': ['Check smoke detectors', 'Water plants', 'Sweep porch', 'Check thermostat']
};

export const STANDARD_ROOMS = ['living', 'kitchen', 'bedroom', 'bathroom', 'other'];

export const ROOM_STYLES = {
    kitchen: {
        icon: Utensils,
        gradient: "bg-gradient-to-br from-orange-400/10 to-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20"
    },
    bedroom: {
        icon: BedDouble,
        gradient: "bg-gradient-to-br from-indigo-400/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20"
    },
    bathroom: {
        icon: Bath,
        gradient: "bg-gradient-to-br from-cyan-400/10 to-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20"
    },
    living: {
        icon: Armchair,
        gradient: "bg-gradient-to-br from-rose-400/10 to-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
    },
    default: {
        icon: LayoutGrid,
        gradient: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
    },
    done: {
        gradient: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
    }
} as const;
