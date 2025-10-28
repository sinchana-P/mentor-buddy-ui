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
      // redux-persist will handle localStorage automatically
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case constants.LOGOUT_USER:
      // redux-persist will handle localStorage cleanup automatically
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case constants.SET_USER:
      // redux-persist will handle localStorage automatically
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case constants.SET_TOKEN:
      // redux-persist will handle localStorage automatically
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
      };

    case constants.UPDATE_USER:
      // redux-persist will handle localStorage automatically
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