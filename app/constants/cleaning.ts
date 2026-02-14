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
