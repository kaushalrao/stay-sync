import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Template } from '@lib/types';
import { AVAILABLE_ICONS } from '@lib/constants';
import { SectionHeader } from '../ui/SectionHeader';

export const TemplateSelector: React.FC<{
    templates: Template[];
    selectedId: string;
    onSelect: (id: string) => void;
}> = ({ templates, selectedId, onSelect }) => (
    <div>
        <SectionHeader title="Select Template" icon={<MessageCircle size={14} />} />
        <div className="grid grid-cols-3 gap-3 md:gap-4">
            {templates.map((t) => {
                const Icon = AVAILABLE_ICONS[t.icon] || MessageCircle;
                const isSelected = selectedId === t.id;
                return (
                    <button
                        key={t.id}
                        onClick={() => onSelect(t.id)}
                        className={`group relative p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 aspect-square border hover:scale-[1.02] active:scale-95 ${isSelected
                            ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 dark:from-indigo-600/15 dark:to-purple-600/15 border-indigo-400 dark:border-indigo-500/40 shadow-md'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md'
                            }`}
                    >
                        <div className={`p-2 md:p-3 rounded-xl transition-all duration-200 ${isSelected
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md'
                            : 'bg-slate-300 dark:bg-slate-700/50 text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-400 dark:group-hover:bg-slate-600/50'
                            }`}>
                            <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-bold tracking-wide transition-colors truncate w-full text-center ${isSelected
                            ? 'text-indigo-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                            }`}>
                            {t.label}
                        </span>
                        {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"></div>
                        )}
                    </button>
                )
            })}
        </div>
    </div>
);
