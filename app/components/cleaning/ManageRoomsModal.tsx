import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { getRoomLabel } from './utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor,
    MouseSensor
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove
} from '@dnd-kit/sortable';
import { SortableRoomItem } from './SortableRoomItem';

interface ManageRoomsModalProps {
    isOpen: boolean;
    onClose: () => void;
    allRooms: string[];
    onReorderRooms: (newOrder: string[]) => void;
    onRenameRoom: (oldName: string, newName: string) => Promise<boolean>;
    onDeleteRoom: (room: string) => Promise<boolean>;
    onAddRoom: (room: string) => Promise<boolean>;
    isLoading?: boolean;
}

export function ManageRoomsModal({
    isOpen,
    onClose,
    allRooms,
    onReorderRooms,
    onRenameRoom,
    onDeleteRoom,
    onAddRoom,
    isLoading
}: ManageRoomsModalProps) {
    const [editingRoomName, setEditingRoomName] = useState<{ original: string, current: string } | null>(null);
    const [newRoomName, setNewRoomName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor),
        useSensor(MouseSensor)
    );

    if (!isOpen) return null;

    const handleRoomDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = allRooms.findIndex((r) => r === active.id);
            const newIndex = allRooms.findIndex((r) => r === over?.id);
            const newOrder = arrayMove(allRooms, oldIndex, newIndex);
            onReorderRooms(newOrder);
        }
    };

    const handleSaveRename = async () => {
        if (!editingRoomName) return;
        const newName = editingRoomName.current.trim();
        if (!newName) return;

        const success = await onRenameRoom(editingRoomName.original, newName.toLowerCase());
        if (success) {
            setEditingRoomName(null);
        }
    };

    const handleAddRoom = async () => {
        const name = newRoomName.trim();
        if (!name) return;

        setIsAdding(true);
        const success = await onAddRoom(name);
        setIsAdding(false);

        if (success) {
            setNewRoomName('');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 border-t md:border border-slate-200 dark:border-white/10 
                            p-6 rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl 
                            animate-slide-up md:animate-scale-in flex flex-col 
                            h-[85vh] md:h-auto md:max-h-[85vh] pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
                onClick={e => e.stopPropagation()}>

                {/* Mobile Drag Handle */}
                <div className="md:hidden flex justify-center -mt-2 mb-4" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Manage Rooms</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {editingRoomName ? (
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-2">Renaming room &quot;{getRoomLabel(editingRoomName.original)}&quot;</p>
                        <Input
                            label="New Room Name"
                            value={editingRoomName.current}
                            onChange={(e) => setEditingRoomName(prev => prev ? { ...prev, current: e.target.value } : null)}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSaveRename()}
                            disabled={isLoading}
                        />
                        <div className="flex gap-3 pt-4">
                            <Button variant="secondary" onClick={() => setEditingRoomName(null)} className="flex-1" disabled={isLoading}>Cancel</Button>
                            <Button onClick={handleSaveRename} className="flex-1" isLoading={isLoading} disabled={isLoading}>
                                <Save size={18} className="mr-2" /> Save Name
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {/* Add Room Section */}
                        <div className="flex gap-2 mb-6">
                            <Input
                                placeholder="New room name..."
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
                                disabled={isLoading || isAdding}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleAddRoom}
                                disabled={!newRoomName.trim() || isLoading || isAdding}
                                isLoading={isAdding}
                                className="shrink-0"
                            >
                                Add
                            </Button>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-1">
                            Drag to reorder. Click pencil to rename.
                        </p>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleRoomDragEnd}
                        >
                            <SortableContext
                                items={allRooms}
                                strategy={verticalListSortingStrategy}
                            >
                                {allRooms.map((room) => (
                                    <SortableRoomItem
                                        key={room}
                                        room={room}
                                        onEdit={(r) => setEditingRoomName({ original: r, current: getRoomLabel(r) })}
                                        onDelete={onDeleteRoom}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        {allRooms.length === 0 && (
                            <p className="text-center text-slate-400 py-8">No rooms found. Add a task to create a room.</p>
                        )}
                    </div>
                )}

                {!editingRoomName && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                        <Button variant="secondary" onClick={onClose} className="w-full">
                            Done
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
