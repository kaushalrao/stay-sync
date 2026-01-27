import React, { useState, useRef, useEffect } from 'react';
import {
    format,
    parseISO,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isAfter,
    isBefore,
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { isDateBlocked, isTurnoverDate } from '../../lib/utils';

interface DatePickerProps {
    date: string;
    onChange: (date: string) => void;
    label: string;
    blockedDates?: { start: string, end: string }[];
    variant?: 'check-in' | 'check-out';
    align?: 'left' | 'right';
    otherDate?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ date, onChange, label, blockedDates = [], variant = 'check-in', align = 'left', otherDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentMonth, setCurrentMonth] = useState(date ? parseISO(date) : new Date());

    const selectedDate = date ? parseISO(date) : undefined;
    const comparisonDate = otherDate ? parseISO(otherDate) : undefined;

    const checkIsDateBlocked = (day: Date) => {
        // Strict check for "yesterday" and before
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isBefore(day, today)) return true;

        const dayStr = format(day, 'yyyy-MM-dd');
        return isDateBlocked(dayStr, blockedDates, variant);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Generate days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const handleSelect = (day: Date) => {
        if (!checkIsDateBlocked(day)) {
            onChange(format(day, 'yyyy-MM-dd'));
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync current month when date changes externally
    useEffect(() => {
        if (date) {
            setCurrentMonth(parseISO(date));
        }
    }, [date]);

    return (
        <div className="relative group" ref={containerRef}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1 group-focus-within:text-orange-400">
                <CalendarIcon size={12} className="shrink-0" />
                <span>{label}</span>
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-xs md:text-sm font-bold text-white transition-all hover:bg-slate-800 focus:outline-none focus:border-orange-500/50 ${isOpen ? 'border-orange-500/50 ring-1 ring-orange-500/50' : ''}`}
            >
                {date ? format(parseISO(date), 'MMM dd, yyyy') : <span className="text-slate-600">Select Date</span>}
            </button>

            {isOpen && (
                <div className={`absolute top-full z-50 mt-2 p-4 bg-slate-1000 border border-white/10 rounded-2xl shadow-2xl animate-fade-in ${align === 'right' ? 'right-0' : 'left-0'} w-[300px] bg-[#0f172a]`}>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-white font-bold text-sm">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {days.map((day) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isComparison = comparisonDate && isSameDay(day, comparisonDate);
                            const blocked = checkIsDateBlocked(day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isToDay = isToday(day);
                            const isTurnover = isTurnoverDate(dayStr, blockedDates, variant);

                            // Range Logic
                            let isInRange = false;
                            let isRangeStart = false;
                            let isRangeEnd = false;

                            if (selectedDate && comparisonDate) {
                                const start = selectedDate < comparisonDate ? selectedDate : comparisonDate;
                                const end = selectedDate < comparisonDate ? comparisonDate : selectedDate;

                                isInRange = isAfter(day, start) && isBefore(day, end);
                                isRangeStart = isSameDay(day, start);
                                isRangeEnd = isSameDay(day, end);
                            }

                            // Base styling
                            let bgClass = '';
                            let textClass = 'text-white hover:bg-slate-800';
                            let roundedClass = 'rounded-lg';

                            if (isInRange) {
                                bgClass = 'bg-orange-500/20';
                                textClass = 'text-white';
                                roundedClass = 'rounded-none';
                            }

                            // Range Connections
                            if (isRangeStart && comparisonDate) roundedClass = 'rounded-l-lg rounded-r-none';
                            if (isRangeEnd && comparisonDate) roundedClass = 'rounded-l-none rounded-r-lg';
                            if (isRangeStart && isRangeEnd) roundedClass = 'rounded-lg';

                            // Overrides for endpoints
                            if (isSelected || isComparison) {
                                bgClass = 'bg-orange-600';
                                textClass = '!text-white font-bold shadow-lg';
                            }

                            // Turnover Styling
                            if (isTurnover && !isSelected && !isComparison && !isInRange) {
                                textClass = 'text-slate-500 font-medium relative';
                            }

                            if (blocked) {
                                textClass = 'text-slate-700 cursor-not-allowed';
                                bgClass = '';
                            }

                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    onClick={() => handleSelect(day)}
                                    disabled={blocked}
                                    className={`
                                        h-9 w-full flex items-center justify-center text-xs transition-all relative
                                        ${!isCurrentMonth ? 'invisible' : ''}
                                        ${textClass}
                                        ${bgClass}
                                        ${roundedClass}
                                    `}
                                >
                                    <span className="relative z-10">{format(day, 'd')}</span>
                                    {isToDay && !isSelected && !isComparison && !blocked && !isInRange && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
