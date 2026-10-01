import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && !response.data.twoFactorRequired && !response.data.verificationRequired) {
      if (response.data.data.token) localStorage.setItem('token', response.data.data.token);
      setUser(response.data.data);
    }
    return response.data;
  };

  const verifyTwoFactor = async (twoFactorToken, otp) => {
    const response = await api.post('/auth/2fa/verify', { twoFactorToken, otp });
    if (response.data.success) {
      if (response.data.data.token) localStorage.setItem('token', response.data.data.token);
      setUser(response.data.data);
    }
    return response.data;
  };

  const resendOTP = async (twoFactorToken) => {
    const response = await api.post('/auth/2fa/resend', { twoFactorToken });
    return response.data;
  };

  const register = async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    // Registration no longer logs in directly, it requires email verification
    return response.data;
  };

  const verifyEmail = async (verificationToken, otp) => {
    const response = await api.post('/auth/verify-email', { verificationToken, otp });
    if (response.data.success) {
      if (response.data.data.token) localStorage.setItem('token', response.data.data.token);
      setUser(response.data.data);
    }
    return response.data;
  };

  const resendVerificationEmail = async (verificationToken) => {
    const response = await api.post('/auth/verify-email/resend', { verificationToken });
    return response.data;
  };

  const socialLogin = async (provider, email, name, socialId, avatar, role) => {
    const response = await api.post('/auth/social', { provider, email, name, socialId, avatar, role });
    if (response.data.success) {
      if (response.data.data.token) localStorage.setItem('token', response.data.data.token);
      setUser(response.data.data);
    }
    return response.data;
  };

  const completeOnboarding = async (data) => {
    const response = await api.post('/auth/onboard', data);
    if (response.data.success) {
      setUser(response.data.data);
    }
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, verifyTwoFactor, resendOTP, register, 
      verifyEmail, resendVerificationEmail, socialLogin, completeOnboarding, 
      logout, refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
