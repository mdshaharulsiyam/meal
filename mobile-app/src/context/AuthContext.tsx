import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<{ success: boolean; requiresOtp?: boolean; message?: string }>;
  register: (data: { name: string; phone: string; email?: string; password: string }) => Promise<{ success: boolean; requiresOtp?: boolean; message?: string }>;
  verifyOtp: (phoneOrEmail: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (phoneOrEmail: string) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (phoneOrEmail: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (phoneOrEmail: string, otp: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: { name?: string; defaultMealsPerDay?: number; preferredLanguage?: 'en' | 'bn' }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }
      setToken(storedToken);
      const res = await apiClient.get('/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log('Error fetching user profile:', err);
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadUser();
  }, []);

  const login = async (phoneOrEmail: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { phoneOrEmail, password });
      if (res.data && res.data.token) {
        const tokenStr = res.data.token;
        await AsyncStorage.setItem('auth_token', tokenStr);
        setToken(tokenStr);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: any) {
      const requiresOtp = err.response?.data?.requiresOtp || false;
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, requiresOtp, message: msg };
    }
  };

  const register = async (data: { name: string; phone: string; email?: string; password: string }) => {
    try {
      const res = await apiClient.post('/auth/register', data);
      if (res.data && res.data.success) {
        return { success: true, requiresOtp: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (phoneOrEmail: string, otp: string) => {
    try {
      const res = await apiClient.post('/auth/verify-otp', { phoneOrEmail, otp });
      if (res.data && res.data.token) {
        const tokenStr = res.data.token;
        await AsyncStorage.setItem('auth_token', tokenStr);
        setToken(tokenStr);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Verification failed' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Verification failed' };
    }
  };

  const resendOtp = async (phoneOrEmail: string) => {
    try {
      const res = await apiClient.post('/auth/resend-otp', { phoneOrEmail });
      return { success: true, message: res.data?.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to resend OTP' };
    }
  };

  const forgotPassword = async (phoneOrEmail: string) => {
    try {
      const res = await apiClient.post('/auth/forgot-password', { phoneOrEmail });
      return { success: true, message: res.data?.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to request reset OTP' };
    }
  };

  const resetPassword = async (phoneOrEmail: string, otp: string, newPassword: string) => {
    try {
      const res = await apiClient.post('/auth/reset-password', { phoneOrEmail, otp, newPassword });
      return { success: true, message: res.data?.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to reset password' };
    }
  };

  const updateProfile = async (data: { name?: string; defaultMealsPerDay?: number; preferredLanguage?: 'en' | 'bn' }) => {
    try {
      const res = await apiClient.patch('/auth/profile', data);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Update failed' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('active_room_id');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        updateProfile,
        logout,
        reloadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
