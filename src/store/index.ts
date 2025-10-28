import { configureStore } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistStore,
} from "redux-persist";
import { api } from "../api/api";
import * as authActions from "./auth/constants";
import { rootReducer } from "./reducer";

// Sentry Redux enhancer for error tracking
const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Return null to not log the action to Sentry
  actionTransformer: (action) => {
    // Don't log sensitive auth actions to Sentry
    if (action.type === authActions.LOGIN_USER) {
      return null;
    }
    if (action.type === authActions.SET_USER) {
      return null;
    }
    return action;
  },
  stateTransformer: (state) => {
    // Transform the state to remove sensitive information
    return {
      ...state,
      auth: {
        ...state.auth,
        token: state.auth.token ? "[REDACTED]" : null,
        user: state.auth.user && {
          ...state.auth.user,
          email: state.auth.user.email ? "[REDACTED]" : "",
        },
      },
    };
  },
});

// Configure store with advanced pattern from your reference
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: { warnAfter: 128 },
    })
      // Add RTK Query middleware (following your reference pattern)
      .concat(api.middleware),

  // DevTools configuration (following your reference pattern)
  devTools: import.meta.env.DEV
    ? {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stateSanitizer: (state: any) => ({
          ...state,
          // Hide RTK Query internal state in DevTools
          // mentorBuddyApi: "<RTK_QUERY_OBJECT>",
          // auth: state.auth && {
          //   ...state.auth,
          //   token: state.auth.token ? "[REDACTED]" : null,
          // },
        }),
      }
    : false,
  
  enhancers: (getDefaultEnhancers) => {
    return getDefaultEnhancers().concat(sentryReduxEnhancer);
  },
});

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Export types (following your reference pattern)
export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
export type AppDispatch = typeof store.dispatch;

// Create persistor for redux-persist
export const persistor = persistStore(store);

// Root selector (same pattern as your reference)
export const selectSelf = (state: RootState) => state;

// Export store as both default and named export
export { store };
export default store;