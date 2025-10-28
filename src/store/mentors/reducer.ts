import type { MentorsActions, MentorsState } from "./types";
import * as constants from "./constants";
import { initialState } from "./initialState";

const mentorsReducer = (
  state = initialState,
  action: MentorsActions,
): MentorsState => {
  switch (action.type) {
    case constants.SET_MENTORS:
      return {
        ...state,
        mentors: action.payload,
        total: action.payload.length,
        loading: false,
        error: null,
      };

    case constants.ADD_MENTOR:
      return {
        ...state,
        mentors: [...state.mentors, action.payload],
        total: state.total + 1,
        error: null,
      };

    case constants.UPDATE_MENTOR:
      return {
        ...state,
        mentors: state.mentors.map(mentor =>
          mentor.id === action.payload.id ? action.payload : mentor
        ),
        selectedMentor: state.selectedMentor?.id === action.payload.id 
          ? action.payload 
          : state.selectedMentor,
        error: null,
      };

    case constants.DELETE_MENTOR:
      return {
        ...state,
        mentors: state.mentors.filter(mentor => mentor.id !== action.payload),
        selectedMentor: state.selectedMentor?.id === action.payload 
          ? null 
          : state.selectedMentor,
        total: state.total - 1,
        error: null,
      };

    case constants.SET_SELECTED_MENTOR:
      return {
        ...state,
        selectedMentor: action.payload,
      };

    case constants.SET_MENTOR_BUDDIES:
      return {
        ...state,
        mentorBuddies: action.payload,
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

export default mentorsReducer;