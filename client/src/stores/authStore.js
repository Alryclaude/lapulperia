import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../services/firebase';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      initialize: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const token = await firebaseUser.getIdToken();
              set({ token });

              // Get user from our backend
              const response = await api.get('/auth/me');
              set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch {
              set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          }
        });
      },

      loginWithGoogle: async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const token = await result.user.getIdToken();

          // Send to our backend
          const response = await api.post('/auth/login', {
            token,
            name: result.user.displayName,
            email: result.user.email,
            avatar: result.user.photoURL,
          });

          set({
            user: response.data.user,
            token,
            isAuthenticated: true,
          });

          return { user: response.data.user, isNewUser: response.data.isNewUser };
        } catch (error) {
          throw error;
        }
      },

      registerAsPulperia: async (pulperiaData) => {
        try {
          const { token } = get();
          const response = await api.post('/auth/create-pulperia', pulperiaData);
          set({ user: response.data.user });
          return response.data;
        } catch (error) {
          throw error;
        }
      },

      updateUser: async (data) => {
        try {
          const response = await api.patch('/auth/me', data);
          set({ user: response.data.user });
          return response.data.user;
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          // Clear all auth state
          set({ user: null, token: null, isAuthenticated: false });
          // Clear localStorage to prevent stale data
          localStorage.removeItem('auth-storage');
        } catch {
          // Ignorar errores de logout
        }
      },

      deleteAccount: async (downloadData = false) => {
        try {
          const response = await api.delete(`/auth/me?downloadData=${downloadData}`);
          await signOut(auth);
          set({ user: null, token: null, isAuthenticated: false });
          return response.data;
        } catch (error) {
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user });
        } catch {
          // Ignorar errores de refresh
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
