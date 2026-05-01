import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface User {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  profilePhoto?: string;
  role: 'user' | 'admin';
  isProfileComplete?: boolean;
  fcmToken?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  updateAccessToken: (token: string) => void;
  updateProfile: (userData: Partial<User>) => void;
  clearAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setAuth: async (user, accessToken, refreshToken) => {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      updateAccessToken: (token: string) => {
        set({ accessToken: token });
      },
      updateProfile: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
      clearAuth: async () => {
        await SecureStore.deleteItemAsync('refreshToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      logout: async () => {
        await SecureStore.deleteItemAsync('refreshToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Only persist user and auth status
    }
  )
);


