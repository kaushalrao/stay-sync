import React, { useState, useEffect } from 'react';
import { CheckCircle2, ClipboardCheck, Send } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

interface CompleteChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: { staffName: string; remarks: string }) => Promise<boolean>;
    totalTasks: number;
    completedTasks: number;
    defaultStaffName: string;
}

export function CompleteChecklistModal({
    isOpen,
    onClose,
    onComplete,
    totalTasks,
    completedTasks,
    defaultStaffName
}: CompleteChecklistModalProps) {
    const [staffName, setStaffName] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStaffName(defaultStaffName || '');
            setRemarks('');
        }
    }, [isOpen, defaultStaffName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staffName.trim()) return;

        setIsSubmitting(true);
        const success = await onComplete({ staffName, remarks });
        setIsSubmitting(false);

        if (success) {
            onClose();
        }
    };

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Complete & Notify Host</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Marking this property as guest-ready.</p>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <ClipboardCheck size={16} className="text-slate-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tasks Summary</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${completionRate === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {completionRate === 100 ? 'Fully Cleaned' : 'Partial Cleaning'}
                        </span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {completedTasks} <span className="text-slate-400 font-normal">/ {totalTasks}</span>
                        </div>
                        <div className="text-emerald-500 font-bold text-sm">
                            {completionRate}% Complete
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <Input
                        label="Cleaned By"
                        placeholder="Your Name"
                        value={staffName}
                        onChange={e => setStaffName(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Remarks (Optional)
                        </label>
                        <textarea
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none h-24"
                            placeholder="Any specific notes for the host?"
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="flex justify-between gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="rounded-xl flex-1"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white bg-none border-none shadow-lg shadow-emerald-500/20"
                        isLoading={isSubmitting}
                    >
                        <Send size={18} className="mr-2" />
                        {completionRate === 100 ? 'Send & Reset' : 'Send Notification'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
