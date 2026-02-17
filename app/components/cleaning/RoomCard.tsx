import React from 'react';
import { getRoomGradient, getRoomIcon, getRoomLabel } from './utils';
import { Package } from 'lucide-react';

interface RoomCardProps {
    room: string;
    totalTasks: number;
    completedTasks: number;
    idx: number; // for animation delay
    onClick: (room: string) => void;
    hasNeeds?: boolean;
}

export function RoomCard({ room, totalTasks, completedTasks, idx, onClick, hasNeeds }: RoomCardProps) {
    const roomProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const isDone = totalTasks > 0 && roomProgress === 100;

    return (
        <button
            onClick={() => onClick(room)}
            className={`
                relative p-6 rounded-3xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group
                bg-gradient-to-br ${getRoomGradient(room, isDone)}
                ${isDone
                    ? 'shadow-lg shadow-emerald-500/20 border-transparent'
                    : 'border-white/60 dark:border-white/5 shadow-sm hover:shadow-md hover:border-transparent'
                }
            `}
            style={{ animationDelay: `${idx * 100}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${isDone ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                    {getRoomIcon(room)}
                </div>
                <div className="flex gap-2 items-center">
                    {hasNeeds && (
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full shadow-sm border border-orange-200 dark:border-orange-500/30 animate-pulse">
                            <Package size={16} />
                        </div>
                    )}
                    {isDone && <div className="bg-white text-emerald-600 px-3 h-8 flex items-center rounded-full text-xs font-bold shadow-sm">DONE</div>}
                </div>
            </div>

            <h4 className="text-xl font-bold mb-1">{getRoomLabel(room)}</h4>
            <p className={`text-sm mb-4 ${isDone ? 'text-emerald-600/80' : 'text-slate-500 dark:text-slate-400'}`}>
                {totalTasks === 0 ? 'No tasks yet' : `${completedTasks}/${totalTasks} tasks completed`}
            </p>

            {/* Mini Progress Bar */}
            <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-current opacity-80'}`}
                    style={{ width: `${roomProgress}%` }}
                />
            </div>
        </button>
    );
}
