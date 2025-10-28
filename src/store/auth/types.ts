import type { ActionType } from "typesafe-actions";
import * as actions from "./actions";

export type AuthActions = ActionType<typeof actions>;

// User interface
export interface UserRO {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'mentor' | 'buddy';
  domainRole: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
  avatarUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  phoneNumber?: string;
  timezone?: string;
}

// Auth DTOs
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role: 'manager' | 'mentor' | 'buddy';
  domainRole: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  phoneNumber?: string;
  timezone?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Auth response interface
export interface LoginResponseRO {
  user: UserRO;
  token: string;
  expiresIn: string;
}

export interface AuthState {
  user: UserRO | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}