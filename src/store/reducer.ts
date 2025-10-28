import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Feature store slices
import auth from "./auth";
import mentors from "./mentors";
import buddies from "./buddies";
import tasks from "./tasks";
import resources from "./resources";

// RTK Query APIs
import { api } from "../api/api";

// Types for state management
import type { AuthState, AuthActions } from "./auth/types";
import type { MentorsState, MentorsActions } from "./mentors/types";
import type { BuddiesState, BuddiesActions } from "./buddies/types";
import type { TasksState, TasksActions } from "./tasks/types";
import type { ResourcesState, ResourcesActions } from "./resources/types";


// Auth persistence config - persist user data and auth state
const authPersistConfig = {
  key: "auth",
  storage: storage,
  whitelist: ["user", "token", "isAuthenticated", "preferences"],
};

// Mentors persistence config - persist filters and selected mentor
const mentorsPersistConfig = {
  key: "mentors",
  storage: storage,
  blacklist: ["loading", "error"], // Don't persist loading/error states
  whitelist: ["selectedMentor", "filters"],
};

// Buddies persistence config
const buddiesPersistConfig = {
  key: "buddies",
  storage: storage,
  blacklist: ["loading", "error"],
  whitelist: ["selectedBuddy", "filters", "progress"],
};

// Tasks persistence config
const tasksPersistConfig = {
  key: "tasks",
  storage: storage,
  blacklist: ["loading", "error"],
  whitelist: ["selectedTask", "filters"],
};

// Resources persistence config
const resourcesPersistConfig = {
  key: "resources",
  storage: storage,
  blacklist: ["loading", "error"],
  whitelist: ["selectedResource", "filters", "categories"],
};

// Create persisted reducers
const authPersisted = persistReducer<AuthState, AuthActions>(
  authPersistConfig,
  auth,
);

const mentorsPersisted = persistReducer<MentorsState, MentorsActions>(
  mentorsPersistConfig,
  mentors,
);

const buddiesPersisted = persistReducer<BuddiesState, BuddiesActions>(
  buddiesPersistConfig,
  buddies,
);

const tasksPersisted = persistReducer<TasksState, TasksActions>(
  tasksPersistConfig,
  tasks,
);

const resourcesPersisted = persistReducer<ResourcesState, ResourcesActions>(
  resourcesPersistConfig,
  resources,
);

// Root reducer combining all feature slices and RTK Query reducers
export const rootReducer = combineReducers({
  // Persisted feature slices
  auth: authPersisted,
  mentors: mentorsPersisted,
  buddies: buddiesPersisted,
  tasks: tasksPersisted,
  resources: resourcesPersisted,

  // RTK Query reducers (following your reference pattern)
  [api.reducerPath]: api.reducer,
});

export type RootReducer = ReturnType<typeof rootReducer>;