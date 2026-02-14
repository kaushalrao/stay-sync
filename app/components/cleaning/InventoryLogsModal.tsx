import React, { useEffect, useState } from 'react';
import { X, History, Package } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';

interface InventoryLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
}

interface InventoryLog {
    id: string;
    item: string;
    quantity: number;
    room: string;
    type: 'consumed' | 'restock';
    createdAt: number;
}

export function InventoryLogsModal({ isOpen, onClose, propertyId }: InventoryLogsModalProps) {
    const { user } = useApp();
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !user || !propertyId) return;

        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const q = query(
                    collection(db, `artifacts/${appId}/users/${user.uid}/inventory-logs`),
                    where("propertyId", "==", propertyId),
                    limit(50)
                );

                const snapshot = await getDocs(q);
                const fetched = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as InventoryLog[];

                // Client-side sort to avoid needing a composite index immediately
                fetched.sort((a, b) => b.createdAt - a.createdAt);

                setLogs(fetched);
            } catch (error) {
                console.error("Error fetching inventory logs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [isOpen, user, propertyId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 
                           p-6 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in flex flex-col max-h-[85vh] h-[600px]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="text-purple-500" /> Inventory History
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                            <Package size={48} className="mb-4 opacity-20" />
                            <p>No inventory logs found for this property.</p>
                        </div>
                    ) : (
                        <div className="relative border-l border-slate-200 dark:border-white/10 ml-3 space-y-6 pb-4">
                            {logs.map((log) => (
                                <div key={log.id} className="relative pl-6">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />

                                    <div className="text-xs font-semibold text-slate-400 mb-1">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {log.item}
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
                                                    +{log.quantity}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Restocked in <span className="font-medium text-slate-700 dark:text-slate-300">{log.room}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
