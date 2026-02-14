import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { getRoomLabel } from './utils';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: (title: string, room: string) => Promise<boolean>;
    allRooms: string[];
    preSelectedRoom: string | null;
}

export function AddTaskModal({ isOpen, onClose, onAddTask, allRooms, preSelectedRoom }: AddTaskModalProps) {
    const [isCustomRoom, setIsCustomRoom] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;

        let room = '';
        if (preSelectedRoom) {
            room = preSelectedRoom;
        } else if (isCustomRoom) {
            room = (formData.get('customRoom') as string).trim();
        } else {
            room = formData.get('room') as string;
        }

        if (!title || !room) return;

        setIsSubmitting(true);
        const success = await onAddTask(title, room);
        setIsSubmitting(false);

        if (success) {
            setIsCustomRoom(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <form
                onSubmit={handleSubmit}
                className="relative bg-white dark:bg-slate-900 border-t md:border border-slate-200 dark:border-white/10 
                           p-6 rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl 
                           animate-slide-up md:animate-scale-in pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile Drag Handle */}
                <div className="md:hidden flex justify-center -mt-2 mb-4" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">New Cleaning Task</h3>

                <div className="space-y-4 mb-8">
                    <Input name="title" label="What needs to be done?" placeholder="e.g. Vacuum the rug" required autoFocus disabled={isSubmitting} />

                    {!preSelectedRoom && (
                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Room</label>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomRoom(!isCustomRoom)}
                                    className="text-xs text-indigo-500 hover:text-indigo-400 font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isCustomRoom ? 'Select Existing' : '+ Create New'}
                                </button>
                            </div>

                            {isCustomRoom ? (
                                <Input
                                    name="customRoom"
                                    placeholder="e.g. Guest House, Basement..."
                                    required={isCustomRoom}
                                    disabled={isSubmitting}
                                />
                            ) : (
                                <div className="relative">
                                    <select name="room" className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none" disabled={isSubmitting}>
                                        {allRooms.map(r => (
                                            <option key={r} value={r}>{getRoomLabel(r)}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-between gap-3">
                    <Button type="button" variant="secondary" onClick={() => { onClose(); setIsCustomRoom(false); }} className="rounded-xl flex-1" disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" className="rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white bg-none" isLoading={isSubmitting}>Save Task</Button>
                </div>
            </form>
        </div>
    );
}
