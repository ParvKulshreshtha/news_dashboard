// store/slices/counterSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state, action) => { state.value += action.payload; },
    decrement: (state,action) => { state.value -= action.payload; },
  },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;