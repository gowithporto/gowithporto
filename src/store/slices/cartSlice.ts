import { createSlice } from "@reduxjs/toolkit";

type CartItem = {
  productId: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  category?: string;
  storeName?: string;
};

type CartState = {
  items: CartItem[];
};

const loadCart = () => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("cart");
  return data ? JSON.parse(data) : [];
};

const saveCart = (items: any[]) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const initialState: CartState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      saveCart(state.items);
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      saveCart(state.items);
    },

    updateQuantity(state, action) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId
      );

      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        saveCart(state.items);
      }
    },

    clearCart(state) {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
