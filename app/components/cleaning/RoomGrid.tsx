import React from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@components/ui/Button';

interface RoomGridProps {
    children: React.ReactNode;
    onManageRooms: () => void;
}

export function RoomGrid({ children, onManageRooms }: RoomGridProps) {
    return (
        <div>
            {/* Filters / Add Task Bar */}
            <div className="flex justify-between items-end mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rooms & Areas</h3>
                <Button
                    variant="secondary"
                    onClick={onManageRooms}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <Settings2 size={16} className="mr-2" /> Manage Rooms
                </Button>
            </div>

            {/* ROOM CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {children}
            </div>
        </div>
    );
}
