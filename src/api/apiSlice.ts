// Legacy compatibility layer - re-export from new API structure
// This file maintains backwards compatibility for any remaining references

export { api as apiSlice } from './api';

// Re-export all the hooks from the new API structure
export * from './authApi';
export * from './usersApi';
export * from './mentorsApi';
export * from './buddiesApi';
export * from './resourcesApi';
export * from './dashboardApi';