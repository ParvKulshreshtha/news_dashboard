// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './Slices/counterSlice';
import newsReducer from './Slices/newsSlice';
import authReducer, { setAuthFromLocalStorage } from './Slices/authSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    news: newsReducer
  },
});

if (typeof window !== 'undefined') {
  store.dispatch(setAuthFromLocalStorage());
}


// Type helpers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

