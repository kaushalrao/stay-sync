import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PropertyState } from '@lib/types';

export const usePropertyStore = create<PropertyState>()(
    devtools(
        (set) => ({
            properties: [],
            isPropertiesLoading: true,
            setProperties: (properties) => set({ properties }, false, 'setProperties'),
            setIsPropertiesLoading: (isPropertiesLoading) => set({ isPropertiesLoading }, false, 'setIsPropertiesLoading'),
        }),
        { name: 'PropertyStore' }
    )
);
