/**
 * Comprehensive Curriculum Management Types
 * Based on the Curriculum-Management.readme.md specification
 */

export type DomainRole = 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';

export type CurriculumStatus = 'draft' | 'published' | 'archived';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskAssignmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'needs_revision'
  | 'completed';

export type SubmissionReviewStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'needs_revision'
  | 'rejected';

export type FeedbackType =
  | 'comment'
  | 'question'
  | 'approval'
  | 'revision_request'
  | 'reply';

export type BuddyCurriculumStatus = 'active' | 'paused' | 'completed' | 'dropped';
export type WeekProgressStatus = 'not_started' | 'in_progress' | 'completed';

// Curriculum (Main template)
export interface Curriculum {
  id: string;
  name: string;
  description: string;
  slug: string;
  domainRole: DomainRole;
  totalWeeks: number;
  status: CurriculumStatus;
  publishedAt: string | null;
  version: string;
  createdBy: string;
  lastModifiedBy: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations (populated on demand)
  weeks?: CurriculumWeek[];
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// Week definition
export interface CurriculumWeek {
  id: string;
  curriculumId: string;
  weekNumber: number;
  title: string;
  description: string;
  learningObjectives: string[];
  resources: WeekResource[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  tasks?: TaskTemplate[];
  curriculum?: Curriculum;
}

export interface WeekResource {
  title: string;
  url: string;
  type: string;
  duration?: string;
}

// Task Template (reusable definition)
export interface TaskTemplate {
  id: string;
  curriculumWeekId: string;
  title: string;
  description: string; // Markdown supported
  requirements: string;
  difficulty: TaskDifficulty;
  estimatedHours: number;
  expectedResourceTypes: ExpectedResourceType[];
  resources: TaskResource[];
  displayOrder: number;
  createdBy: string;
  lastModifiedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  week?: CurriculumWeek;
}

export interface ExpectedResourceType {
  type: string;
  label: string;
  required: boolean;
}

export interface TaskResource {
  title: string;
  url: string;
  type: string;
}

// Buddy's curriculum enrollment
export interface BuddyCurriculum {
  id: string;
  buddyId: string;
  curriculumId: string;
  startedAt: string;
  targetCompletionDate: string | null;
  completedAt: string | null;
  currentWeek: number;
  overallProgress: number; // 0-100
  status: BuddyCurriculumStatus;
  createdAt: string;
  updatedAt: string;

  // Relations
  curriculum?: Curriculum;
  buddy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  weekProgress?: BuddyWeekProgress[];
}

// Buddy's week-level progress
export interface BuddyWeekProgress {
  id: string;
  buddyCurriculumId: string;
  curriculumWeekId: string;
  weekNumber: number;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number; // 0-100
  startedAt: string | null;
  completedAt: string | null;
  status: WeekProgressStatus;
  createdAt: string;
  updatedAt: string;

