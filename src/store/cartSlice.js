import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const serialized = localStorage.getItem('foodiego_cart');
    if (!serialized) return { items: [], promoCode: null, discount: 0 };
    const cart = JSON.parse(serialized);
    
    // Migration: If any item has a numeric ID (old mock data), clear the cart
    // to prevent "Cast to ObjectId failed" errors in the backend.
    const hasOldIds = cart.items.some(item => typeof item.id === 'number' || item.id.length < 10);
    if (hasOldIds) {
      localStorage.removeItem('foodiego_cart');
      return { items: [], promoCode: null, discount: 0 };
    }
    
    return cart;
  } catch {
    return { items: [], promoCode: null, discount: 0 };
  }
};

// Save cart to localStorage
const saveCartToStorage = (state) => {
  try {
    localStorage.setItem('foodiego_cart', JSON.stringify(state));
  } catch {
    // ignore
  }
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      saveCartToStorage(state);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCartToStorage(state);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          item.quantity = quantity;
        }
      }
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.promoCode = null;
      state.discount = 0;
      saveCartToStorage(state);
    },
    applyPromo: (state, action) => {
      const code = action.payload.toUpperCase();
      const promoCodes = {
        FOODIEGO20: 0.2,
        SALE10: 0.1,
        NEWUSER: 0.15,
      };
      if (promoCodes[code]) {
        state.promoCode = code;
        state.discount = promoCodes[code];
      }
      saveCartToStorage(state);
    },
    removePromo: (state) => {
      state.promoCode = null;
      state.discount = 0;
      saveCartToStorage(state);
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, applyPromo, removePromo } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCartDiscount = (state) => state.cart.discount;
export const selectPromoCode = (state) => state.cart.promoCode;

export default cartSlice.reducer;
