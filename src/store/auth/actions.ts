import * as constants from "./constants";
import type { UserRO, LoginResponseRO } from "./types";

export const loginUser = (payload: LoginResponseRO) => ({
  type: constants.LOGIN_USER,
  payload,
});

export const registerUser = (payload: LoginResponseRO) => ({
  type: constants.REGISTER_USER,
  payload,
});

export const logoutUser = () => ({
  type: constants.LOGOUT_USER,
});

export const setUser = (user: UserRO) => ({
  type: constants.SET_USER,
  payload: user,
});

export const setToken = (token: string) => ({
  type: constants.SET_TOKEN,
  payload: token,
});

export const updateUser = (user: UserRO) => ({
  type: constants.UPDATE_USER,
  payload: user,
});

export const setLoading = (loading: boolean) => ({
  type: constants.SET_LOADING,
  payload: loading,
});

export const setError = (error: string | null) => ({
  type: constants.SET_ERROR,
  payload: error,
});

export const clearError = () => ({
  type: constants.CLEAR_ERROR,
});