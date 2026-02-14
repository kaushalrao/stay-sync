import React, { useState } from 'react';
import { X, AlertTriangle, Save } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { addDoc, collection } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    roomName: string;
    taskTitle?: string;
}

export function ReportIssueModal({ isOpen, onClose, propertyId, roomName, taskTitle }: ReportIssueModalProps) {
    const { user, showToast } = useApp();
    const [title, setTitle] = useState(taskTitle ? `Issue with: ${taskTitle}` : '');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update title when prop changes
    React.useEffect(() => {
        if (isOpen) {
            setTitle(taskTitle ? `${roomName}: Issue with "${taskTitle}"` : `${roomName}: `);
        }
    }, [isOpen, taskTitle, roomName]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/maintenance`), {
                title: title.trim(),
                propertyId,
                priority,
                status: 'pending',
                source: 'cleaning-checklist',
                room: roomName,
                createdAt: Date.now()
            });
            showToast('Issue reported successfully', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Failed to report issue', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <form
                onSubmit={handleSubmit}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 
                           p-6 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="text-orange-500" /> Report Issue
                    </h3>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <Input
                        label="Issue Description"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Describe the issue..."
                        autoFocus
                        required
                    />

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                        <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold capitalize transition-all border ${priority === p
                                            ? p === 'high' ? 'bg-red-100 border-red-500 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                                : p === 'medium' ? 'bg-orange-100 border-orange-500 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                                                    : 'bg-blue-100 border-blue-500 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                            : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" className="flex-1" isLoading={isSubmitting} disabled={isSubmitting}>
                        <Save size={18} className="mr-2" /> Report Issue
                    </Button>
                </div>
            </form>
        </div>
    );
}
