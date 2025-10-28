import * as constants from "./constants";
import type { BuddyRO, BuddyTasksRO, BuddyProgressRO } from "./types";

export const setBuddies = (buddies: BuddyRO[]) => ({
  type: constants.SET_BUDDIES,
  payload: buddies,
});

export const addBuddy = (buddy: BuddyRO) => ({
  type: constants.ADD_BUDDY,
  payload: buddy,
});

export const updateBuddy = (buddy: BuddyRO) => ({
  type: constants.UPDATE_BUDDY,
  payload: buddy,
});

export const deleteBuddy = (buddyId: string) => ({
  type: constants.DELETE_BUDDY,
  payload: buddyId,
});

export const setSelectedBuddy = (buddy: BuddyRO | null) => ({
  type: constants.SET_SELECTED_BUDDY,
  payload: buddy,
});

export const setBuddyTasks = (tasks: BuddyTasksRO) => ({
  type: constants.SET_BUDDY_TASKS,
  payload: tasks,
});

export const setBuddyProgress = (progress: BuddyProgressRO[]) => ({
  type: constants.SET_BUDDY_PROGRESS,
  payload: progress,
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