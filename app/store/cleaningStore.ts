import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CleaningState } from '@lib/types';

export const useCleaningStore = create<CleaningState>()(
    devtools(
        (set) => ({
            tasks: [],
            isCleaningLoading: true,
            setTasks: (tasks) => set({ tasks }, false, 'setTasks'),
            setIsCleaningLoading: (isCleaningLoading) => set({ isCleaningLoading }, false, 'setIsCleaningLoading'),
        }),
        { name: 'CleaningStore' }
    )
);
