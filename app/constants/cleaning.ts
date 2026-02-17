import { Armchair, Bath, BedDouble, Disc, Droplet, Key, Refrigerator, Search, Shirt, Sparkles, SprayCan, Trash2, Tv, Utensils, Wifi, Wind } from "lucide-react";

export const STANDARD_ROOMS = [
    'Living', 'Kitchen', 'Bedroom 1', 'Bedroom 2', 'Bathroom 1', 'Bathroom 2', 'Balcony', 'Other'
];

export const ROOM_STYLES: Record<string, string> = {
    living: 'from-emerald-500/10 to-teal-500/10 text-emerald-600',
    kitchen: 'from-orange-500/10 to-amber-500/10 text-orange-600',
    bedroom: 'from-indigo-500/10 to-violet-500/10 text-indigo-600',
    bathroom: 'from-cyan-500/10 to-sky-500/10 text-cyan-600',
    balcony: 'from-green-500/10 to-emerald-500/10 text-green-600',
    other: 'from-slate-500/10 to-gray-500/10 text-slate-600',
    done: 'from-emerald-500/20 to-teal-500/20 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20',
    default: 'from-slate-500/10 to-gray-500/10 text-slate-600'
};

export const PRESET_TASKS: Record<string, string[]> = {
    'Living': ['Dust surfaces', 'Vacuum floor', 'Arrange cushions', 'Check WiFi', 'Clean windows'],
    'Kitchen': ['Clean sink', 'Wipe counters', 'Empty trash', 'Check fridge', 'Replenish amenities'],
    'Bedroom 1': ['Change sheets', 'Vacuum floor', 'Dust surfaces', 'Check closet', 'Make bed'],
    'Bedroom 2': ['Change sheets', 'Vacuum floor', 'Dust surfaces', 'Check closet', 'Make bed'],
    'Bathroom 1': ['Clean toilet', 'Clean shower', 'Replenish soap/shampoo', 'Change towels', 'Mop floor'],
    'Bathroom 2': ['Clean toilet', 'Clean shower', 'Replenish soap/shampoo', 'Change towels', 'Mop floor'],
    'Balcony': ['Sweep floor', 'Wipe railing', 'Clean glass door'],
    'Other': ['Check keys', 'Testing smoke detector']
};

export const CONSUMABLE_ITEMS: Record<string, string[]> = {
    'Kitchen': [
        'Garbage Bags',
        'Dish Soap',
        'Sponge',
        'Paper Towels',
        'Coffee Filters',
        'Coffee/Tea',
        'Sugar/Creamer',
        'Salt/Pepper',
        'Cooking Oil'
    ],
    'Bathroom': [
        'Toilet Paper',
        'Hand Soap',
        'Shampoo',
        'Conditioner',
        'Body Wash',
        'Toothpaste',
        'Facial Tissues',
        'Trash Bags (Small)'
    ],
    'Living': [
        'Batteries (AA)',
        'Batteries (AAA)',
        'Light Bulbs'
    ],
    'Bedroom': [
        'Light Bulbs',
        'Tissues'
    ]
};

export const DEFAULT_ROOM_TYPES: Record<string, string> = {
    'Living': 'Living',
    'Kitchen': 'Kitchen',
    'Bedroom 1': 'Bedroom',
    'Bedroom 2': 'Bedroom',
    'Bathroom 1': 'Bathroom',
    'Bathroom 2': 'Bathroom',
    'Balcony': 'Other',
    'Other': 'Other'
};

export const TASK_ICON_MAP = [
    { keywords: ['vacuum', 'mop', 'sweep'], icon: Wind },
    { keywords: ['dust', 'wipe', 'clean'], icon: SprayCan },
    { keywords: ['trash', 'garbage', 'bin'], icon: Trash2 },
    { keywords: ['scrub'], icon: Sparkles },
    { keywords: ['bed', 'sheet', 'pillow'], icon: BedDouble },
    { keywords: ['towel', 'laundry', 'linen'], icon: Shirt },
    { keywords: ['fridge', 'refrigerator'], icon: Refrigerator },
    { keywords: ['dish', 'plate', 'cutlery'], icon: Disc },
    { keywords: ['coffee', 'tea', 'sugar'], icon: Utensils },
    { keywords: ['wifi', 'internet'], icon: Wifi },
    { keywords: ['tv', 'remote'], icon: Tv },
    { keywords: ['key', 'lock'], icon: Key },
    { keywords: ['ac', 'heat', 'fan'], icon: Wind },
    { keywords: ['shower', 'bath', 'toilet'], icon: Bath },
    { keywords: ['soap', 'shampoo'], icon: Droplet },
    { keywords: ['check', 'inspect', 'test'], icon: Search },
];

export const ROOM_ICON_MAP = [
    { keywords: ['kitchen'], icon: Utensils },
    { keywords: ['bedroom', 'bed'], icon: BedDouble },
    { keywords: ['bath', 'toilet', 'restroom'], icon: Bath },
    { keywords: ['living', 'lounge', 'sitting'], icon: Armchair },
];