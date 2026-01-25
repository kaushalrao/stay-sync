import * as React from 'react';
import { ChevronLeft, PenTool, Eye, Settings, MessageCircle, LogOut } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from '../lib/firebase';
import { ViewState, Property } from '../lib/types';
import { TabControl } from './TabControl';
import { PropertyDock } from './PropertyDock';

export const Header: React.FC<{
    view: ViewState;
    setView: (v: ViewState) => void;
    mobileTab: 'edit' | 'preview';
    setMobileTab: (t: 'edit' | 'preview') => void;
    properties: Property[];
    selectedPropId: string;
    setSelectedPropId: (id: string) => void;
}> = ({ view, setView, mobileTab, setMobileTab, properties, selectedPropId, setSelectedPropId }) => (
    <div className={`sticky top-0 z-50 flex flex-col transition-all duration-300 ${view === 'home' ? 'bg-transparent' : 'bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5'}`}>
        <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3 w-full">
                    {view !== 'home' && (
                        <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-slate-300">
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {view === 'settings' && (
                        <h1 className="text-xl font-bold text-white tracking-tight animate-fade-in">Settings</h1>
                    )}

                    {/* Mobile Greeter Header Controls */}
                    {view === 'greeter' && (
                        <div className="flex-1 flex justify-center lg:justify-start">
                            <div className="lg:hidden">
                                <TabControl
                                    options={[{ id: 'edit', label: 'Editor', icon: <PenTool size={12} /> }, { id: 'preview', label: 'Preview', icon: <Eye size={12} /> }]}
                                    activeId={mobileTab}
                                    onChange={setMobileTab}
                                    className="text-xs"
                                />
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-tight animate-fade-in hidden lg:block">Greeter</h1>
                        </div>
                    )}
                </div>

                <div className="ml-auto flex-shrink-0 flex items-center gap-2">
                    {view === 'greeter' ? (
                        <button onClick={() => setView('settings')} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 hover:bg-slate-700"><Settings size={20} /></button>
                    ) : view === 'settings' ? (
                        <button onClick={() => setView('greeter')} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 hover:bg-slate-700"><MessageCircle size={20} /></button>
                    ) : null}

                    <button onClick={() => signOut(auth)} className="p-2 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-400 transition-colors" title="Sign Out">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile Property Dock - Sticky Row 2 */}
        {view === 'greeter' && (
            <div className="lg:hidden w-full pb-3">
                <PropertyDock properties={properties} selectedId={selectedPropId} onSelect={setSelectedPropId} />
            </div>
        )}
    </div>
);
