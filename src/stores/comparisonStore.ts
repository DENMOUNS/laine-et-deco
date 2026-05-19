import { create } from 'zustand';
import { toast as sonnerToast } from 'sonner';
import { Product } from '../types';

interface ComparisonState {
  comparisonList: Product[];

  // Actions
  addToComparison: (product: Product) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  setComparisonList: (list: Product[]) => void;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  comparisonList: [],

  addToComparison: (product) => {
    const { comparisonList } = get();
    if (comparisonList.find((p) => p.id === product.id)) {
      sonnerToast.info(
        `${product.name} est déjà dans la liste de comparaison`
      );
      return;
    }
    if (comparisonList.length >= 3) {
      sonnerToast.error(
        `Vous ne pouvez comparer que 3 produits à la fois`
      );
      return;
    }
    sonnerToast.success(`${product.name} ajouté au comparatif !`);
    set({ comparisonList: [...comparisonList, product] });
  },

  removeFromComparison: (id) => {
    set((state) => ({
      comparisonList: state.comparisonList.filter((p) => p.id !== id),
    }));
  },

  clearComparison: () => set({ comparisonList: [] }),

  setComparisonList: (list) => set({ comparisonList: list }),
}));
