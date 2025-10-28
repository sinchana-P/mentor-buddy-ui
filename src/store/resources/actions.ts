import * as constants from "./constants";
import type { ResourceRO } from "./types";

export const setResources = (resources: ResourceRO[]) => ({
  type: constants.SET_RESOURCES,
  payload: resources,
});

export const addResource = (resource: ResourceRO) => ({
  type: constants.ADD_RESOURCE,
  payload: resource,
});

export const updateResource = (resource: ResourceRO) => ({
  type: constants.UPDATE_RESOURCE,
  payload: resource,
});

export const deleteResource = (resourceId: string) => ({
  type: constants.DELETE_RESOURCE,
  payload: resourceId,
});

export const setSelectedResource = (resource: ResourceRO | null) => ({
  type: constants.SET_SELECTED_RESOURCE,
  payload: resource,
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