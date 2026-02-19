import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { InventoryState } from '@lib/types';

export const useInventoryStore = create<InventoryState>()(
    devtools(
        (set) => ({
            needs: [],
            logs: [],
            masterItems: [],
            isInventoryLoading: true,
            setNeeds: (needs) => set({ needs }, false, 'setNeeds'),
            setLogs: (logs) => set({ logs }, false, 'setLogs'),
            setMasterItems: (masterItems) => set({ masterItems }, false, 'setMasterItems'),
            setIsInventoryLoading: (isInventoryLoading) => set({ isInventoryLoading }, false, 'setIsInventoryLoading'),
        }),
        { name: 'InventoryStore' }
    )
);
