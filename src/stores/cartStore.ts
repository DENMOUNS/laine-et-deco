import { create } from 'zustand';
import { toast as sonnerToast } from 'sonner';
import { Product, CartItem, Pack } from '../types';
import { readCache, writeCache, removeCache } from '../frontend/utils/cacheStorage';

const CART_CACHE_KEY = 'cart:v1';

interface CartState {
  cart: CartItem[];

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  addPackToCart: (pack: Pack, products: Product[], quantity?: number) => void;
  clearCart: () => void;
  setCart: (cart: CartItem[]) => void;
}

const calculatePackPrice = (pack: Pack, products: Product[]) => {
  const subtotal = pack.products.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  return subtotal * (1 - pack.discountPercentage / 100);
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: readCache<CartItem[]>(CART_CACHE_KEY) || [],

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (item) => item.type === 'product' && item.product?.id === product.id
      );
      let newCart: CartItem[];
      if (existingIndex >= 0) {
        newCart = [...state.cart];
        const currentItem = newCart[existingIndex];
        newCart[existingIndex] = {
          ...currentItem,
          quantity: currentItem.quantity + quantity,
        };
      } else {
        newCart = [
          ...state.cart,
          {
            id: product.id,
            type: 'product',
            product,
            quantity,
            price: product.price,
          },
        ];
      }
      persistCart(newCart);
      return { cart: newCart };
    });
    sonnerToast.success(`${product.name} ajouté au panier !`);
  },

  updateCartQuantity: (id, delta) => {
    set((state) => {
      const newCart = state.cart.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      persistCart(newCart);
      return { cart: newCart };
    });
  },

  removeFromCart: (id) => {
    set((state) => {
      const newCart = state.cart.filter((item) => item.id !== id);
      persistCart(newCart);
      return { cart: newCart };
    });
  },

  addPackToCart: (pack, products, quantity = 1) => {
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (item) => item.type === 'pack' && item.pack?.id === pack.id
      );
      const packPrice = calculatePackPrice(pack, products);
      let newCart: CartItem[];

      if (existingIndex >= 0) {
        newCart = [...state.cart];
        const currentItem = newCart[existingIndex];
        newCart[existingIndex] = {
          ...currentItem,
          quantity: currentItem.quantity + quantity,
        };
      } else {
        newCart = [
          ...state.cart,
          {
            id: pack.id,
            type: 'pack',
            pack,
            quantity,
            price: packPrice,
          },
        ];
      }
      persistCart(newCart);
      return { cart: newCart };
    });
    sonnerToast.success(`Pack ${pack.name} ajouté au panier !`);
  },

  clearCart: () => {
    removeCache(CART_CACHE_KEY);
    set({ cart: [] });
  },

  setCart: (cart) => {
    persistCart(cart);
    set({ cart });
  },
}));

function persistCart(cart: CartItem[]) {
  if (cart.length > 0) {
    writeCache(CART_CACHE_KEY, cart);
  } else {
    removeCache(CART_CACHE_KEY);
  }
}
