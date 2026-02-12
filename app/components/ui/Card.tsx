import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-200/80 dark:bg-slate-800/30 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] border border-slate-300 dark:border-white/5 shadow-xl ${className}`}>
        {children}
    </div>
);
