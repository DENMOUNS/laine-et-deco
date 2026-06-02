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
  cart: [],

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (item) => item.type === 'product' && item.product?.id === product.id
      );
      
      const currentQty = existingIndex >= 0 ? state.cart[existingIndex].quantity : 0;
      const spaceLeft = Math.max(0, product.stock - currentQty);
      
      if (spaceLeft <= 0) {
        sonnerToast.error(`Désolé, la limite de stock (${product.stock}) est atteinte pour ${product.name}.`);
        return state;
      }

      const qtyToAdd = Math.min(quantity, spaceLeft);

      let newCart: CartItem[];
      if (existingIndex >= 0) {
        newCart = [...state.cart];
        const currentItem = newCart[existingIndex];
        newCart[existingIndex] = {
          ...currentItem,
          quantity: currentItem.quantity + qtyToAdd,
        };
      } else {
        newCart = [
          ...state.cart,
          {
            id: product.id,
            type: 'product',
            product,
            quantity: qtyToAdd,
            price: product.price,
          },
        ];
      }
      persistCart(newCart);
      if (qtyToAdd < quantity) {
        sonnerToast.warning(`Seulement ${qtyToAdd} exemplaire(s) de ${product.name} ajouté(s) (limite de stock).`);
      } else {
        sonnerToast.success(`${product.name} ajouté au panier !`);
      }
      return { cart: newCart };
    });
  },

  updateCartQuantity: (id, delta) => {
    set((state) => {
      const newCart = state.cart.map((item) => {
        if (item.id === id) {
          let newQty = Math.max(1, item.quantity + delta);
          if (item.type === 'product' && item.product) {
            newQty = Math.min(newQty, item.product.stock);
            if (newQty < item.quantity + delta) {
               sonnerToast.error(`Limite de stock atteinte pour ${item.product.name}.`);
            }
          }
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

// Hydrate cart from IndexedDB after store creation (readCache is async)
readCache<CartItem[]>(CART_CACHE_KEY).then((cached) => {
  if (cached && Array.isArray(cached) && cached.length > 0) {
    useCartStore.setState({ cart: cached });
  }
});

function persistCart(cart: CartItem[]) {
  if (cart.length > 0) {
    writeCache(CART_CACHE_KEY, cart);
  } else {
    removeCache(CART_CACHE_KEY);
  }
}
