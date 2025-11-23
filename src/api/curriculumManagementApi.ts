import { apiSlice } from './apiSlice';

// Types
export interface CurriculumManagement {
  id: string;
  name: string;
  description: string;
  slug: string;
  domainRole: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'qa' | 'hr';
  totalWeeks: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  version: string;
  createdBy: string;
  lastModifiedBy: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumWeek {
  id: string;
  curriculumId: string;
  weekNumber: number;
  title: string;
  description?: string;
  learningObjectives?: string[];
  resources?: {
    title: string;
    url: string;
    type: string;
    duration?: string;
  }[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTemplate {
  id: string;
  curriculumWeekId: string;
  title: string;
  description: string;
  requirements?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours?: number;
  expectedResourceTypes?: {
    type: string;
    label: string;
    required: boolean;
  }[];
  resources?: {
    title: string;
    url: string;
    type: string;
  }[];
  displayOrder: number;
  createdBy: string;
  lastModifiedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuddyCurriculumProgress {
  enrollment: any;
  curriculum: CurriculumManagement;
  weekProgress: any[];
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
}

export interface TaskAssignment {
  assignment: any;
  taskTemplate: TaskTemplate;
  weekProgress: any;
  week: CurriculumWeek;
}

export interface BuddySubmissionDetails {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  domainRole: string;
  status: string;
}

export interface SubmissionWithDetails {
  id: string;
  taskAssignmentId: string;
  buddyId: string;
  version: number;
  description: string;
  notes?: string;
  reviewStatus: string;
  reviewedBy?: string;
  reviewedAt?: string;
  grade?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  resources: any[];
  feedbackCount: number;
}

export interface BuddySubmission {
  assignment: any;
  buddy: BuddySubmissionDetails | null;
  submissions: SubmissionWithDetails[];
  latestSubmission: SubmissionWithDetails | null;
}

export interface TaskWithSubmissions {
  taskTemplate: TaskTemplate;
  buddySubmissions: BuddySubmission[];
  totalBuddies: number;
  submittedCount: number;
  completedCount: number;
}

export interface WeekWithSubmissions {
  week: CurriculumWeek;
  tasks: TaskWithSubmissions[];
}

export interface CurriculumSubmissionsResponse {
  curriculumId: string;
  weeks: WeekWithSubmissions[];
}

export const curriculumManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ═══════════════════════════════════════════════════════════
    // CURRICULUMS
    // ═══════════════════════════════════════════════════════════

    getAllCurriculums: builder.query<CurriculumManagement[], { domainRole?: string; status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.domainRole) queryParams.append('domainRole', params.domainRole);
        if (params.status) queryParams.append('status', params.status);

        return {
          url: `/api/curriculums?${queryParams.toString()}`,
        };
      },
      providesTags: ['CurriculumManagement'],
    }),

    getCurriculumById: builder.query<CurriculumManagement, string>({
      query: (id) => `/api/curriculums/${id}`,
      providesTags: (result, error, id) => [{ type: 'CurriculumManagement', id }],
    }),

