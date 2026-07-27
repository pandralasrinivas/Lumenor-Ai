import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalPrice: 0,
  discountAmount: 0,
  discountCode: null,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalPrice = action.payload.totalPrice || 0;
      state.discountAmount = action.payload.discountAmount || 0;
      state.discountCode = action.payload.discountCode || null;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    updateItem: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload._id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.discountAmount = 0;
      state.discountCode = null;
    },
  },
});

export const {
  setCart,
  addItem,
  removeItem,
  updateItem,
  setLoading,
  setError,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
