import type { TasksState } from "./types";

export const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  taskSubmissions: [],
  loading: false,
  error: null,
  total: 0,
  filters: {},
};