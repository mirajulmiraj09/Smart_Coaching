import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,

      // ── Initialize auth from localStorage ──────────────────────────────
      initAuth: async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Verify token is still valid by fetching /me/
            const response = await api.get('/me/');
            const userData = response.data.data;

            const user = {
              user_id:       userData.user_id || userData.id,
              name:          userData.name,
              email:         userData.email,
              role:          userData.role,
              role_name:     userData.role,
              is_superuser:  userData.is_superuser || false,
              profile:       userData.profile,
              profile_image: userData.profile_image,
              phone:         userData.phone,
            };

            set({
              user,
              token,
              isAuthenticated: true,
              isInitialized: true,
            });
          } else {
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('Auth init error:', error.response?.data || error.message);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete api.defaults.headers.common['Authorization'];
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isInitialized: true,
          });
        }
      },

      // ── Register ───────────────────────────────────────────────────────
      register: async (userData) => {
        try {
          const response = await api.post('/register/', userData);
          return response.data;
        } catch (error) {
          console.error('Register error:', error.response?.data);
          throw error;
        }
      },

      // ── Login ──────────────────────────────────────────────────────────
      login: async (email, password) => {
        try {
          const response = await api.post('/login/', { email, password });
          const responseData = response.data.data;

          const access  = responseData.tokens?.access;
          const refresh = responseData.tokens?.refresh;

          if (!access || !refresh) {
            throw new Error('No tokens received from server');
          }

          const user = {
            user_id:       responseData.user_id,
            name:          responseData.name,
            email:         responseData.email,
            role:          responseData.role,
            role_name:     responseData.role,
            is_superuser:  responseData.is_superuser || false,
            profile:       responseData.profile,
            profile_image: responseData.profile_image,
            phone:         responseData.phone,
          };

          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

          set({ user, token: access, isAuthenticated: true });

          return response.data;
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          throw error;
        }
      },

      // ── Logout ─────────────────────────────────────────────────────────
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth-storage');
        delete api.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // ── Update profile ─────────────────────────────────────────────────
      updateProfile: async (data) => {
        try {
          const response = await api.patch('/me/', data);
          const userData = response.data.data;

          const user = {
            user_id:       userData.user_id || userData.id,
            name:          userData.name,
            email:         userData.email,
            role:          userData.role,
            role_name:     userData.role,
            is_superuser:  userData.is_superuser || false,
            profile:       userData.profile,
            profile_image: userData.profile_image,
            phone:         userData.phone,
          };

          set({ user });
          return response.data;
        } catch (error) {
          console.error('Profile update error:', error.response?.data || error.message);
          throw error;
        }
      },

      // ── Change password ────────────────────────────────────────────────
      changePassword: async (currentPassword, newPassword, confirmNewPassword) => {
        try {
          const response = await api.post('/change-password/', {
            current_password:     currentPassword,
            new_password:         newPassword,
            confirm_new_password: confirmNewPassword,
          });
          return response.data;
        } catch (error) {
          console.error('Password change error:', error.response?.data || error.message);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);