"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@components/providers/AppProvider';
import { Plus } from 'lucide-react';
import { useCleaningTasks } from '@hooks/cleaning/useCleaningTasks';
import { useRoomSettings } from '@hooks/cleaning/useRoomSettings';
import { STANDARD_ROOMS } from '@constants/cleaning';
import { CleaningTask } from '@lib/types';
import { CleaningHeader } from '@components/cleaning/CleaningHeader';
import { ReadinessOverview } from '@components/cleaning/ReadinessOverview';
import { RoomGrid } from '@components/cleaning/RoomGrid';
import { RoomCard } from '@components/cleaning/RoomCard';
import { RoomDetailModal } from '@components/cleaning/RoomDetailModal';
import { AddTaskModal } from '@components/cleaning/AddTaskModal';
import { ManageRoomsModal } from '@components/cleaning/ManageRoomsModal';
import { InventoryManagerModal } from '@components/cleaning/InventoryManagerModal';

export default function CleaningChecklistPage() {
    const { user, properties } = useApp();
    const [filterProp, setFilterProp] = useState<string>('');
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isManagingRooms, setIsManagingRooms] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    // Initialize default property/first property
    useEffect(() => {
        if (properties.length > 0 && !filterProp) {
            setFilterProp(properties[0].id);
        }
    }, [properties, filterProp]);

    // Derived Name
    const selectedPropertyName = useMemo(() =>
        properties.find(p => p.id === filterProp)?.name,
        [properties, filterProp]);

    // Hooks
    const {
        tasks,
        isLoading: tasksLoading,
        addTask,
        toggleTask,
        deleteTask,
        resetTasks,
        initializePresets
    } = useCleaningTasks(filterProp);

    const {
        roomOrder,
        updateRoomOrder,
        renameRoom,
        deleteRoom,
        addRoom,
        isSaving: settingsSaving
    } = useRoomSettings(filterProp);

    // Derived Logic
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;

    const tasksByRoom = useMemo(() => {
        return tasks.reduce((acc, task) => {
            const r = task.room.toLowerCase();
            if (!acc[r]) acc[r] = [];
            acc[r].push(task);
            return acc;
        }, {} as Record<string, CleaningTask[]>);
    }, [tasks]);

    const allRooms = useMemo(() => {
        let rooms: string[] = [];
        const roomsFromTasks = Object.keys(tasksByRoom);

        if (roomOrder.length > 0) {
            rooms = [...roomOrder];
            // Append missing
            roomsFromTasks.forEach(r => {
                if (!rooms.includes(r)) rooms.push(r);
            });
        } else {
            // Default
            const customRooms = roomsFromTasks.filter(r => !STANDARD_ROOMS.includes(r));
            rooms = [...STANDARD_ROOMS, ...customRooms];
            rooms = Array.from(new Set(rooms));
        }
        return rooms;
    }, [tasksByRoom, roomOrder]);

    const handleRoomDelete = async (room: string) => {
        if (!confirm(`Delete room and all its tasks?`)) return false;
        return await deleteRoom(room, allRooms);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-20 safe-area-top">
            <CleaningHeader
                properties={properties}
                selectedPropertyId={filterProp}
                onPropertyChange={setFilterProp}
                onViewLogs={() => setShowLogs(true)}
            />

            <div className="max-w-5xl mx-auto px-6 pt-8">
                <ReadinessOverview
                    totalTasks={totalTasks}
                    completedTasks={completedTasks}
                    onInitializePresets={initializePresets}
                    onResetTasks={resetTasks}
                />

                <RoomGrid onManageRooms={() => setIsManagingRooms(true)}>
                    {allRooms.map((room, idx) => {
                        const roomTasks = tasksByRoom[room.toLowerCase()] || [];
                        return (
                            <RoomCard
                                key={room}
                                room={room}
                                totalTasks={roomTasks.length}
                                completedTasks={roomTasks.filter(t => t.isCompleted).length}
                                idx={idx}
                                onClick={setSelectedRoom}
                            />
                        );
                    })}
                </RoomGrid>

                {/* Floating Add Button */}
                <button
                    onClick={() => { setSelectedRoom(null); setIsAdding(true); }}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center hover:bg-emerald-600 transition-all hover:scale-110 active:scale-90 z-20"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* MODALS */}
            <RoomDetailModal
                room={selectedRoom}
                tasks={selectedRoom ? (tasksByRoom[selectedRoom.toLowerCase()] || []) : []}
                onClose={() => setSelectedRoom(null)}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onAddTask={() => setIsAdding(true)} // This will open AddTaskModal on top
                propertyName={selectedPropertyName}
                propertyId={filterProp}
            />

            <AddTaskModal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                onAddTask={addTask}
                allRooms={allRooms}
                preSelectedRoom={selectedRoom}
            />

            <ManageRoomsModal
                isOpen={isManagingRooms}
                onClose={() => setIsManagingRooms(false)}
                allRooms={allRooms}
                onReorderRooms={updateRoomOrder}
                onRenameRoom={(old, newName) => renameRoom(old, newName, allRooms)}
                onDeleteRoom={handleRoomDelete}
                onAddRoom={(room) => addRoom(room, allRooms)}
                isLoading={settingsSaving}
            />

            <InventoryManagerModal
                isOpen={showLogs}
                onClose={() => setShowLogs(false)}
                propertyId={filterProp}
            />
        </div>
    );
}
