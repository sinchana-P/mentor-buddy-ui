import type { ResourcesState } from "./types";

export const initialState: ResourcesState = {
  resources: [],
  selectedResource: null,
  loading: false,
  error: null,
  total: 0,
  filters: {},
};