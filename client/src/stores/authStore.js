import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, requestNotificationPermission } from '../services/firebase';
import api from '../services/api';

// Función para registrar token FCM en el servidor
const registerFcmToken = async () => {
  try {
    console.log('[FCM] Solicitando permiso de notificaciones...');
    const fcmToken = await requestNotificationPermission();

    if (fcmToken) {
      console.log('[FCM] Token obtenido, registrando en servidor...');
      await api.post('/auth/register-push-token', { fcmToken });
      console.log('[FCM] Token registrado exitosamente');
      // Solo mostrar toast en desarrollo para no molestar al usuario
      if (import.meta.env.DEV) {
        console.log('[FCM] Token:', fcmToken.substring(0, 20) + '...');
      }
    } else {
      console.warn('[FCM] No se obtuvo token - puede que el usuario no haya dado permiso o el navegador no soporte notificaciones');
    }
  } catch (error) {
    console.error('[FCM] Error registrando token:', error?.response?.data || error?.message || error);
    // No mostramos toast de error para no confundir al usuario
  }
};

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

              // Registrar/actualizar token FCM
              registerFcmToken();
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

          // Registrar token FCM para push notifications
          registerFcmToken();

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
          // Eliminar token FCM del servidor antes de cerrar sesión
          try {
            await api.delete('/auth/push-token');
          } catch {
            // Ignorar errores de eliminación de token
          }
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
