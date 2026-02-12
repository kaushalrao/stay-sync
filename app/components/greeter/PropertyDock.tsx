import { Property } from '@lib/types';
import { Home } from 'lucide-react';

export const PropertyDock: React.FC<{
    properties: Property[];
    selectedId: string;
    onSelect: (id: string) => void;
}> = ({ properties, selectedId, onSelect }) => (
    <div className="flex justify-center sticky top-2 z-40 w-full pointer-events-none">
        <div className="pointer-events-auto inline-flex overflow-x-auto gap-2 p-1.5 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-slate-700 rounded-full shadow-xl no-scrollbar max-w-[calc(100vw-24px)] md:max-w-full">
            {properties.map(p => (
                <button
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className={`relative flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${selectedId === p.id
                        ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-md shadow-orange-500/30'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`}
                >
                    <span>{p.name}</span>
                    {selectedId === p.id && (
                        <Home size={14} className="animate-fade-in" strokeWidth={2.5} />
                    )}
                </button>
            ))}
        </div>
    </div>
);
