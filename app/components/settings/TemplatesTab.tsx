import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, Plus, LogOut, MessageCircle, Sparkles, X } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Template, VariableEditorRef } from '@lib/types';
import { app, db, appId } from '@lib/firebase';
import { AVAILABLE_ICONS } from '@lib/constants';
import { getIconForTemplate } from '@lib/utils';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { VariableEditor } from '@components/ui/VariableEditor';
import { VariableList } from '@components/greeter/VariableList';
import { SortableTemplateItem } from '@components/greeter/SortableTemplateItem';
import { useApp } from '@components/providers/AppProvider';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor,
    MouseSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

export function TemplatesTab() {
    const { templates, showToast, user } = useApp();
    const [editingTemp, setEditingTemp] = useState<Partial<Template> | null>(null);
    const [orderedTemplates, setOrderedTemplates] = useState<Template[]>([]);
    const editorRef = useRef<VariableEditorRef>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        setOrderedTemplates(templates);
    }, [templates]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor),
        useSensor(MouseSensor)
    );

    const saveToFirestore = async (collectionName: string, data: any, id?: string) => {
        if (!app || !user) {
            showToast("Firebase/User not initialized", "error");
            return false;
        }
        try {
            const path = `artifacts/${appId}/users/${user.uid}/${collectionName}`;
            if (id) {
                await updateDoc(doc(db, path, id), data);
            } else {
                await addDoc(collection(db, path), data);
            }
            return true;
        } catch (e) {
            console.error(e);
            showToast("Error saving data", "error");
            return false;
        }
    };

    const deleteFromFirestore = async (collectionName: string, id: string) => {
        if (!app || !user) return false;
        try {
            const path = `artifacts/${appId}/users/${user.uid}/${collectionName}`;
            await deleteDoc(doc(db, path, id));
            return true;
        } catch (e) {
            console.error(e);
            showToast("Error deleting data", "error");
            return false;
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setOrderedTemplates((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist order
                newItems.forEach((item, index) => {
                    if (item.order !== index) {
                        saveToFirestore('templates', { ...item, order: index }, item.id);
                    }
                });

                return newItems;
            });
        }
    };

    const handleSaveTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingTemp) return;
        const formData = new FormData(e.currentTarget);

        const label = formData.get('label') as string;
        const content = editingTemp.content || '';

        if (!label.trim() || !content.trim()) {
            showToast("Template Name and Content are required", "error");
            return;
        }

        const newTemp = {
            label: label,
            content: content,
            icon: getIconForTemplate(label),
            order: templates.length
        };

        const success = await saveToFirestore('templates', newTemp, editingTemp.id);
        if (success) {
            setEditingTemp(null);
            showToast('Template saved successfully!', 'success');
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (confirm('Delete this template?')) {
            const success = await deleteFromFirestore('templates', id);
            if (success) showToast('Template deleted', 'success');
        }
    };

    const insertVariable = (tag: string) => {
        if (editorRef.current) {
            editorRef.current.insert(tag);
            setIsDrawerOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            {!editingTemp ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No templates found. Create your first template!</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={orderedTemplates}
                                strategy={rectSortingStrategy}
                            >
                                {orderedTemplates.map((t) => (
                                    <SortableTemplateItem
                                        key={t.id}
                                        template={t}
                                        onEdit={setEditingTemp}
                                        onDelete={handleDeleteTemplate}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                    <button onClick={() => setEditingTemp({})} className="flex flex-col items-center justify-center min-h-[160px] rounded-[2rem] border-2 border-dashed border-slate-700/50 text-slate-500 hover:text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all gap-3 group relative overflow-hidden">
                        <div className="p-4 rounded-full bg-slate-800 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-indigo-500/40"><Plus size={24} /></div>
                        <span className="font-bold text-sm tracking-wide">Create Template</span>
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSaveTemplate} className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 max-w-4xl mx-auto animate-fade-in shadow-2xl relative ring-1 ring-white/5">
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                        <h3 className="text-2xl font-bold text-white mb-1">{editingTemp.id ? 'Edit Template' : 'New Template'}</h3>
                        <button type="button" onClick={() => setEditingTemp(null)} className="p-3 bg-slate-700/50 rounded-full text-slate-400 hover:text-white"><LogOut size={20} className="rotate-180" /></button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
                        <div className="lg:col-span-2 space-y-6">
                            <Input name="label" label="Template Name" icon={<MessageCircle size={12} />} defaultValue={editingTemp.label} required />
                            <div className="space-y-2">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Edit3 size={12} /> Content</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsDrawerOpen(true)}
                                        className="lg:hidden text-orange-400 text-xs font-bold flex items-center gap-1"
                                    >
                                        <Sparkles size={12} /> Insert Variable
                                    </button>
                                </div>

                                <VariableEditor
                                    ref={editorRef}
                                    value={editingTemp.content || ''}
                                    onChange={(newContent) => setEditingTemp(prev => ({ ...prev!, content: newContent }))}
                                />
                            </div>
                        </div>
                        <div className="hidden lg:flex bg-slate-900/30 rounded-3xl border border-white/5 sticky top-8 h-fit max-h-[600px] flex-col shadow-xl">
                            <div className="bg-slate-900/95 backdrop-blur-xl z-10 px-6 py-4 border-b border-white/5 rounded-t-3xl shrink-0">
                                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} className="text-orange-400" /> Click to Insert
                                </h4>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <VariableList onInsert={insertVariable} />
                            </div>
                        </div>

                        {isDrawerOpen && (
                            <div className="fixed inset-0 z-[100] lg:hidden">
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)} />
                                <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto animate-slide-up shadow-2xl">
                                    <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-white/5">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles size={18} className="text-orange-400" /> Insert Variable</h3>
                                        <button type="button" onClick={() => setIsDrawerOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
                                    </div>
                                    <VariableList onInsert={(tag) => {
                                        insertVariable(tag);
                                        setIsDrawerOpen(false);
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4 pt-8 mt-4 border-t border-white/5">
                        <Button type="button" variant="secondary" className="flex-1 py-4 rounded-2xl" onClick={() => setEditingTemp(null)}>Cancel</Button>
                        <Button type="submit" className="flex-1 py-4 rounded-2xl">Save Template</Button>
                    </div>

                    <div className="lg:hidden fixed bottom-6 right-6 z-50">
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(true)}
                            className="w-14 h-14 bg-orange-500 text-white rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center active:scale-90 transition-all hover:scale-105 border border-white/10"
                        >
                            <Sparkles size={24} fill="white" />
                        </button>
                    </div>

                </form>
            )}
        </div>
    );
}
