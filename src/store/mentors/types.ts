import type { ActionType } from "typesafe-actions";
import * as actions from "./actions";

export type MentorsActions = ActionType<typeof actions>;

// Mentor interfaces - matching actual API response
export interface MentorRO {
  id: string;
  userId: string;
  expertise: string;
  experience: string;
  responseRate: number;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    domainRole: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
    avatarUrl?: string;
  };
  stats: {
    buddiesCount: string | number;
    completedTasks: number;
  };
  // Computed properties for easier access
  name?: string;     // user.name
  email?: string;    // user.email
  domainRole?: string; // user.domainRole
}

// Mentor DTOs
export interface CreateMentorDTO {
  name: string;
  email: string;
  password: string;
  domainRole: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
  expertise: string;
  experience: string;
  bio?: string;
}

export interface UpdateMentorDTO {
  name?: string;
  email?: string;
  domainRole?: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
  expertise?: string;
  experience?: string;
  bio?: string;
  isActive?: boolean;
}

// Mentor buddies response
export interface MentorBuddiesRO {
  buddies: {
    id: string;
    userId: string;
    name: string;
    email: string;
    domainRole: string;
    status: string;
    progress: number;
    joinDate: string;
  }[];
  total: number;
  active: number;
  inactive: number;
}

// State interface
export interface MentorsState {
  mentors: MentorRO[];
  selectedMentor: MentorRO | null;
  mentorBuddies: MentorBuddiesRO | null;
  loading: boolean;
  error: string | null;
  total: number;
  filters: {
    domainRole?: string;
    isActive?: boolean;
    search?: string;
  };
}