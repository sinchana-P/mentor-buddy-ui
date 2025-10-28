import type { BuddiesActions, BuddiesState } from "./types";
import * as constants from "./constants";
import { initialState } from "./initialState";

const buddiesReducer = (
  state = initialState,
  action: BuddiesActions,
): BuddiesState => {
  switch (action.type) {
    case constants.SET_BUDDIES:
      return {
        ...state,
        buddies: action.payload,
        total: action.payload.length,
        loading: false,
        error: null,
      };

    case constants.ADD_BUDDY:
      return {
        ...state,
        buddies: [...state.buddies, action.payload],
        total: state.total + 1,
        error: null,
      };

    case constants.UPDATE_BUDDY:
      return {
        ...state,
        buddies: state.buddies.map(buddy =>
          buddy.id === action.payload.id ? action.payload : buddy
        ),
        selectedBuddy: state.selectedBuddy?.id === action.payload.id
          ? action.payload
          : state.selectedBuddy,
        error: null,
      };

    case constants.DELETE_BUDDY:
      return {
        ...state,
        buddies: state.buddies.filter(buddy => buddy.id !== action.payload),
        selectedBuddy: state.selectedBuddy?.id === action.payload
          ? null
          : state.selectedBuddy,
        total: state.total - 1,
        error: null,
      };

    case constants.SET_SELECTED_BUDDY:
      return {
        ...state,
        selectedBuddy: action.payload,
      };

    case constants.SET_BUDDY_TASKS:
      return {
        ...state,
        buddyTasks: action.payload,
        error: null,
      };

    case constants.SET_BUDDY_PROGRESS:
      return {
        ...state,
        buddyProgress: action.payload,
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

export default buddiesReducer;