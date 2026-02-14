import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@components/ui/Button';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

interface SortableRoomItemProps {
    room: string;
    onEdit: (room: string) => void;
    onDelete: (room: string) => void;
}

export function SortableRoomItem({ room, onEdit, onDelete }: SortableRoomItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: room });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    // Capitalize for display
    const label = room.charAt(0).toUpperCase() + room.slice(1);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl mb-2 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all"
        >
            <div className="flex items-center gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-2 text-slate-400 hover:text-indigo-500 cursor-grab active:cursor-grabbing touch-none"
                    type="button"
                >
                    <GripVertical size={20} />
                </button>
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    onClick={() => onEdit(room)}
                    className="p-2 h-auto rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 w-fit"
                >
                    <Pencil size={16} />
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => onDelete(room)}
                    className="p-2 h-auto rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-fit"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
}
