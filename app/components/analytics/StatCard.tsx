import React from 'react';
import { StatCardProps } from '@/app/lib/types';

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, bg, border }) => {
    return (
        <div className={`relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-xl group hover:scale-[1.02] transition-all duration-300`}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex flex-row justify-between items-center mb-2 md:mb-0">
                    <div className={`p-3 rounded-2xl ${bg} ${border} border`}>
                        <Icon size={20} className={color} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-1">{value}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                </div>
            </div>
        </div>
    );
};
