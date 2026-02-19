import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MaintenanceState } from '@lib/types';

export const useMaintenanceStore = create<MaintenanceState>()(
    devtools(
        (set) => ({
            issues: [],
            isIssuesLoading: true,
            setIssues: (issues) => set({ issues }, false, 'setIssues'),
            setIsIssuesLoading: (isIssuesLoading) => set({ isIssuesLoading }, false, 'setIsIssuesLoading'),
        }),
        { name: 'MaintenanceStore' }
    )
);
