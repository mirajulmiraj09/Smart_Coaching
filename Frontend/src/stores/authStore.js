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

      // Initialize auth from localStorage
      initAuth: async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Verify token by fetching user data
            const response = await api.get('/me/');
            const userData = response.data.data;
            
            // Ensure user object has the correct structure
            const user = {
              user_id: userData.user_id || userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              profile: userData.profile,
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
          console.error('Auth initialization error:', error.response?.data || error.message);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ isInitialized: true });
        }
      },

      // Register user
      register: async (userData) => {
        try {
          const response = await api.post('/register/', userData);
          // Registration returns user data but requires email verification
          // No login needed yet - user must verify email first
          return response.data;
        } catch (error) {
          console.error('Registration error:', error.response?.data);
          throw error;
        }
      },

      // Login user
      login: async (email, password) => {
        try {
          const response = await api.post('/login/', { email, password });
          const responseData = response.data.data;
          
          // Extract tokens from nested structure
          const access = responseData.tokens?.access;
          const refresh = responseData.tokens?.refresh;
          
          if (!access || !refresh) {
            throw new Error('No tokens received from server');
          }

          // Create user object from response
          const user = {
            user_id: responseData.user_id,
            name: responseData.name,
            email: responseData.email,
            role: responseData.role,
            profile: responseData.profile,
          };

          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

          set({
            user,
            token: access,
            isAuthenticated: true,
          });

          return response.data;
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          throw error;
        }
      },

      // Logout user
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // Update user profile
      updateProfile: async (data) => {
        try {
          const response = await api.patch('/profile/', data);
          const userData = response.data.data;
          const user = {
            user_id: userData.user_id || userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            profile: userData.profile,
          };
          set({ user });
          return response.data;
        } catch (error) {
          console.error('Profile update error:', error.response?.data || error.message);
          throw error;
        }
      },

      // Change password
      changePassword: async (oldPassword, newPassword) => {
        try {
          const response = await api.post('/change-password/', {
            old_password: oldPassword,
            new_password: newPassword,
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
    }
  )
);
