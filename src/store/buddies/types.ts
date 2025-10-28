import type { ActionType } from "typesafe-actions";
import * as actions from "./actions";

export type BuddiesActions = ActionType<typeof actions>;

// Buddy interfaces
export interface BuddyRO {
  id: string;
  userId: string;
  name: string;
  email: string;
  domainRole: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
  assignedMentorId?: string;
  mentorName?: string;
  status: 'active' | 'inactive' | 'exited';
  progress: number;
  joinDate: string;
  avatarUrl?: string;
  bio?: string;
  tasksCompleted: number;
  totalTasks: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBuddyDTO {
  name: string;
  email: string;
  password: string;
  domainRole: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
  bio?: string;
}

export interface UpdateBuddyDTO {
  name?: string;
  email?: string;
  domainRole?: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
  assignedMentorId?: string;
  status?: 'active' | 'inactive' | 'exited';
  bio?: string;
}

export interface BuddyTasksRO {
  tasks: {
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    priority: string;
    createdAt: string;
  }[];
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface BuddyProgressRO {
  topicId: string;
  topicName: string;
  category: string;
  checked: boolean;
  completedAt?: string;
}

export interface BuddiesState {
  buddies: BuddyRO[];
  selectedBuddy: BuddyRO | null;
  buddyTasks: BuddyTasksRO | null;
  buddyProgress: BuddyProgressRO[];
  loading: boolean;
  error: string | null;
  total: number;
  filters: {
    domainRole?: string;
    status?: string;
    mentorId?: string;
    search?: string;
  };
}