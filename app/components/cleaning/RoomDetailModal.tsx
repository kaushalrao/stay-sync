import React, { useState } from 'react';
import { X, CheckSquare, Trash2, Plus, AlertTriangle, Package, Sparkles } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { CleaningTask } from '@lib/types';
import { getRoomIcon, getRoomLabel, getRoomGradient, getTaskIcon } from './utils';
import { ReportIssueModal } from './ReportIssueModal';
import { InventoryModal } from './InventoryModal';

interface RoomDetailModalProps {
    room: string | null;
    tasks: CleaningTask[];
    onClose: () => void;
    onToggleTask: (taskId: string, currentStatus: boolean) => void;
    onDeleteTask: (taskId: string) => void;
    onAddTask: () => void;
    onAddPresets?: () => void;
    propertyName?: string;
    propertyId?: string; // We need this now
}

export function RoomDetailModal({
    room,
    tasks,
    onClose,
    onToggleTask,
    onDeleteTask,
    onAddTask,
    onAddPresets,
    propertyName,
    propertyId // Assume this is passed now (or we can get it from context if not)
}: RoomDetailModalProps) {
    const [reportingIssue, setReportingIssue] = useState<{ roomName: string, taskTitle?: string } | null>(null);
    const [showInventory, setShowInventory] = useState(false);

    if (!room) return null;

    // Fallback if propertyId isn't passed (though it should be)
    // Actually, let's grab it from context in a clearer way if needed, 
    // but for now let's assume the parent passes it or we fail gracefully? 
    // Wait, the parent `CleaningChecklistPage` has `filterProp`. We should pass it.

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

                {/* Drawer/Bottom Sheet Content */}
                <div className="relative w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col
                                h-[85vh] md:h-full rounded-t-3xl md:rounded-none md:rounded-l-3xl
                                animate-slide-up md:animate-slide-in-right transition-all duration-300 ease-out">

                    {/* Mobile Drag Handle */}
                    <div className="md:hidden flex justify-center pt-3 pb-1" onClick={onClose}>
                        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    </div>

                    <div className={`px-6 py-4 md:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between ${getRoomGradient(room, false).split(' ')[0]} bg-opacity-50`}>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
                                {getRoomIcon(room, 24)} {getRoomLabel(room)}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">Checklist for {propertyName}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowInventory(true)}
                                className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors dark:bg-black/20 dark:hover:bg-black/40 text-emerald-600 dark:text-emerald-400"
                                title="Restock Consumables"
                            >
                                <Package size={20} />
                            </button>
                            <button
                                onClick={() => setReportingIssue({ roomName: getRoomLabel(room) })}
                                className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors dark:bg-black/20 dark:hover:bg-black/40 text-orange-600 dark:text-orange-400"
                                title="Report Issue in Room"
                            >
                                <AlertTriangle size={20} />
                            </button>
                            <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors dark:bg-black/20 dark:hover:bg-black/40 text-slate-900 dark:text-white">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
                        {tasks.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 min-h-[50vh] md:min-h-0">
                                <p className="mb-4">No tasks in this room yet.</p>
                                <Button onClick={onAddTask} variant="secondary">Create First Task</Button>
                            </div>
                        ) : (
                            <div className="space-y-3 md:space-y-4">
                                {tasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => onToggleTask(task.id, task.isCompleted)}
                                        className={`
                                        group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-slate-200 dark:border-white/5 cursor-pointer transition-all duration-200 active:scale-[0.98]
                                        ${task.isCompleted
                                                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-500/20'
                                                : 'bg-white dark:bg-slate-800/50 hover:border-emerald-500/50'
                                            }
                                    `}
                                    >
                                        <div className={`
                                        flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300
                                        ${task.isCompleted
                                                ? 'bg-emerald-500 text-white scale-100 shadow-lg shadow-emerald-500/30'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:scale-110'
                                            }
                                    `}>
                                            {getTaskIcon(task.title, 18)}
                                        </div>
                                        <span className={`flex-1 text-sm md:text-base font-medium ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                            {task.title}
                                        </span>

                                        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReportingIssue({ roomName: getRoomLabel(room), taskTitle: task.title });
                                                }}
                                                className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                                                title="Report Issue"
                                            >
                                                <AlertTriangle size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                title="Delete Task"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 md:p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-6 flex flex-col gap-3">
                        <Button
                            onClick={onAddTask}
                            className="w-full rounded-xl py-4 md:py-6 text-base md:text-lg shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white border-none bg-none"
                        >
                            <Plus size={20} className="mr-2" /> Add Task to Room
                        </Button>


                        {tasks.length === 0 && onAddPresets && (
                            <Button
                                onClick={onAddPresets}
                                variant="ghost"
                                className="w-full group rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 py-3 gap-2"
                            >
                                <Sparkles size={18} className="translate-y-[-1px]" />
                                Load Default {getRoomLabel(room)} Tasks
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Issue Reporting Modal */}
            <ReportIssueModal
                isOpen={!!reportingIssue}
                onClose={() => setReportingIssue(null)}
                propertyId={propertyId || ''}
                roomName={reportingIssue?.roomName || ''}
                taskTitle={reportingIssue?.taskTitle}
            />

            {/* Inventory Modal */}
            <InventoryModal
                isOpen={showInventory}
                onClose={() => setShowInventory(false)}
                propertyId={propertyId || ''}
                roomName={getRoomLabel(room)}
            />
        </>
    );
}
