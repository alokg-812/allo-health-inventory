import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useReservationStore = create(
  persist(
    (set) => ({
      reservation: null,
      setReservation: (reservation) => set({ reservation }),
      clear: () => set({ reservation: null }),
    }),
    {
      name: 'allo-active-reservation',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
