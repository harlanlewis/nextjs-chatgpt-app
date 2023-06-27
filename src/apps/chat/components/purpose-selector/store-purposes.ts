import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface PurposeStore {

  // state
  favoritePurposeIDs: string[];

  // actions
  toggleFavoritePurposeId: (purposeId: string) => void;

}


export const usePurposeStore = create<PurposeStore>()(
  persist(
    (set) => ({

      // default favorites
      favoritePurposeIDs: ['Design', 'Develop', 'Hypotheses', 'Prototype', 'Savant', 'UXR'],

      toggleFavoritePurposeId: (purposeId: string) => {
        set(state => {
          const favoritePurposeIDs = state.favoritePurposeIDs.includes(purposeId)
            ? state.favoritePurposeIDs.filter((id) => id !== purposeId)
            : [...state.favoritePurposeIDs, purposeId];
          return {
            favoritePurposeIDs,
          };
        });
      },

    }),
    {
      name: 'app-purpose',
    }),
);