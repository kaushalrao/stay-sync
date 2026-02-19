"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@components/providers/AppProvider';
import { Plus } from 'lucide-react';
import { useCleaningTasks } from '@hooks/cleaning/useCleaningTasks';
import { useRoomSettings } from '@hooks/cleaning/useRoomSettings';
import { DEFAULT_ROOM_TYPES } from '@constants/cleaning';
import { CleaningTask } from '@lib/types';
import { useInventory } from '@hooks/inventory/useInventory';
import { usePropertyStore, useUIStore } from '@store/index';
import { CleaningHeader } from '@components/cleaning/CleaningHeader';
import { ReadinessOverview } from '@components/cleaning/ReadinessOverview';
import { RoomGrid } from '@components/cleaning/RoomGrid';
import { RoomCard } from '@components/cleaning/RoomCard';
import { RoomDetailModal } from '@components/cleaning/RoomDetailModal';
import { AddTaskModal } from '@components/cleaning/AddTaskModal';
import { ManageRoomsModal } from '@components/cleaning/ManageRoomsModal';
import { InventoryManagerModal } from '@components/cleaning/InventoryManagerModal';
import { CompleteChecklistModal } from '@components/cleaning/CompleteChecklistModal';
import { appId } from '@lib/firebase';

export default function CleaningChecklistPage() {
    const { user } = useApp();
    const properties = usePropertyStore(state => state.properties);
    const showToast = useUIStore(state => state.showToast);
    const globalPropertyId = useUIStore(state => state.selectedPropertyId);
    const setFilterProp = useUIStore(state => state.setSelectedPropertyId);

    // In Cleaning Checklist, we MUST have a specific property. 
    // If global is 'all' or empty, default to first property locally.
    const filterProp = useMemo(() => {
        if (!globalPropertyId || globalPropertyId === 'all') {
            return properties[0]?.id || '';
        }
        return globalPropertyId;
    }, [globalPropertyId, properties]);

    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isManagingRooms, setIsManagingRooms] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

    // If global is empty, initialize it to first property
    useEffect(() => {
        if (properties.length > 0 && !globalPropertyId) {
            setFilterProp(properties[0].id);
        }
    }, [properties, globalPropertyId, setFilterProp]);
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
        initializePresets,
        addRoomPresets
    } = useCleaningTasks(filterProp);

    const { needs } = useInventory(); // Fetch inventory needs

    const {
        roomOrder,
        roomTypes,
        updateRoomOrder,
        setRoomType,
        renameRoom,
        deleteRoom,
        addRoom,
        resetToDefaults,
        isSaving: settingsSaving
    } = useRoomSettings(filterProp);

    const effectiveRoomTypes = useMemo(() => ({
        ...DEFAULT_ROOM_TYPES,
        ...roomTypes
    }), [roomTypes]);

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

    // Auto-trigger completion modal when 100% is reached
    useEffect(() => {
        if (totalTasks > 0 && completedTasks === totalTasks && !hasAutoTriggered) {
            setIsCompleting(true);
            setHasAutoTriggered(true);
        } else if (completedTasks < totalTasks) {
            // Reset trigger so it can fire again if they uncheck and re-check
            setHasAutoTriggered(false);
        }
    }, [completedTasks, totalTasks, hasAutoTriggered]);

    // Map needs to rooms for quick lookup
    // Key: room name lowercased, Value: number of items needed
    const roomNeedsMap = useMemo(() => {
        const map: Record<string, number> = {};
        needs.forEach(need => {
            if (need.status === 'pending' && need.propertyId === filterProp) {
                const r = need.room.toLowerCase();
                map[r] = (map[r] || 0) + 1; // Count items, or need.quantity? "number" usually implies items. Let's count distinct items for now, or just items. Need quantity might be better but usually badge is "number of alerts". Let's stick to number of need entries for now.
            }
        });
        return map;
    }, [needs, filterProp]);

    const allRooms = useMemo(() => {
        let rooms: string[] = [];
        const roomsFromTasks = Object.keys(tasksByRoom);

        if (roomOrder.length > 0) {
            rooms = [...roomOrder];
            // Append missing (case insensitive check)
            roomsFromTasks.forEach(r => {
                const exists = rooms.some(existing => existing.toLowerCase() === r.toLowerCase());
                if (!exists) rooms.push(r);
            });
        } else {
            // Even if empty, we rely on roomOrder. 
            // If roomOrder is empty (deleted or new), we default to just tasks' rooms.
            // If completely empty, it will return empty, triggering the "Restore" UI in modal.

            // However, we still want to show rooms that have tasks even if roomOrder is empty
            const customRooms = roomsFromTasks; // Just use tasks if no order
            rooms = [...customRooms];
            rooms = Array.from(new Set(rooms));
        }
        return rooms;
    }, [tasksByRoom, roomOrder]);

    const handleRoomDelete = async (room: string) => {
        if (!confirm(`Delete room and all its tasks?`)) return false;
        return await deleteRoom(room, allRooms);
    };

    const handleCompleteChecklist = async (data: { staffName: string; remarks: string }) => {
        if (!user || !filterProp) return false;

        // Calculate room-by-room summary
        const roomSummary: Record<string, { total: number, completed: number }> = {};
        allRooms.forEach(room => {
            const roomTasks = tasksByRoom[room.toLowerCase()] || [];
            roomSummary[room] = {
                total: roomTasks.length,
                completed: roomTasks.filter(t => t.isCompleted).length
            };
        });

        try {
            const res = await fetch('/api/cleaning/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: filterProp,
                    staffName: data.staffName,
                    remarks: data.remarks,
                    totalTasks,
                    completedTasks,
                    roomSummary,
                    userId: user.uid,
                    appId: appId
                })
            });

            const result = await res.json();
            if (result.success) {
                // Determine toast message based on email status
                if (result.emailStatus === 'sent') {
                    showToast('Checklist completed. Host has been notified!', 'success');
                } else if (result.emailStatus === 'failed') {
                    showToast('Log saved, but email notification failed.', 'error');
                } else {
                    showToast('Checklist completed and logged.', 'success');
                }

                // ONLY reset if it was 100% completion
                if (completedTasks === totalTasks && totalTasks > 0) {
                    await resetTasks(false);
                }

                return true;
            } else {
                showToast(result.error || 'Failed to complete checklist', 'error');
                return false;
            }
        } catch (error) {
            console.error(error);
            showToast('An error occurred during completion', 'error');
            return false;
        }
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

            <div className="w-full px-4 md:px-8 pt-8">
                <ReadinessOverview
                    totalTasks={totalTasks}
                    completedTasks={completedTasks}
                    onInitializePresets={initializePresets}
                    onResetTasks={resetTasks}
                    onComplete={() => setIsCompleting(true)}
                />

                <RoomGrid onManageRooms={() => setIsManagingRooms(true)}>
                    {allRooms.map((room, idx) => {
                        const roomTasks = tasksByRoom[room.toLowerCase()] || [];
                        const needsCount = roomNeedsMap[room.toLowerCase()] || 0;
                        return (
                            <RoomCard
                                key={room}
                                room={room}
                                totalTasks={roomTasks.length}
                                completedTasks={roomTasks.filter(t => t.isCompleted).length}
                                idx={idx}
                                onClick={setSelectedRoom}
                                needsCount={needsCount}
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
                onAddPresets={() => selectedRoom && addRoomPresets(selectedRoom)}
                propertyName={selectedPropertyName}
                propertyId={filterProp}
                needsCount={selectedRoom ? (roomNeedsMap[selectedRoom.toLowerCase()] || 0) : 0}
                forcedCategory={selectedRoom ? effectiveRoomTypes[selectedRoom] : undefined}
                onSetCategory={(category) => selectedRoom && setRoomType(selectedRoom, category)}
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
                roomTypes={effectiveRoomTypes}
                onReorderRooms={updateRoomOrder}
                onRenameRoom={(old, newName, type) => renameRoom(old, newName, allRooms, type)}
                onDeleteRoom={handleRoomDelete}
                onAddRoom={(room, type) => addRoom(room, allRooms, type)}
                onRestoreDefaults={resetToDefaults}
                isLoading={settingsSaving}
            />

            <InventoryManagerModal
                isOpen={showLogs}
                onClose={() => setShowLogs(false)}
                propertyId={filterProp}
            />

            <CompleteChecklistModal
                isOpen={isCompleting}
                onClose={() => setIsCompleting(false)}
                onComplete={handleCompleteChecklist}
                totalTasks={totalTasks}
                completedTasks={completedTasks}
                defaultStaffName={user.displayName || ''}
            />
        </div>
    );
}
