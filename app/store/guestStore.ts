import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GuestState } from '@lib/types';
import { guestService } from '@services/guests/guest.service';

export const useGuestStore = create<GuestState>()(
    devtools(
        (set) => ({
            guests: [],
            upcomingGuests: [],
            guestLastDoc: null,
            isGuestsLoading: true,
            isUpcomingGuestsLoading: true,
            setGuests: (guests, lastDoc = null) => set({ guests, guestLastDoc: lastDoc }, false, 'setGuests'),
            appendGuests: (newGuests, lastDoc) => set((state) => ({
                guests: [...state.guests, ...newGuests],
                guestLastDoc: lastDoc
            }), false, 'appendGuests'),
            updateGuestInStore: (id, updates) => set((state) => ({
                guests: state.guests.map(g => g.id === id ? { ...g, ...updates } : g),
                upcomingGuests: state.upcomingGuests.map(g => g.id === id ? { ...g, ...updates } : g)
            }), false, 'updateGuestInStore'),
            setIsGuestsLoading: (isGuestsLoading) => set({ isGuestsLoading }, false, 'setIsGuestsLoading'),
            fetchUpcomingGuests: async (userId: string) => {
                set({ isUpcomingGuestsLoading: true }, false, 'setIsUpcomingLoading');
                try {
                    const upcomingGuests = await guestService.getUpcomingGuests();
                    set({ upcomingGuests, isUpcomingGuestsLoading: false }, false, 'setUpcomingGuests');
                } catch (error) {
                    console.error("Failed to fetch upcoming guests", error);
                    set({ isUpcomingGuestsLoading: false }, false, 'setUpcomingGuestsError');
                }
            }
        }),
        { name: 'GuestStore' }
    )
);
