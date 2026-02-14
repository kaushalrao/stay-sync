import React, { useEffect, useState } from 'react';
import { X, History, ShoppingCart, Check, Calendar } from 'lucide-react';
import { collection, query, where, getDocs, limit, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';

interface InventoryManagerModalProps {
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

interface InventoryNeed {
    id: string;
    item: string;
    quantity: number;
    room: string;
    status: 'pending';
    createdAt: number;
}

export function InventoryManagerModal({ isOpen, onClose, propertyId }: InventoryManagerModalProps) {
    const { user, showToast } = useApp();
    const [activeTab, setActiveTab] = useState<'shopping' | 'history'>('shopping');

    const [needs, setNeeds] = useState<InventoryNeed[]>([]);
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch Data
    useEffect(() => {
        if (!isOpen || !user || !propertyId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Needs
                const needsQuery = query(
                    collection(db, `artifacts/${appId}/users/${user.uid}/inventory-needs`),
                    where("propertyId", "==", propertyId)
                );
                const needsSnap = await getDocs(needsQuery);
                const fetchedNeeds = needsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as InventoryNeed[];

                // Client-side sort needs by date desc
                fetchedNeeds.sort((a, b) => b.createdAt - a.createdAt);
                setNeeds(fetchedNeeds);

                // Fetch History
                const logsQuery = query(
                    collection(db, `artifacts/${appId}/users/${user.uid}/inventory-logs`),
                    where("propertyId", "==", propertyId),
                    limit(50)
                );
                const logsSnap = await getDocs(logsQuery);
                const fetchedLogs = logsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as InventoryLog[];

                // Client-side sort logs by date desc
                fetchedLogs.sort((a, b) => b.createdAt - a.createdAt);
                setLogs(fetchedLogs);

            } catch (error) {
                console.error("Error fetching inventory data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen, user, propertyId]);

    const handleMarkRestocked = async (need: InventoryNeed) => {
        if (!user) return;
        setProcessingId(need.id);

        try {
            const batch = writeBatch(db);

            // 1. Delete from needs
            const needRef = doc(db, `artifacts/${appId}/users/${user.uid}/inventory-needs`, need.id);
            batch.delete(needRef);

            // 2. Add to logs
            const logRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/inventory-logs`));
            batch.set(logRef, {
                item: need.item,
                quantity: need.quantity,
                propertyId,
                room: need.room,
                type: 'restock',
                createdAt: Date.now()
            });

            await batch.commit();

            // Optimistic Update
            setNeeds(prev => prev.filter(n => n.id !== need.id));
            setLogs(prev => [{
                id: logRef.id,
                item: need.item,
                quantity: need.quantity,
                room: need.room,
                type: 'restock',
                createdAt: Date.now()
            }, ...prev]);

            showToast("Item marked as restocked", "success");

        } catch (error) {
            console.error(error);
            showToast("Failed to update inventory", "error");
        } finally {
            setProcessingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 
                           p-6 rounded-3xl w-full max-w-2xl shadow-2xl animate-scale-in flex flex-col max-h-[85vh] h-[700px]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="text-emerald-500" /> Inventory Manager
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('shopping')}
                        className={`flex-1 pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'shopping'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        Shopping List ({needs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'history'
                            ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        History
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                        </div>
                    ) : activeTab === 'shopping' ? (
                        <>
                            {needs.length === 0 ? (
                                <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                                    <p className="font-medium text-lg text-slate-600 dark:text-slate-400">All Stocked Up! 🎉</p>
                                    <p className="text-sm mt-1">No low stock items reported.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {needs.map((need) => (
                                        <div key={need.id} className="group bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm shrink-0">
                                                    {need.quantity}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{need.item}</h4>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 flex-wrap">
                                                        Reported in <span className="font-medium text-slate-700 dark:text-slate-300">{need.room}</span>
                                                        <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-300 mx-1" />
                                                        <span className="md:hidden text-slate-300 mx-1">•</span>
                                                        {new Date(need.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleMarkRestocked(need)}
                                                disabled={processingId === need.id}
                                                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20 active:scale-95"
                                            >
                                                {processingId === need.id ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Check size={16} />
                                                )}
                                                Mark Restocked
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        // HISTORY TAB
                        <>
                            {logs.length === 0 ? (
                                <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                                    <History size={48} className="mb-4 opacity-20" />
                                    <p>No inventory history found.</p>
                                </div>
                            ) : (
                                <div className="relative border-l border-slate-200 dark:border-white/10 ml-3 space-y-6 pb-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="relative pl-6">
                                            <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />

                                            <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                                <Calendar size={10} />
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
