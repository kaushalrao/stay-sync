import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Guest } from '@lib/types';
import { DEFAULT_GUEST_DETAILS } from '@lib/constants';

// Extending default details with new Base Fields
const INITIAL_GUEST_DATA: Partial<Guest> = {
    ...DEFAULT_GUEST_DETAILS,
    discount: 0,
    advancePaid: 0,
};

export interface DraftGuestState {
    stage: 1 | 2 | 3;
    guestData: Partial<Guest>;
    isEditing: boolean;
    isViewOnly: boolean;
    setStage: (stage: 1 | 2 | 3) => void;
    updateGuestData: (data: Partial<Guest>) => void;
    loadGuestForEdit: (guest: Guest) => void;
    resetForm: () => void;
}

export const useGuestFormStore = create<DraftGuestState>()(
    devtools(
        persist(
            (set) => ({
                stage: 1,
                guestData: INITIAL_GUEST_DATA,
                isEditing: false,
                isViewOnly: false,
                setStage: (stage) => set({ stage }, false, 'setStage'),
                updateGuestData: (data) => set((state) => ({
                    guestData: { ...state.guestData, ...data }
                }), false, 'updateGuestData'),
                loadGuestForEdit: (guest) => {
                    const today = new Date().toISOString().split('T')[0];
                    const isPast = !!(guest.checkOutDate && guest.checkOutDate < today);

                    set({
                        guestData: guest,
                        stage: 1,
                        isEditing: true,
                        isViewOnly: isPast
                    }, false, 'loadGuestForEdit');
                },
                resetForm: () => set({
                    stage: 1,
                    guestData: INITIAL_GUEST_DATA,
                    isEditing: false,
                    isViewOnly: false
                }, false, 'resetForm'),
            }),
            {
                name: 'guest-form-draft',
            }
        ),
        { name: 'GuestFormStore' }
    )
);
