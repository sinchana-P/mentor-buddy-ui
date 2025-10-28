import type { AuthState } from "./types";

// Get initial state from localStorage if available
const getInitialAuthState = (): AuthState => {
  try {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Error parsing auth data from localStorage:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

export const initialState: AuthState = getInitialAuthState();