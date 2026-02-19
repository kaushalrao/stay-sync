import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TemplateState } from '@lib/types';

export const useTemplateStore = create<TemplateState>()(
    devtools(
        (set) => ({
            templates: [],
            isTemplatesLoading: true,
            setTemplates: (templates) => set({ templates }, false, 'setTemplates'),
            setIsTemplatesLoading: (isTemplatesLoading) => set({ isTemplatesLoading }, false, 'setIsTemplatesLoading'),
        }),
        { name: 'TemplateStore' }
    )
);
