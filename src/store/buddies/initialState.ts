import type { BuddiesState } from "./types";

export const initialState: BuddiesState = {
  buddies: [],
  selectedBuddy: null,
  buddyTasks: null,
  buddyProgress: [],
  loading: false,
  error: null,
  total: 0,
  filters: {},
};