    createCurriculum: builder.mutation<CurriculumManagement, Partial<CurriculumManagement>>({
      query: (data) => ({
        url: '/api/curriculums',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CurriculumManagement'],
    }),

    updateCurriculum: builder.mutation<CurriculumManagement, { id: string; data: Partial<CurriculumManagement> }>({
      query: ({ id, data }) => ({
        url: `/api/curriculums/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CurriculumManagement', id },
        'CurriculumManagement',
      ],
    }),

    deleteCurriculum: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/curriculums/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CurriculumManagement'],
    }),

    publishCurriculum: builder.mutation<CurriculumManagement, string>({
      query: (id) => ({
        url: `/api/curriculums/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CurriculumManagement', id },
        'CurriculumManagement',
      ],
    }),

    // ═══════════════════════════════════════════════════════════
    // CURRICULUM WEEKS
    // ═══════════════════════════════════════════════════════════

    getCurriculumWeeks: builder.query<CurriculumWeek[], string>({
      query: (curriculumId) => `/api/curriculums/${curriculumId}/weeks`,
      providesTags: (result, error, curriculumId) => [
        { type: 'CurriculumWeek', id: curriculumId },
      ],
    }),

    createCurriculumWeek: builder.mutation<CurriculumWeek, { curriculumId: string; data: Partial<CurriculumWeek> }>({
      query: ({ curriculumId, data }) => ({
        url: `/api/curriculums/${curriculumId}/weeks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { curriculumId }) => [
        { type: 'CurriculumWeek', id: curriculumId },
      ],
    }),

    updateCurriculumWeek: builder.mutation<CurriculumWeek, { id: string; data: Partial<CurriculumWeek> }>({
      query: ({ id, data }) => ({
        url: `/api/weeks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['CurriculumWeek'],
    }),

    deleteCurriculumWeek: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/weeks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CurriculumWeek'],
    }),

    // ═══════════════════════════════════════════════════════════
    // TASK TEMPLATES
    // ═══════════════════════════════════════════════════════════

    getWeekTasks: builder.query<TaskTemplate[], string>({
      query: (weekId) => `/api/weeks/${weekId}/tasks`,
      providesTags: (result, error, weekId) => [
        { type: 'TaskTemplate', id: weekId },
      ],
    }),

    getTaskTemplateById: builder.query<TaskTemplate, string>({
      query: (id) => `/api/task-templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'TaskTemplate', id }],
    }),

    createTaskTemplate: builder.mutation<TaskTemplate, { weekId: string; data: Partial<TaskTemplate> }>({
      query: ({ weekId, data }) => ({
        url: `/api/weeks/${weekId}/tasks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { weekId }) => [
        { type: 'TaskTemplate', id: weekId },
      ],
    }),

    updateTaskTemplate: builder.mutation<TaskTemplate, { id: string; data: Partial<TaskTemplate> }>({
      query: ({ id, data }) => ({
        url: `/api/task-templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TaskTemplate', id },
        'TaskTemplate',
      ],
    }),

    deleteTaskTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/task-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TaskTemplate'],
    }),

    // ═══════════════════════════════════════════════════════════
    // BUDDY CURRICULUM
    // ═══════════════════════════════════════════════════════════

    getBuddyCurriculum: builder.query<BuddyCurriculumProgress, string>({
      query: (buddyId) => `/api/buddies/${buddyId}/curriculum`,
      providesTags: (result, error, buddyId) => [
        { type: 'BuddyCurriculum', id: buddyId },
      ],
    }),

    getBuddyAssignments: builder.query<TaskAssignment[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/assignments`,
      providesTags: (result, error, buddyId) => [
        { type: 'TaskAssignment', id: buddyId },
      ],
    }),

    // ═══════════════════════════════════════════════════════════
    // CURRICULUM SUBMISSIONS (Manager/Mentor view)
    // ═══════════════════════════════════════════════════════════

    getCurriculumSubmissions: builder.query<CurriculumSubmissionsResponse, string>({
      query: (curriculumId) => `/api/curriculums/${curriculumId}/submissions`,
      providesTags: (result, error, curriculumId) => [
        { type: 'CurriculumSubmissions', id: curriculumId },
      ],
    }),
  }),
});

export const {
  useGetAllCurriculumsQuery,
  useGetCurriculumByIdQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
  usePublishCurriculumMutation,
  useGetCurriculumWeeksQuery,
  useCreateCurriculumWeekMutation,
  useUpdateCurriculumWeekMutation,
  useDeleteCurriculumWeekMutation,
  useGetWeekTasksQuery,
  useGetTaskTemplateByIdQuery,
  useCreateTaskTemplateMutation,
  useUpdateTaskTemplateMutation,
  useDeleteTaskTemplateMutation,
  useGetBuddyCurriculumQuery,
  useGetBuddyAssignmentsQuery,
  useGetCurriculumSubmissionsQuery,
} = curriculumManagementApi;
