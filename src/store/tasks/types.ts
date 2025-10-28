import type { ActionType } from "typesafe-actions";
import * as actions from "./actions";

export type TasksActions = ActionType<typeof actions>;

export interface TaskRO {
  id: string;
  mentorId: string;
  buddyId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  buddyName?: string;
  mentorName?: string;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  buddyId: string;
  mentorId: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskSubmissionRO {
  id: string;
  taskId: string;
  buddyId: string;
  githubLink?: string;
  deployedUrl?: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
  buddyName?: string;
}

export interface CreateTaskSubmissionDTO {
  taskId: string;
  githubLink?: string;
  deployedUrl?: string;
  notes?: string;
}

export interface TasksState {
  tasks: TaskRO[];
  selectedTask: TaskRO | null;
  taskSubmissions: TaskSubmissionRO[];
  loading: boolean;
  error: string | null;
  total: number;
  filters: {
    status?: string;
    priority?: string;
    buddyId?: string;
    mentorId?: string;
    search?: string;
  };
}