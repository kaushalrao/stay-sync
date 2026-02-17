"use client";

import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, Check, X, Save } from 'lucide-react';
import { useInventory } from '@hooks/useInventory';
import { Button } from '@components/ui/Button';
import { InventoryMasterItem } from '@lib/types';

export function MasterInventory() {
    const { masterItems, addMasterItem, updateMasterItem, deleteMasterItem } = useInventory();
    const [isEditMode, setIsEditMode] = useState(false);
    const [newItemValues, setNewItemValues] = useState<Record<string, string>>({});
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Group items by category (computed from fetched data)
    const itemsByCategory = React.useMemo(() => {
        const groups: Record<string, InventoryMasterItem[]> = {};
        masterItems.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [masterItems]);

    // Handle adding a new item
    const handleAddItem = async (category: string) => {
        const value = newItemValues[category]?.trim();
        if (!value) return;

        await addMasterItem(category, value);
        setNewItemValues(prev => ({ ...prev, [category]: '' }));
    };

    // Handle saving an edited item
    const handleSaveEdit = async (id: string) => {
        if (!editValue.trim()) return;
        await updateMasterItem(id, { item: editValue.trim() });
        setEditingItemId(null);
        setEditValue('');
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await deleteMasterItem(id);
        }
    };

    // Get unique categories including empty ones if we want to support adding anywhere? 
    // Ideally we should have a way to add new categories too, but for now let's stick to existing + standard ones
    // Or just derive from items. 
    // If migration happened, we have standard categories.
    const categories = Object.keys(itemsByCategory).sort();

    return (
        <div className="pb-24 md:pb-0 relative space-y-4">
            {/* Floating Action Button for Edit Mode */}
            <div className="fixed bottom-6 md:bottom-8 right-4 md:right-8 z-30">
                <Button
                    variant={isEditMode ? "primary" : "ghost"}
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`gap-2 shadow-xl rounded-full px-5 py-3 md:py-2.5 ${!isEditMode ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700' : ''}`}
                >
                    {isEditMode ? <Check size={18} /> : <Edit2 size={18} />}
                    {isEditMode ? 'Done Editing' : 'Edit List'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
                {categories.map((category) => (
                    <div key={category} className="bg-white dark:bg-slate-800/50 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col h-full">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <Package size={20} className="text-indigo-500" />
                            {category}
                        </h3>
                        <ul className="space-y-2.5 md:space-y-2 flex-grow">
                            {itemsByCategory[category].map((item) => (
                                <li key={item.id} className="flex items-center gap-3 md:gap-2 text-slate-600 dark:text-slate-300 text-sm md:text-sm group min-h-[28px]">
                                    {editingItemId === item.id ? (
                                        <div className="flex items-center gap-2 w-full animate-fade-in">
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="flex-1 bg-white dark:bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs focus:outline-none"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(item.id);
                                                    if (e.key === 'Escape') setEditingItemId(null);
                                                }}
                                            />
                                            <button onClick={() => handleSaveEdit(item.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded">
                                                <Save size={14} />
                                            </button>
                                            <button onClick={() => setEditingItemId(null)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isEditMode ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-300 dark:bg-slate-600'} shrink-0 transiton-colors`} />
                                            <span className="leading-snug flex-1">{item.item}</span>

                                            {isEditMode && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditValue(item.item);
                                                            setEditingItemId(item.id);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {isEditMode && (
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add item..."
                                        value={newItemValues[category] || ''}
                                        onChange={(e) => setNewItemValues(prev => ({ ...prev, [category]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddItem(category);
                                        }}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                    <button
                                        onClick={() => handleAddItem(category)}
                                        className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                        disabled={!newItemValues[category]?.trim()}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Optional: Add Empty State or "Add Category" card? For now stick to populated categories */}
                {categories.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        <p>Loading master inventory...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
