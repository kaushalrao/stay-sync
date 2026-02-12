import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@components/ui/Button';
import { Edit3, Trash2, MessageCircle, GripVertical } from 'lucide-react';
import { Template } from '@lib/types';
import { AVAILABLE_ICONS } from '@lib/constants';

interface SortableTemplateItemProps {
    template: Template;
    onEdit: (template: Template) => void;
    onDelete: (id: string) => void;
}

export function SortableTemplateItem({ template, onEdit, onDelete }: SortableTemplateItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: template.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative bg-slate-800/30 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10 shadow-xl flex flex-col justify-between group min-h-[160px] hover:bg-slate-800/50 transition-all overflow-hidden ring-1 ring-white/5 hover:ring-white/10"
        >
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing z-20 touch-none"
            >
                <GripVertical size={20} />
            </div>

            <div className="relative z-10 pt-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        {React.createElement(AVAILABLE_ICONS[template.icon] || MessageCircle, { size: 24, className: "text-slate-300" })}
                    </div>
                    <h3 className="font-bold text-white text-lg tracking-tight pr-8">{template.label}</h3>
                </div>
            </div>

            <div className="flex gap-2 pt-6 mt-auto relative z-10">
                <Button variant="secondary" className="flex-1 !py-2.5 text-sm rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:text-white" onClick={() => onEdit(template)}><Edit3 size={16} /> Edit</Button>
                <Button variant="danger" className="!p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white hover:border-transparent" onClick={() => onDelete(template.id)}><Trash2 size={18} /></Button>
            </div>
        </div>
    );
}
