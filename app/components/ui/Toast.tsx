import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '@store/useStore';

export const Toast: React.FC = () => {
    const toast = useStore(state => state.toast);
    const hideToast = useStore(state => state.hideToast);

    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 transform border ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-200' : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-200'}`}
        >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span className="font-bold text-sm">{toast.message}</span>
            <button onClick={hideToast} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
                <XCircle size={14} />
            </button>
        </div>
    );
};
