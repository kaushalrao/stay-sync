import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { InventoryState, CleaningState, UIState } from '@lib/types';

interface AppState extends InventoryState, CleaningState, UIState { }

export const useStore = create<AppState>()(
    devtools(
        persist(
            (set) => ({
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
                selectedPropertyId: '',
                setSelectedPropertyId: (selectedPropertyId) => set({ selectedPropertyId }),
            }),
            {
                name: 'staysync-storage',
                // Only persist UI state, not volatile Firestore data
                partialize: (state) => ({ selectedPropertyId: state.selectedPropertyId }),
            }
        )
    )
);
