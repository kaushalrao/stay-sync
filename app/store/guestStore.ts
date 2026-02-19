import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GuestState } from '@lib/types';

export const useGuestStore = create<GuestState>()(
    devtools(
        (set) => ({
            guests: [],
            guestLastDoc: null,
            isGuestsLoading: true,
            setGuests: (guests, lastDoc = null) => set({ guests, guestLastDoc: lastDoc }, false, 'setGuests'),
            appendGuests: (newGuests, lastDoc) => set((state) => ({
                guests: [...state.guests, ...newGuests],
                guestLastDoc: lastDoc
            }), false, 'appendGuests'),
            setIsGuestsLoading: (isGuestsLoading) => set({ isGuestsLoading }, false, 'setIsGuestsLoading'),
        }),
        { name: 'GuestStore' }
    )
);
