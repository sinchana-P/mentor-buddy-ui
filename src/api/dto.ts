// Data Transfer Objects (DTOs) following your reference pattern
// These define the structure for API requests and responses

// Base DTO
export interface BaseDTO {
  id?: string;
}

// User-related DTOs
export interface UserRO {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'mentor' | 'buddy';
  domainRole: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
  permissions?: string[];
  profileId?: string; // mentor ID or buddy ID for profile access
  avatarUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Authentication DTOs
export interface SignInDTO {
  email: string;
  password: string;
}

export interface SignUpDTO {
  name: string;
  email: string;
  password: string;
  role: string;
  domainRole?: string;
}

export interface AuthResponseRO {
  message: string;
  user: UserRO;
  token: string;
  refreshToken?: string;
}

// Mentor-related DTOs
export interface MentorRO {
  id: string;
  name: string;
  email: string;
  domainRole: string;
  expertise?: string;
  experience?: string;
  bio?: string;
  buddiesCount: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: UserRO;
  avatarUrl?: string;
}

export interface CreateMentorDTO {
  name: string;
  email: string;
  password: string;
  domainRole: string;
  expertise?: string;
  experience?: string;
  bio?: string;
}

export interface UpdateMentorDTO {
  name?: string;
  email?: string;
  domainRole?: string;
  expertise?: string;
  experience?: string;
  bio?: string;
  isActive?: boolean;
}

export interface MentorsQueryDTO {
  domain?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Buddy-related DTOs
export interface BuddyRO {
  id: string;
  name: string;
  email: string;
  domainRole: string;
  mentorId?: string;
  mentorName?: string;
  mentor?: {
    id: string;
    user?: {
      id: string;
      name: string;
      email: string;
      domainRole: string;
    };
  };
  joinDate: string;
  status: string;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  createdAt: string;
  updatedAt: string;
  user?: UserRO;
  userId?: string;
  assignedMentorId?: string;
  avatarUrl?: string;
}

export interface CreateBuddyDTO {
  name: string;
  email: string;
  password?: string;
  domainRole: string;
  assignedMentorId?: string;
  topicIds?: string[]; // Optional array of topic IDs for buddy-specific topics
  curriculumId?: string; // Optional curriculum ID for manual assignment
}

export interface UpdateBuddyDTO {
  name?: string;
  email?: string;
  domainRole?: string;
  status?: string;
  assignedMentorId?: string;
}

export interface BuddiesQueryDTO {
  mentorId?: string;
  domain?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Task-related DTOs
export interface TaskRO {
  id: string;
  title: string;
  description: string;
  buddyId: string;
  buddyName?: string;
  mentorId: string;
  mentorName?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Nested objects from JOINs
  buddy?: {
    name: string;
    email?: string;
  };
  mentor?: {
    name: string;
    email?: string;
  };
  submissions?: Array<{
    id: string;
    githubLink?: string;
    deployedUrl?: string;
    notes?: string;
  }>;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  buddyId: string;
  mentorId: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface TasksQueryDTO {
  buddyId?: string;
  mentorId?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Resource-related DTOs
export interface ResourceRO {
  id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceDTO {
  title: string;
  type: string;
  url: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  author: string;
  tags: string[];
}

export interface UpdateResourceDTO {
  title?: string;
  type?: string;
  url?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  duration?: string;
  author?: string;
  tags?: string[];
}

export interface ResourcesQueryDTO {
  type?: string;
  category?: string;
  difficulty?: string;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

// Dashboard DTOs
export interface DashboardStatsRO {
  totalBuddies: number;
  activeBuddies: number;
  totalMentors: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  activeTasks: number;
  completionRate: number;
}

export interface ActivityItemRO {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
  entityId?: string;
  entityType?: string;
}

// Settings DTOs
export interface UserProfileDTO {
  name?: string;
  bio?: string;
  phoneNumber?: string;
  timezone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Common response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination wrapper
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Portfolio types
export interface PortfolioLink {
  label: string;
  url: string;
  type: 'github' | 'live' | 'other';
}

export interface PortfolioRO {
  id: string;
  buddyId: string;
  title: string;
  description: string;
  technologies: string[];
  links: PortfolioLink[];
  resourceUrl?: string | null;
  resourceType?: string | null;
  resourceName?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioDTO {
  title: string;
  description: string;
  technologies?: string[];
  links?: PortfolioLink[];
  resourceUrl?: string;
  resourceType?: string;
  resourceName?: string;
  completedAt?: string;
}

export interface UpdatePortfolioDTO {
  title?: string;
  description?: string;
  technologies?: string[];
  links?: PortfolioLink[];
  resourceUrl?: string | null;
  resourceType?: string | null;
  resourceName?: string | null;
  completedAt?: string | null;
}

// Error response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: unknown;
}