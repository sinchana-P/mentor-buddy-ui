import React, { createContext, useContext, useEffect, useState } from 'react';
import type { DomainRole } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'mentor' | 'buddy';
  domainRole: DomainRole;
  avatarUrl?: string | null;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: 'manager' | 'mentor' | 'buddy', domainRole: DomainRole) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUserRole: (role: 'manager' | 'mentor' | 'buddy', domainRole?: DomainRole) => Promise<{ error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on component mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        console.log('Restored user session:', userData);
        // Verify token is still valid
        verifyToken(storedToken, userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const verifyToken = async (authToken: string, userData: AuthUser) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const { user: currentUser } = await response.json();
        setUser(currentUser);
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
      } else {
        // Token is invalid, clear auth data
        console.log('Token verification failed, clearing auth data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // On error, keep existing auth state but don't clear it
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'manager' | 'mentor' | 'buddy', domainRole: DomainRole) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          domainRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Registration failed' };
      }

      // Store auth data
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Login failed' };
      }

      // Store auth data
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      if (token) {
        // Call backend logout to blacklist token
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local auth data regardless of API call success
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  const updateUserRole = async (role: 'manager' | 'mentor' | 'buddy', domainRole?: DomainRole) => {
    if (!user || !token) return { error: 'No user logged in' };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          role,
          domainRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Failed to update role' };
      }

      // Update local user data
      setUser(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return {};
    } catch (error) {
      console.error('Update role error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signUp,
        signIn,
        signOut,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


