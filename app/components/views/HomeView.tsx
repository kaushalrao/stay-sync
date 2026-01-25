import * as React from 'react';
import { Sparkles, MessageCircle, Settings } from 'lucide-react';
import { ViewState } from '../../lib/types';

export const HomeView: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 md:gap-12 animate-fade-in max-w-6xl mx-auto w-full px-4">
        <div className="text-center space-y-4 md:space-y-6 max-w-3xl">
            <div className="inline-flex items-center justify-center p-3 md:p-4 bg-white/5 rounded-3xl mb-2 backdrop-blur-md border border-white/10 ring-1 ring-white/5 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
                <Sparkles size={28} className="text-orange-400 md:w-8 md:h-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 tracking-tight drop-shadow-sm">
                Guest Greeter
            </h1>
            <p className="text-slate-400 text-base md:text-xl font-light leading-relaxed max-w-2xl mx-auto px-4">
                Streamline your hospitality. Create personalized welcome messages and manage guest details with elegance.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl">
            <button onClick={() => onNavigate('greeter')} className="group relative h-60 md:h-72 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 shadow-2xl hover:shadow-orange-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600 opacity-90 transition-all duration-500 group-hover:opacity-100" />
                <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 md:p-8">
                    <div className="bg-white/20 p-5 md:p-6 rounded-[2rem] backdrop-blur-md shadow-lg border border-white/20 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
                        <MessageCircle size={40} className="text-white fill-white/20 md:w-12 md:h-12" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 tracking-tight">Start Greeting</h2>
                    <p className="text-white/80 font-medium text-sm md:text-base">Generate Welcome Messages</p>
                </div>
            </button>

            <button onClick={() => onNavigate('settings')} className="group relative h-60 md:h-72 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 shadow-xl hover:shadow-slate-900/50">
                <div className="absolute inset-0 bg-[#1e293b] border border-white/5 transition-all duration-500 group-hover:border-white/10 group-hover:bg-[#253045]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200 p-6 md:p-8">
                    <div className="bg-slate-800 p-5 md:p-6 rounded-[2rem] shadow-lg border border-white/5 mb-4 md:mb-6 group-hover:bg-slate-700 group-hover:scale-110 transition-all duration-500">
                        <Settings size={40} className="text-slate-400 group-hover:text-white transition-colors md:w-12 md:h-12" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2 tracking-tight">Configure</h2>
                    <p className="text-slate-400 group-hover:text-slate-300 font-medium text-sm md:text-base transition-colors">Manage Properties & Templates</p>
                </div>
            </button>
        </div>
    </div>
);