  // Relations
  week?: CurriculumWeek;
  assignments?: TaskAssignment[];
}

// Individual buddy task assignment
export interface TaskAssignment {
  id: string;
  buddyId: string;
  taskTemplateId: string;
  buddyCurriculumId: string;
  buddyWeekProgressId: string;
  assignedAt: string;
  dueDate: string | null;
  status: TaskAssignmentStatus;
  startedAt: string | null;
  firstSubmissionAt: string | null;
  completedAt: string | null;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  taskTemplate?: TaskTemplate;
  buddy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  submissions?: Submission[];
  latestSubmission?: Submission;
}

// Submission (multiple versions per assignment)
export interface Submission {
  id: string;
  taskAssignmentId: string;
  buddyId: string;
  version: number;
  description: string;
  notes: string | null;
  reviewStatus: SubmissionReviewStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  grade: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  resources?: SubmissionResource[];
  feedback?: SubmissionFeedback[];
  assignment?: TaskAssignment;
  buddy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  reviewer?: {
    id: string;
    name: string;
    role: string;
  };
}

// Submission resources (URLs, files)
export interface SubmissionResource {
  id: string;
  submissionId: string;
  type: string; // 'github', 'hosted_url', 'pdf', etc.
  label: string;
  url: string;
  filename: string | null;
  filesize: number | null;
  displayOrder: number;
  createdAt: string;
}

// Feedback conversation thread
export interface SubmissionFeedback {
  id: string;
  submissionId: string;
  authorId: string;
  authorRole: 'mentor' | 'buddy' | 'manager';
  message: string;
  feedbackType: FeedbackType;
  parentFeedbackId: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  author?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replies?: SubmissionFeedback[];
}

// DTOs for API requests

export interface CreateCurriculumDTO {
  name: string;
  description: string;
  domainRole: DomainRole;
  totalWeeks: number;
  tags?: string[];
  version?: string;
}

export interface UpdateCurriculumDTO {
  name?: string;
  description?: string;
  totalWeeks?: number;
  tags?: string[];
  status?: CurriculumStatus;
  version?: string;
}

export interface CreateWeekDTO {
  curriculumId: string;
  weekNumber: number;
  title: string;
  description: string;
  learningObjectives?: string[];
  resources?: WeekResource[];
}

export interface UpdateWeekDTO {
  title?: string;
  description?: string;
  learningObjectives?: string[];
  resources?: WeekResource[];
  displayOrder?: number;
}

export interface CreateTaskTemplateDTO {
  curriculumWeekId: string;
  title: string;
  description: string;
  requirements: string;
  difficulty: TaskDifficulty;
  estimatedHours: number;
  expectedResourceTypes?: ExpectedResourceType[];
  resources?: TaskResource[];
}

export interface UpdateTaskTemplateDTO {
  title?: string;
  description?: string;
  requirements?: string;
  difficulty?: TaskDifficulty;
  estimatedHours?: number;
  expectedResourceTypes?: ExpectedResourceType[];
  resources?: TaskResource[];
  displayOrder?: number;
  isActive?: boolean;
}

export interface SubmitTaskDTO {
  description: string;
  notes?: string;
  resources: {
    type: string;
    label: string;
    url: string;
    filename?: string;
  }[];
}

export interface ReviewSubmissionDTO {
  reviewStatus: SubmissionReviewStatus;
  grade?: string;
}

export interface AddFeedbackDTO {
  message: string;
  feedbackType: FeedbackType;
  parentFeedbackId?: string;
}

export interface ReorderDTO {
  items: {
    id: string;
    displayOrder: number;
  }[];
}

// Analytics & Dashboard Types

export interface CurriculumAnalytics {
  curriculumId: string;
  totalBuddies: number;
  activeBuddies: number;
  completedBuddies: number;
  averageProgress: number;
  averageCompletionTime: number; // in days
  taskCompletionRate: number;
  weekCompletionRates: {
    weekNumber: number;
    completionRate: number;
  }[];
}

export interface MentorDashboard {
  totalBuddies: number;
  activeBuddies: number;
  pendingReviews: number;
  urgentReviews: number;
  recentSubmissions: Submission[];
  buddyProgress: {
    buddyId: string;
    buddyName: string;
    progress: number;
    currentWeek: number;
  }[];
}

export interface MentorReviewQueue {
  urgent: ReviewQueueItem[];
  recent: ReviewQueueItem[];
  all: ReviewQueueItem[];
}

export interface ReviewQueueItem {
  submissionId: string;
  buddyId: string;
  buddyName: string;
  buddyAvatar?: string;
  taskTitle: string;
  weekNumber: number;
  weekTitle: string;
  submittedAt: string;
  version: number;
  resourceCount: number;
  previousFeedbackCount: number;
  daysWaiting: number;
}

export interface BuddyDashboardData {
  enrollment: BuddyCurriculum;
  weekProgress: BuddyWeekProgress[];
  upcomingTasks: TaskAssignment[];
  recentSubmissions: Submission[];
  statistics: {
    overallProgress: number;
    completedTasks: number;
    totalTasks: number;
    currentWeek: number;
    totalWeeks: number;
    daysActive: number;
    pendingSubmissions: number;
  };
}

// Filter & Search types

export interface CurriculumFilters {
  domainRole?: DomainRole;
  status?: CurriculumStatus;
  search?: string;
  createdBy?: string;
}

export interface ReviewQueueFilters {
  buddyId?: string;
  weekNumber?: number;
  taskTemplateId?: string;
  sortBy?: 'oldest' | 'newest' | 'priority';
}

export interface TaskAssignmentFilters {
  status?: TaskAssignmentStatus;
  weekNumber?: number;
  buddyId?: string;
}
