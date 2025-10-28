import type { AuthState } from "./types";

// Initial state - redux-persist will handle loading from localStorage
export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};