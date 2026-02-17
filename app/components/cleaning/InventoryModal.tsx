import React, { useState } from 'react';
import { X, Package, Save, Minus, Plus } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { addDoc, collection, writeBatch, doc } from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { useApp } from '@components/providers/AppProvider';
import { useInventory } from '@hooks/useInventory';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    roomName: string;
    forcedCategory?: string;
}

export function InventoryModal({ isOpen, onClose, propertyId, roomName, forcedCategory }: InventoryModalProps) {
    const { user, showToast } = useApp();
    const { masterItems, needs, isLoading } = useInventory();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate existing needs for this room
    const currentRoomNeeds = React.useMemo(() => {
        const map: Record<string, number> = {};
        needs.forEach(need => {
            if (need.propertyId === propertyId && need.room === roomName && need.status === 'pending') {
                map[need.item] = (map[need.item] || 0) + need.quantity;
            }
        });
        return map;
    }, [needs, propertyId, roomName]);

    if (!isOpen || !user) return null;

    // Determine category based on room name
    // Default to 'General' if no specific category is forced.
    // We strictly use the assigned room type now.
    const category = forcedCategory || 'General';

    // Filter items from Master Inventory based on category
    // We also include items with 'General' category or matching the room category
    const items = masterItems
        .filter(item => item.category === category || item.category === 'General')
        .map(i => i.item);

    // If no items found for this specific category, maybe fallback to showing everything or a "General" list?
    // For now, let's stick to the category filter to keep it relevant.

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
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center text-slate-500 py-8 flex flex-col items-center">
                            <Package size={32} className="mb-3 opacity-20" />
                            <p>No standard consumables found for <strong>{category}</strong>.</p>
                            <p className="text-xs mt-2 text-slate-400">Add items to Master Inventory with category &quot;{category}&quot;</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map(item => {
                                const pendingCount = currentRoomNeeds[item] || 0;
                                const currentCount = counts[item] || 0;
                                const totalCount = pendingCount + currentCount;

                                return (
                                    <div key={item} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
                                            {pendingCount > 0 && (
                                                <span className="text-xs text-orange-500 font-medium mt-0.5">
                                                    {pendingCount} already pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-white/10 shadow-sm">
                                            <button
                                                onClick={() => handleDecrement(item)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                disabled={!counts[item]}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-6 text-center font-bold text-slate-900 dark:text-white">
                                                {totalCount}
                                            </span>
                                            <button
                                                onClick={() => handleIncrement(item)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md transition-colors bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-400"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
