"use client";

import React, { useState } from 'react';
import { useApp } from '@components/providers/AppProvider';
import { useRouter } from 'next/navigation';
import { Wrench, Plus, CheckCircle2, Circle, Trash2, Filter, Home, ChevronDown } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { MaintenanceIssue } from '@lib/types';
import { usePropertyStore, useUIStore } from '@store/index';
import { useMaintenance } from '@hooks/maintenance/useMaintenance';

export default function MaintenancePage() {
    const { user } = useApp();
    const router = useRouter();
    const properties = usePropertyStore(state => state.properties);
    const filterProp = useUIStore(state => state.selectedPropertyId) || 'all';
    const setFilterProp = useUIStore(state => state.setSelectedPropertyId);

    const [isAdding, setIsAdding] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'fixed'>('all');

    const {
        issues,
        addIssue,
        toggleStatus,
        deleteIssue
    } = useMaintenance(filterProp);

    React.useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user, router]);

    if (!user) return null;

    const handleAddIssue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const propertyId = formData.get('propertyId') as string;
        const priority = formData.get('priority') as 'low' | 'medium' | 'high';

        if (!title || !propertyId) return;

        const success = await addIssue(title, priority, propertyId);
        if (success) setIsAdding(false);
    };

    const handleToggleStatus = async (issue: MaintenanceIssue) => {
        await toggleStatus(issue);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this issue?')) return;
        await deleteIssue(id);
    };

    const filteredIssues = issues.filter(issue => {
        if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
        if (filterStatus === 'pending' && issue.status === 'in-progress') return true; // Show in-progress in pending view
        if (filterProp !== 'all' && issue.propertyId !== filterProp) return false;
        return true;
    }).sort((a, b) => {
        // 1. Sort by Status: Pending/In-progress first, Fixed last
        const statusRank = (status: string) => (status === 'fixed' ? 1 : 0);
        const statusDiff = statusRank(a.status) - statusRank(b.status);
        if (statusDiff !== 0) return statusDiff;

        // 2. Sort by Priority: High > Medium > Low
        const priorityRank = (priority: string) => {
            if (priority === 'high') return 3;
            if (priority === 'medium') return 2;
            return 1; // low
        };
        const priorityDiff = priorityRank(b.priority) - priorityRank(a.priority);
        if (priorityDiff !== 0) return priorityDiff;

        // 3. Sort by Date: Newest first
        return b.createdAt - a.createdAt;
    });

    return (
        <div className="animate-fade-in mx-auto w-full pb-20 px-6 pt-4 md:pt-8 safe-area-top">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <Wrench className="text-orange-500" /> Maintenance
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Track repairs and tasks across your properties.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className="rounded-xl whitespace-nowrap w-full md:w-auto">
                    <Plus size={20} /> Report Issue
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 md:mb-0">
                    <Filter size={14} /> Filters:
                </div>
                <div className="relative w-full md:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full md:w-auto bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="fixed">Fixed</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative w-full md:w-auto">
                    <select
                        value={filterProp}
                        onChange={(e) => setFilterProp(e.target.value)}
                        className="w-full md:w-auto bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        <option value="all">All Properties</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={(e) => {
                    if (e.target === e.currentTarget) setIsAdding(false);
                }}>
                    <form onSubmit={handleAddIssue} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Report New Issue</h3>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <Input name="title" label="Issue Description" placeholder="e.g. Leaky faucet in bathroom" required autoFocus />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Property</label>
                                    <div className="relative">
                                        <select name="propertyId" className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none" required>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                                    <div className="relative">
                                        <select name="priority" className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none">
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={() => setIsAdding(false)} className="rounded-xl">Cancel</Button>
                            <Button type="submit" className="rounded-xl">Save Issue</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Issues List */}
            <div className="space-y-4">
                {filteredIssues.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No issues found. Everything looks good!</p>
                    </div>
                )}
                {filteredIssues.map(issue => {
                    const property = properties.find(p => p.id === issue.propertyId);
                    return (
                        <div key={issue.id} className={`bg-white dark:bg-slate-800/30 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm dark:shadow-none ${issue.status === 'fixed' ? 'opacity-60' : ''}`}>
                            <button
                                onClick={() => handleToggleStatus(issue)}
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${issue.status === 'fixed' ? 'bg-green-500/20 text-green-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-green-500/20 hover:text-green-500'}`}
                            >
                                {issue.status === 'fixed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 mb-1">
                                    <h3 className={`font-bold text-lg break-words ${issue.status === 'fixed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>{issue.title}</h3>
                                    {issue.priority === 'high' && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase rounded-full border border-red-200 dark:border-red-500/20">High</span>}
                                    {issue.priority === 'medium' && <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase rounded-full border border-orange-200 dark:border-orange-500/20">Med</span>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><Home size={12} /> {property?.name || 'Unknown Property'}</span>
                                    <span>•</span>
                                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button onClick={() => handleDelete(issue.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors md:opacity-0 md:group-hover:opacity-100">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
