import { Loader2 } from 'lucide-react';
import React from 'react';

interface LoaderProps {
    className?: string;
    iconClassName?: string;
    size?: number;
}

export const Loader: React.FC<LoaderProps> = ({
    className = "flex items-center justify-center w-full h-full min-h-[200px]",
    iconClassName = "text-indigo-500",
    size = 40
}) => {
    return (
        <div className={className}>
            <Loader2 size={size} className={`animate-spin ${iconClassName}`} />
        </div>
    );
};
