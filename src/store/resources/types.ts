import type { ActionType } from "typesafe-actions";
import * as actions from "./actions";

export type ResourcesActions = ActionType<typeof actions>;

export interface ResourceRO {
  id: string;
  title: string;
  url: string;
  description?: string;
  type?: string;
  category?: string;
  difficulty?: string;
  duration?: string;
  author?: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateResourceDTO {
  title: string;
  url: string;
  description?: string;
  type?: string;
  category?: string;
  difficulty?: string;
  duration?: string;
  author?: string;
  tags: string[];
}

export interface UpdateResourceDTO {
  title?: string;
  url?: string;
  description?: string;
  type?: string;
  category?: string;
  difficulty?: string;
  duration?: string;
  author?: string;
  tags?: string[];
}

export interface ResourcesState {
  resources: ResourceRO[];
  selectedResource: ResourceRO | null;
  loading: boolean;
  error: string | null;
  total: number;
  filters: {
    type?: string;
    category?: string;
    difficulty?: string;
    search?: string;
    tags?: string[];
  };
}