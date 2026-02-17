import React, { useState } from 'react';
import { X, Save, ChevronDown, RotateCcw } from 'lucide-react';
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
    roomTypes: Record<string, string>;
    onReorderRooms: (newOrder: string[]) => void;
    onRenameRoom: (oldName: string, newName: string, newType?: string) => Promise<boolean>;
    onDeleteRoom: (room: string) => Promise<boolean>;
    onAddRoom: (room: string, type: string) => Promise<boolean>;
    onRestoreDefaults?: () => Promise<boolean>;
    isLoading?: boolean;
}

export function ManageRoomsModal({
    isOpen,
    onClose,
    allRooms,
    roomTypes,
    onReorderRooms,
    onRenameRoom,
    onDeleteRoom,
    onAddRoom,
    onRestoreDefaults,
    isLoading
}: ManageRoomsModalProps) {
    const [editingRoomName, setEditingRoomName] = useState<{ original: string, current: string, type: string } | null>(null);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomType, setNewRoomType] = useState('Bedroom');
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

        const success = await onRenameRoom(editingRoomName.original, newName.toLowerCase(), editingRoomName.type);
        if (success) {
            setEditingRoomName(null);
        }
    };

    const handleAddRoom = async () => {
        const name = newRoomName.trim();
        if (!name) return;

        setIsAdding(true);
        const success = await onAddRoom(name, newRoomType);
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
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-2">Editing &quot;{getRoomLabel(editingRoomName.original)}&quot;</p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Room Name</label>
                                <Input
                                    value={editingRoomName.current}
                                    onChange={(e) => setEditingRoomName(prev => prev ? { ...prev, current: e.target.value } : null)}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleSaveRename()}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Room Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all font-medium"
                                        value={editingRoomName.type}
                                        onChange={(e) => setEditingRoomName(prev => prev ? { ...prev, type: e.target.value } : null)}
                                        disabled={isLoading}
                                    >
                                        <option value="Bedroom">Bedroom</option>
                                        <option value="Kitchen">Kitchen</option>
                                        <option value="Bathroom">Bathroom</option>
                                        <option value="Living">Living Room</option>
                                        <option value="Other">Other (General)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="secondary" onClick={() => setEditingRoomName(null)} className="flex-1" disabled={isLoading}>Cancel</Button>
                            <Button onClick={handleSaveRename} className="flex-1" isLoading={isLoading} disabled={isLoading}>
                                <Save size={18} className="mr-2" /> Save Changes
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {/* Add Room Section */}
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="New room name..."
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
                                    disabled={isLoading || isAdding}
                                    className="flex-1"
                                />
                                <div className="relative">
                                    <select
                                        className="h-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-emerald-500 transition-all font-medium"
                                        value={newRoomType}
                                        onChange={(e) => setNewRoomType(e.target.value)}
                                        disabled={isLoading || isAdding}
                                    >
                                        <option value="Bedroom">Bedroom</option>
                                        <option value="Kitchen">Kitchen</option>
                                        <option value="Bathroom">Bathroom</option>
                                        <option value="Living">Living Room</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <Button
                                onClick={handleAddRoom}
                                disabled={!newRoomName.trim() || isLoading || isAdding}
                                isLoading={isAdding}
                                className="w-full"
                            >
                                Add Room
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
                                        onEdit={(r) => setEditingRoomName({
                                            original: r,
                                            current: getRoomLabel(r),
                                            type: roomTypes[r] || 'General'
                                        })}
                                        onDelete={onDeleteRoom}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        {allRooms.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <p className="text-slate-400 text-center">No rooms found.</p>
                                {onRestoreDefaults && (
                                    <Button
                                        variant="secondary"
                                        onClick={onRestoreDefaults}
                                        disabled={isLoading}
                                        className="text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                    >
                                        <RotateCcw size={16} className="mr-2" />
                                        Populate Default Rooms
                                    </Button>
                                )}
                            </div>
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
