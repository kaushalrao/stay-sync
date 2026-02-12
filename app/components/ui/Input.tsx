import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    labelClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, labelClassName = '', className = '', ...props }) => (
    <div className="space-y-1.5 group w-full">
        {label && (
            <label className={`text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 group-focus-within:text-orange-400 transition-colors ${labelClassName}`}>
                {icon} {label}
            </label>
        )}
        <input
            className={`w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium ${className}`}
            {...props}
        />
    </div>
);
