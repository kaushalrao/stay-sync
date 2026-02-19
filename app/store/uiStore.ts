import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UIState, ToastStore } from '@lib/types';

interface UIStoreState extends UIState, ToastStore { }

export const useUIStore = create<UIStoreState>()(
    devtools(
        persist(
            (set, get) => ({
                // Global UI State
                selectedPropertyId: 'all',
                setSelectedPropertyId: (selectedPropertyId) => set({ selectedPropertyId }, false, 'setSelectedPropertyId'),
                theme: 'dark',
                toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }), false, 'toggleTheme'),
                setTheme: (theme) => set({ theme }, false, 'setTheme'),

                // Toast
                toast: { message: '', type: 'success', visible: false },
                showToast: (message, type = 'success') => {
                    set({ toast: { message, type, visible: true } }, false, 'showToast');
                    setTimeout(() => get().hideToast(), 3000);
                },
                hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } }), false, 'hideToast'),
            }),
            {
                name: 'ui-storage',
                partialize: (state) => ({
                    selectedPropertyId: state.selectedPropertyId,
                    theme: state.theme
                }),
            }
        ),
        { name: 'UIStore' }
    )
);
