import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  email: string | null;
  role: 'admin' | 'user' | null;
  token: string | null;
}

const initialState: AuthState = {
  email: null,
  role: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; token: string }>) => {
      state.email = action.payload.email;
      state.token = action.payload.token;
      if (state.email === 'admin@admin.com') {
        state.role = 'admin';
      } else {
        state.role = 'user';
      }
      console.log(state)
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.email = null;
      state.role = null;
      state.token = null;
      
      localStorage.removeItem('token');
    },
    setAuthFromLocalStorage: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        state.token = token;
        if (token === 'adminToken') {
          state.email = 'admin@admin.com';
          state.role = 'admin';
        } else {
          state.email = 'user@example.com';
          state.role = 'user';
        }
      }
    },
  },
});

export const { login, logout, setAuthFromLocalStorage } = authSlice.actions;
export default authSlice.reducer;