import { create } from 'zustand';

interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string) => void;
  // 1. ADD THIS TO THE INTERFACE
  register: (token: string, email: string) => void; 
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  email: localStorage.getItem('email'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: (token: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email); 
    set({ token, email, isAuthenticated: true });
  },

  // 2. IMPLEMENT THE REGISTER FUNCTION
  // Usually, after registering, we log the user in immediately
  register: (token: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    set({ token, email, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');  
    set({ token: null, email: null, isAuthenticated: false });
  },
}));