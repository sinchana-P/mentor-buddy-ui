import type { TasksActions, TasksState } from "./types";
import * as constants from "./constants";
import { initialState } from "./initialState";

const tasksReducer = (
  state = initialState,
  action: TasksActions,
): TasksState => {
  switch (action.type) {
    case constants.SET_TASKS:
      return {
        ...state,
        tasks: action.payload,
        total: action.payload.length,
        loading: false,
        error: null,
      };

    case constants.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        total: state.total + 1,
        error: null,
      };

    case constants.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        selectedTask: state.selectedTask?.id === action.payload.id
          ? action.payload
          : state.selectedTask,
        error: null,
      };

    case constants.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        selectedTask: state.selectedTask?.id === action.payload
          ? null
          : state.selectedTask,
        total: state.total - 1,
        error: null,
      };

    case constants.SET_SELECTED_TASK:
      return {
        ...state,
        selectedTask: action.payload,
      };

    case constants.SET_TASK_SUBMISSIONS:
      return {
        ...state,
        taskSubmissions: action.payload,
        error: null,
      };

    case constants.ADD_TASK_SUBMISSION:
      return {
        ...state,
        taskSubmissions: [...state.taskSubmissions, action.payload],
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

export default tasksReducer;