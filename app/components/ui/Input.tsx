import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    labelClassName?: string;
    inputSize?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
    label,
    icon,
    labelClassName = '',
    className = '',
    inputSize = 'md',
    ...props
}) => {
    const paddingClass = inputSize === 'sm' ? 'px-3 py-2 text-sm' :
        inputSize === 'lg' ? 'px-3 py-2.5 text-sm md:px-5 md:py-4 md:text-lg' :
            'px-4 py-3.5';

    return (
        <div className="space-y-1 group w-full">
            {label && (
                <label className={`text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 group-focus-within:text-indigo-400 transition-colors ${labelClassName}`}>
                    {icon} {label}
                </label>
            )}
            <input
                className={`w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl ${paddingClass} text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium shadow-sm ${className}`}
                {...props}
            />
        </div>
    );
};
