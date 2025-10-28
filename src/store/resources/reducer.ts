import type { ResourcesActions, ResourcesState } from "./types";
import * as constants from "./constants";
import { initialState } from "./initialState";

const resourcesReducer = (
  state = initialState,
  action: ResourcesActions,
): ResourcesState => {
  switch (action.type) {
    case constants.SET_RESOURCES:
      return {
        ...state,
        resources: action.payload,
        total: action.payload.length,
        loading: false,
        error: null,
      };

    case constants.ADD_RESOURCE:
      return {
        ...state,
        resources: [...state.resources, action.payload],
        total: state.total + 1,
        error: null,
      };

    case constants.UPDATE_RESOURCE:
      return {
        ...state,
        resources: state.resources.map(resource =>
          resource.id === action.payload.id ? action.payload : resource
        ),
        selectedResource: state.selectedResource?.id === action.payload.id
          ? action.payload
          : state.selectedResource,
        error: null,
      };

    case constants.DELETE_RESOURCE:
      return {
        ...state,
        resources: state.resources.filter(resource => resource.id !== action.payload),
        selectedResource: state.selectedResource?.id === action.payload
          ? null
          : state.selectedResource,
        total: state.total - 1,
        error: null,
      };

    case constants.SET_SELECTED_RESOURCE:
      return {
        ...state,
        selectedResource: action.payload,
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

export default resourcesReducer;