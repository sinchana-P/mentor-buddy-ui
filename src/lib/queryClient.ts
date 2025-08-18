/// <reference types="vite/client" />
// Legacy API request utility - kept for backward compatibility with mutations

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://mentor-buddy-backend.onrender.com' 
    : 'http://localhost:3000'
);

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : API_BASE_URL + url;
  
  // Prepare headers with auth token
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  
  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle 401 responses (invalid/expired tokens)
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/auth';
    throw new Error('Authentication failed');
  }

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}
