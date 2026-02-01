import React from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ActivityItemProps } from '@/app/lib/types';

export const ActivityItem: React.FC<ActivityItemProps> = ({ guest, onClick }) => {
    const isToday = isSameDay(parseISO(guest.checkInDate), new Date());

    return (
        <div
            onClick={onClick}
            className="bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 p-4 rounded-2xl transition-all cursor-pointer group flex items-center justify-between"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${isToday ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-700 text-slate-300'}`}>
                    {format(parseISO(guest.checkInDate), 'dd')}
                </div>
                <div>
                    <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{guest.guestName}</h4>
                    <p className="text-xs text-slate-400 font-medium truncate max-w-[140px]">{guest.propName || 'Unknown Property'}</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${isToday ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-700/50 text-slate-400'}`}>
                    {isToday ? 'Today' : format(parseISO(guest.checkInDate), 'MMM')}
                </span>
            </div>
        </div>
    );
};
