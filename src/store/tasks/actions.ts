import * as constants from "./constants";
import type { TaskRO, TaskSubmissionRO } from "./types";

export const setTasks = (tasks: TaskRO[]) => ({
  type: constants.SET_TASKS,
  payload: tasks,
});

export const addTask = (task: TaskRO) => ({
  type: constants.ADD_TASK,
  payload: task,
});

export const updateTask = (task: TaskRO) => ({
  type: constants.UPDATE_TASK,
  payload: task,
});

export const deleteTask = (taskId: string) => ({
  type: constants.DELETE_TASK,
  payload: taskId,
});

export const setSelectedTask = (task: TaskRO | null) => ({
  type: constants.SET_SELECTED_TASK,
  payload: task,
});

export const setTaskSubmissions = (submissions: TaskSubmissionRO[]) => ({
  type: constants.SET_TASK_SUBMISSIONS,
  payload: submissions,
});

export const addTaskSubmission = (submission: TaskSubmissionRO) => ({
  type: constants.ADD_TASK_SUBMISSION,
  payload: submission,
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