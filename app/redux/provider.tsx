'use client';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { setAuthFromLocalStorage } from './Slices/authSlice';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(setAuthFromLocalStorage());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
