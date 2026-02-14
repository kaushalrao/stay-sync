import React, { useState } from 'react';
import { X, Package, Save, Minus, Plus } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { addDoc, collection, writeBatch, doc } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';
import { CONSUMABLE_ITEMS } from '@constants/cleaning';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    roomName: string;
}

export function InventoryModal({ isOpen, onClose, propertyId, roomName }: InventoryModalProps) {
    const { user, showToast } = useApp();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !user) return null;

    // Determine category based on room name
    let category = 'Other';
    if (roomName.toLowerCase().includes('kitchen')) category = 'Kitchen';
    else if (roomName.toLowerCase().includes('bathroom') || roomName.toLowerCase().includes('bath')) category = 'Bathroom';
    else if (roomName.toLowerCase().includes('bedroom') || roomName.toLowerCase().includes('bed')) category = 'Bedroom';
    else if (roomName.toLowerCase().includes('living')) category = 'Living';

    const items = CONSUMABLE_ITEMS[category] || [];

    const handleIncrement = (item: string) => {
        setCounts(prev => ({ ...prev, [item]: (prev[item] || 0) + 1 }));
    };

    const handleDecrement = (item: string) => {
        setCounts(prev => ({
            ...prev,
            [item]: Math.max(0, (prev[item] || 0) - 1)
        }));
    };

    const handleSubmit = async () => {
        const itemsToLog = Object.entries(counts).filter(([_, count]) => count > 0);
        if (itemsToLog.length === 0) {
            onClose();
            return;
        }

        setIsSubmitting(true);
        try {
            const batch = writeBatch(db);
            const collectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/inventory-needs`);

            itemsToLog.forEach(([item, quantity]) => {
                const docRef = doc(collectionRef);
                batch.set(docRef, {
                    item,
                    quantity,
                    propertyId,
                    room: roomName,
                    status: 'pending',
                    createdAt: Date.now()
                });
            });

            await batch.commit();
            showToast(`Reported ${itemsToLog.length} items as low stock`, 'success');
            onClose();
            setCounts({});
        } catch (error) {
            console.error(error);
            showToast('Failed to save report', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10
                           p-6 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="text-amber-500" /> Report Low Stock
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                            No standard consumables defined for this room type.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-white/10 shadow-sm">
                                        <button
                                            onClick={() => handleDecrement(item)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            disabled={!counts[item]}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-6 text-center font-bold text-slate-900 dark:text-white">
                                            {counts[item] || 0}
                                        </span>
                                        <button
                                            onClick={() => handleIncrement(item)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md transition-colors bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-400"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
                    <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isSubmitting}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        <Save size={18} className="mr-2" />
                        Flag Low Stock
                    </Button>
                </div>
            </div>
        </div>
    );
}
