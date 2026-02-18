import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import {
    InventoryState,
    CleaningState,
    UIState,
    PropertyState,
    TemplateState,
    MaintenanceState,
    GuestState,
    ToastStore
} from '@lib/types';

interface AppState extends InventoryState, CleaningState, UIState, PropertyState, TemplateState, MaintenanceState, GuestState, ToastStore { }

export const useStore = create<AppState>()(
    devtools(
        persist(
            (set, get) => ({
                // Inventory
                needs: [],
                logs: [],
                masterItems: [],
                isInventoryLoading: true,
                setNeeds: (needs) => set({ needs }),
                setLogs: (logs) => set({ logs }),
                setMasterItems: (masterItems) => set({ masterItems }),
                setIsInventoryLoading: (isInventoryLoading) => set({ isInventoryLoading }),

                // Cleaning
                tasks: [],
                isCleaningLoading: true,
                setTasks: (tasks) => set({ tasks }),
                setIsCleaningLoading: (isCleaningLoading) => set({ isCleaningLoading }),

                // UI / Global
                selectedPropertyId: 'all', // Default to 'all'
                setSelectedPropertyId: (selectedPropertyId) => set({ selectedPropertyId }),
                theme: 'dark', // Default to dark theme
                toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
                setTheme: (theme) => set({ theme }),

                // Properties
                properties: [],
                isPropertiesLoading: true,
                setProperties: (properties) => set({ properties }),
                setIsPropertiesLoading: (isPropertiesLoading) => set({ isPropertiesLoading }),

                // Templates
                templates: [],
                isTemplatesLoading: true,
                setTemplates: (templates) => set({ templates }),
                setIsTemplatesLoading: (isTemplatesLoading) => set({ isTemplatesLoading }),

                // Maintenance
                issues: [],
                isIssuesLoading: true,
                setIssues: (issues) => set({ issues }),
                setIsIssuesLoading: (isIssuesLoading) => set({ isIssuesLoading }),

                // Guests
                guests: [],
                isGuestsLoading: true,
                setGuests: (guests) => set({ guests }),
                setIsGuestsLoading: (isGuestsLoading) => set({ isGuestsLoading }),

                // Toast
                toast: { message: '', type: 'success', visible: false },
                showToast: (message, type = 'success') => {
                    set({ toast: { message, type, visible: true } });
                    setTimeout(() => get().hideToast(), 3000);
                },
                hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } })),
            }),
            {
                name: 'staysync-storage',
                // Only persist UI state
                partialize: (state) => ({
                    selectedPropertyId: state.selectedPropertyId,
                    theme: state.theme
                }),
            }
        )
    )
);
