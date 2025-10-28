import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Base query with authentication headers
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      // Handle both string tokens and JSON token objects
      let token = authToken;
      if (authToken.startsWith('{')) {
        try {
          const tokenObj = JSON.parse(authToken);
          token = tokenObj.access_token || tokenObj.token;
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Main API slice - following your reference pattern
export const mentorBuddyApi = createApi({
  reducerPath: 'mentorBuddyApi',
  baseQuery,
  tagTypes: ['Buddy', 'Mentor', 'Task', 'Resource', 'Auth', 'Portfolios'],
  endpoints: () => ({}),
});

export default mentorBuddyApi;