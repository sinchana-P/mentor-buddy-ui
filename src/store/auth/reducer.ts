import type { AuthActions, AuthState } from "./types";
import * as constants from "./constants";
import { initialState } from "./initialState";

const authReducer = (
  state = initialState,
  action: AuthActions,
): AuthState => {
  switch (action.type) {
    case constants.LOGIN_USER:
    case constants.REGISTER_USER:
      // Store auth data in localStorage
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case constants.LOGOUT_USER:
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case constants.SET_USER:
      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(action.payload));
      
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case constants.SET_TOKEN:
      // Update localStorage
      localStorage.setItem('auth_token', action.payload);
      
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
      };

    case constants.UPDATE_USER:
      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(action.payload));
      
      return {
        ...state,
        user: action.payload,
        error: null,
      };

    case constants.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case constants.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case constants.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;