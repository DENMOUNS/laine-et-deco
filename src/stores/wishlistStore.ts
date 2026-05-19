import { create } from 'zustand';
import { toast as sonnerToast } from 'sonner';
import { Product } from '../types';

interface WishlistState {
  wishlist: Product[];

  // Actions
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  setWishlist: (wishlist: Product[]) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],

  addToWishlist: (product) => {
    const { wishlist } = get();
    if (wishlist.find((p) => p.id === product.id)) {
      sonnerToast.info(`${product.name} est déjà dans vos favoris`);
      return;
    }
    sonnerToast.success(`${product.name} ajouté aux favoris !`);
    set({ wishlist: [...wishlist, product] });
  },

  removeFromWishlist: (id) => {
    set((state) => ({
      wishlist: state.wishlist.filter((p) => p.id !== id),
    }));
  },

  clearWishlist: () => set({ wishlist: [] }),

  setWishlist: (wishlist) => set({ wishlist }),
}));
