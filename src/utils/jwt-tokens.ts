// JWT Token Management Utilities
// Following the pattern from your reference project

export interface JWTToken {
  access_token: string;
  refresh_token?: string;
}

export interface IdToken {
  id_token: string;
}

// Get JWT token from localStorage
export const getJWTToken = (): JWTToken | null => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    // Handle both string tokens and JSON token objects
    if (token.startsWith('{')) {
      return JSON.parse(token);
    } else {
      return { access_token: token };
    }
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

// Set JWT token in localStorage
export const setJWTToken = (token: JWTToken): void => {
  try {
    if (typeof token === 'string') {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.setItem('auth_token', JSON.stringify(token));
    }
  } catch (error) {
    console.error('Error storing JWT token:', error);
  }
};

// Remove JWT token from localStorage
export const removeJWTToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

// Get ID token (for specific auth endpoints)
export const getIdToken = (): IdToken | null => {
  try {
    const user = localStorage.getItem('auth_user');
    if (!user) return null;
    
    const userData = JSON.parse(user);
    return userData.id_token ? { id_token: userData.id_token } : null;
  } catch (error) {
    console.error('Error parsing ID token:', error);
    return null;
  }
};

// Check if token exists
export const hasValidToken = (): boolean => {
  const token = getJWTToken();
  return token?.access_token ? true : false;
};

// Get authorization header
export const getAuthHeader = (): string | null => {
  const token = getJWTToken();
  return token?.access_token ? `Bearer ${token.access_token}` : null;
};