"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    variant?: 'default' | 'filter';
}

export function Dropdown({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    label,
    icon,
    disabled = false,
    className = "",
    variant = 'default'
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: DropdownOption) => {
        if (disabled) return;
        onChange(option.id);
        setIsOpen(false);
    };

    return (
        <div 
            className={`relative flex flex-col gap-1.5 ${isOpen ? 'z-[60]' : 'z-auto'} ${className}`} 
            ref={containerRef}
        >
            {label && (
                <label className="text-[10px] font-black text-slate-500 underline-offset-4 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2 transition-colors group-focus-within:text-indigo-500">
                    {icon} {label}
                </label>
            )}
            
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-between w-full
                    ${variant === 'filter' ? 'px-3 py-2 text-xs' : 'px-4 py-3 md:py-4 text-sm md:text-lg'}
                    bg-slate-50 dark:bg-slate-800/50 
                    border border-slate-200 dark:border-white/10 rounded-xl
                    focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    font-bold text-left
                    transition-all outline-none shadow-sm
                    ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300 dark:hover:border-white/20'}
                    ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500' : ''}
                    ${selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400'}
                `}
            >
                <div className={`flex items-center ${variant === 'filter' ? 'gap-2' : 'gap-3'} truncate`}>
                    {selectedOption?.icon && (
                        <span className={`shrink-0 ${variant === 'filter' ? 'text-indigo-400' : 'text-indigo-500'}`}>
                            {React.cloneElement(selectedOption.icon as React.ReactElement, { size: variant === 'filter' ? 14 : 18 })}
                        </span>
                    )}
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown 
                    size={variant === 'filter' ? 14 : 20} 
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} 
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto py-1.5 custom-scrollbar">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
                                No options available
                            </div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        flex items-center justify-between w-full
                                        ${variant === 'filter' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm md:text-base'}
                                        text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5
                                        ${value === option.id ? 'bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}
                                    `}
                                >
                                    <div className={`flex items-center ${variant === 'filter' ? 'gap-2' : 'gap-3'} truncate`}>
                                        {option.icon && (
                                            <span className={`shrink-0 ${value === option.id ? 'text-indigo-500' : 'text-slate-400'}`}>
                                                {React.cloneElement(option.icon as React.ReactElement, { size: variant === 'filter' ? 14 : 18 })}
                                            </span>
                                        )}
                                        <span className="font-semibold truncate">
                                            {option.label}
                                        </span>
                                    </div>
                                    {value === option.id && (
                                        <Check size={variant === 'filter' ? 14 : 18} className="shrink-0 text-indigo-500" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
