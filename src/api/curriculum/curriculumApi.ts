/**
 * Curriculum Management API
 * Complete RTK Query API for curriculum system
 */

import { api } from '../api';
import type {
  Curriculum,
  CurriculumWeek,
  TaskTemplate,
  BuddyCurriculum,
  BuddyWeekProgress,
  TaskAssignment,
  Submission,
  SubmissionFeedback,
  CreateCurriculumDTO,
  UpdateCurriculumDTO,
  CreateWeekDTO,
  UpdateWeekDTO,
  CreateTaskTemplateDTO,
  UpdateTaskTemplateDTO,
  SubmitTaskDTO,
  ReviewSubmissionDTO,
  AddFeedbackDTO,
  ReorderDTO,
  CurriculumAnalytics,
  MentorDashboard,
  MentorReviewQueue,
  BuddyDashboardData,
  CurriculumFilters,
  ReviewQueueFilters,
} from '@/types/curriculum';

export const curriculumApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ============ CURRICULUM CRUD ============
    getCurriculums: builder.query<Curriculum[], CurriculumFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.domainRole) params.append('domainRole', filters.domainRole);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.createdBy) params.append('createdBy', filters.createdBy);

        return {
          url: `/api/curriculums?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Curriculum'],
    }),

    getCurriculumById: builder.query<Curriculum, string>({
      query: (id) => `/api/curriculums/${id}`,
      providesTags: (result, error, id) => [{ type: 'Curriculum', id }],
    }),

    getCurriculumByDomain: builder.query<Curriculum, string>({
      query: (domainRole) => `/api/curriculums/domain/${domainRole}`,
      providesTags: ['Curriculum'],
    }),

    createCurriculum: builder.mutation<Curriculum, CreateCurriculumDTO>({
      query: (data) => ({
        url: '/api/curriculums',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Curriculum'],
    }),

    updateCurriculum: builder.mutation<Curriculum, { id: string; data: UpdateCurriculumDTO }>({
      query: ({ id, data }) => ({
        url: `/api/curriculums/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Curriculum', id }, 'Curriculum'],
    }),

    deleteCurriculum: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/curriculums/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Curriculum'],
    }),

    publishCurriculum: builder.mutation<Curriculum, string>({
      query: (id) => ({
        url: `/api/curriculums/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Curriculum', id }, 'Curriculum'],
    }),

    unpublishCurriculum: builder.mutation<Curriculum, string>({
      query: (id) => ({
        url: `/api/curriculums/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Curriculum', id }, 'Curriculum'],
    }),

    duplicateCurriculum: builder.mutation<Curriculum, string>({
      query: (id) => ({
        url: `/api/curriculums/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Curriculum'],
    }),

    // ============ WEEKS CRUD ============
    getCurriculumWeeks: builder.query<CurriculumWeek[], string>({
      query: (curriculumId) => `/api/curriculums/${curriculumId}/weeks`,
      providesTags: (result, error, curriculumId) => [
        { type: 'CurriculumWeeks', id: curriculumId },
      ],
    }),

    getWeekById: builder.query<CurriculumWeek, string>({
      query: (id) => `/api/weeks/${id}`,
      providesTags: (result, error, id) => [{ type: 'CurriculumWeek', id }],
    }),

    createWeek: builder.mutation<CurriculumWeek, CreateWeekDTO>({
      query: (data) => ({
        url: `/api/curriculums/${data.curriculumId}/weeks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'CurriculumWeeks', id: data.curriculumId },
        { type: 'Curriculum', id: data.curriculumId },
      ],
    }),

    updateWeek: builder.mutation<CurriculumWeek, { id: string; data: UpdateWeekDTO }>({
      query: ({ id, data }) => ({
        url: `/api/weeks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CurriculumWeek', id },
        'CurriculumWeeks',
      ],
    }),

    deleteWeek: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/weeks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CurriculumWeeks'],
    }),

    reorderWeeks: builder.mutation<void, ReorderDTO>({
      query: (data) => ({
        url: '/api/weeks/reorder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CurriculumWeeks'],
    }),

    // ============ TASK TEMPLATES CRUD ============
    getWeekTasks: builder.query<TaskTemplate[], string>({
      query: (weekId) => `/api/weeks/${weekId}/tasks`,
      providesTags: (result, error, weekId) => [{ type: 'WeekTasks', id: weekId }],
    }),

    getTaskTemplateById: builder.query<TaskTemplate, string>({
      query: (id) => `/api/task-templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'TaskTemplate', id }],
    }),

    createTaskTemplate: builder.mutation<TaskTemplate, CreateTaskTemplateDTO>({
      query: (data) => ({
        url: `/api/weeks/${data.curriculumWeekId}/tasks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'WeekTasks', id: data.curriculumWeekId },
      ],
    }),

    updateTaskTemplate: builder.mutation<TaskTemplate, { id: string; data: UpdateTaskTemplateDTO }>({
      query: ({ id, data }) => ({
        url: `/api/task-templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TaskTemplate', id },
        'WeekTasks',
      ],
    }),

    deleteTaskTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/task-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WeekTasks'],
    }),

    duplicateTaskTemplate: builder.mutation<TaskTemplate, string>({
      query: (id) => ({
        url: `/api/task-templates/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['WeekTasks'],
    }),

    reorderTasks: builder.mutation<void, ReorderDTO>({
      query: (data) => ({
        url: '/api/task-templates/reorder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WeekTasks'],
    }),

    // ============ BUDDY CURRICULUM & PROGRESS ============
    getBuddyCurriculum: builder.query<BuddyCurriculum, string>({
      query: (buddyId) => `/api/buddies/${buddyId}/curriculum`,
      providesTags: (result, error, buddyId) => [{ type: 'BuddyCurriculum', id: buddyId }],
    }),

    getBuddyProgress: builder.query<BuddyWeekProgress[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/progress`,
      providesTags: (result, error, buddyId) => [{ type: 'BuddyProgress', id: buddyId }],
    }),

    getBuddyAssignments: builder.query<TaskAssignment[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/assignments`,
      providesTags: (result, error, buddyId) => [{ type: 'BuddyAssignments', id: buddyId }],
    }),

    getBuddyDashboard: builder.query<BuddyDashboardData, string>({
      query: (buddyId) => `/api/buddies/${buddyId}/dashboard`,
      providesTags: (result, error, buddyId) => [{ type: 'BuddyDashboard', id: buddyId }],
    }),

    // ============ TASK ASSIGNMENTS ============
    getTaskAssignment: builder.query<TaskAssignment, string>({
      query: (id) => `/api/task-assignments/${id}`,
      providesTags: (result, error, id) => [{ type: 'TaskAssignment', id }],
    }),

    startTask: builder.mutation<TaskAssignment, string>({
      query: (assignmentId) => ({
        url: `/api/task-assignments/${assignmentId}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, assignmentId) => [
        { type: 'TaskAssignment', id: assignmentId },
        'BuddyAssignments',
        'BuddyProgress',
      ],
    }),

    submitTask: builder.mutation<Submission, { assignmentId: string; data: SubmitTaskDTO }>({
      query: ({ assignmentId, data }) => ({
        url: `/api/task-assignments/${assignmentId}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'TaskAssignment', id: assignmentId },
        'BuddyAssignments',
        'Submissions',
        'ReviewQueue',
      ],
    }),

    // ============ SUBMISSIONS ============
    getSubmission: builder.query<Submission, string>({
      query: (id) => `/api/submissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Submission', id }],
    }),

    updateSubmission: builder.mutation<Submission, { id: string; data: Partial<SubmitTaskDTO> }>({
      query: ({ id, data }) => ({
        url: `/api/submissions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Submission', id }, 'Submissions'],
    }),

    deleteSubmission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/submissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Submissions', 'ReviewQueue'],
    }),

    // ============ REVIEW ACTIONS ============
    approveSubmission: builder.mutation<Submission, { id: string; data: ReviewSubmissionDTO }>({
      query: ({ id, data }) => ({
        url: `/api/submissions/${id}/approve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Submission', id },
        'Submissions',
        'ReviewQueue',
        'BuddyProgress',
        'BuddyAssignments',
      ],
    }),

    rejectSubmission: builder.mutation<Submission, { id: string; data: ReviewSubmissionDTO }>({
      query: ({ id, data }) => ({
        url: `/api/submissions/${id}/reject`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Submission', id },
        'Submissions',
        'ReviewQueue',
      ],
    }),

    gradeSubmission: builder.mutation<Submission, { id: string; grade: string }>({
      query: ({ id, grade }) => ({
        url: `/api/submissions/${id}/grade`,
        method: 'POST',
        body: { grade },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Submission', id },
        'Submissions',
      ],
    }),

    // ============ FEEDBACK ============
    getSubmissionFeedback: builder.query<SubmissionFeedback[], string>({
      query: (submissionId) => `/api/submissions/${submissionId}/feedback`,
      providesTags: (result, error, submissionId) => [
        { type: 'SubmissionFeedback', id: submissionId },
      ],
    }),

    addFeedback: builder.mutation<SubmissionFeedback, { submissionId: string; data: AddFeedbackDTO }>({
      query: ({ submissionId, data }) => ({
        url: `/api/submissions/${submissionId}/feedback`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { submissionId }) => [
        { type: 'SubmissionFeedback', id: submissionId },
        { type: 'Submission', id: submissionId },
      ],
    }),

    updateFeedback: builder.mutation<SubmissionFeedback, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: `/api/feedback/${id}`,
        method: 'PATCH',
        body: { message },
      }),
      invalidatesTags: ['SubmissionFeedback'],
    }),

    deleteFeedback: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/feedback/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubmissionFeedback'],
    }),

    // ============ MENTOR DASHBOARD & ANALYTICS ============
    getMentorDashboard: builder.query<MentorDashboard, string>({
      query: (mentorId) => `/api/mentors/${mentorId}/dashboard`,
      providesTags: ['MentorDashboard'],
    }),

    getMentorReviewQueue: builder.query<MentorReviewQueue, { mentorId: string; filters?: ReviewQueueFilters }>({
      query: ({ mentorId, filters }) => {
        const params = new URLSearchParams();
        if (filters?.buddyId) params.append('buddyId', filters.buddyId);
        if (filters?.weekNumber) params.append('weekNumber', filters.weekNumber.toString());
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);

        return `/api/mentors/${mentorId}/review-queue?${params.toString()}`;
      },
      providesTags: ['ReviewQueue'],
    }),

    getCurriculumAnalytics: builder.query<CurriculumAnalytics, string>({
      query: (curriculumId) => `/api/curriculums/${curriculumId}/analytics`,
      providesTags: (result, error, curriculumId) => [
        { type: 'CurriculumAnalytics', id: curriculumId },
      ],
    }),
  }),
});

// Export hooks
export const {
  // Curriculum
  useGetCurriculumsQuery,
  useGetCurriculumByIdQuery,
  useGetCurriculumByDomainQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
  usePublishCurriculumMutation,
  useUnpublishCurriculumMutation,
  useDuplicateCurriculumMutation,

  // Weeks
  useGetCurriculumWeeksQuery,
  useGetWeekByIdQuery,
  useCreateWeekMutation,
  useUpdateWeekMutation,
  useDeleteWeekMutation,
  useReorderWeeksMutation,

  // Task Templates
  useGetWeekTasksQuery,
  useGetTaskTemplateByIdQuery,
  useCreateTaskTemplateMutation,
  useUpdateTaskTemplateMutation,
  useDeleteTaskTemplateMutation,
  useDuplicateTaskTemplateMutation,
  useReorderTasksMutation,

  // Buddy Curriculum
  useGetBuddyCurriculumQuery,
  useGetBuddyProgressQuery,
  useGetBuddyAssignmentsQuery,
  useGetBuddyDashboardQuery,

  // Task Assignments
  useGetTaskAssignmentQuery,
  useStartTaskMutation,
  useSubmitTaskMutation,

  // Submissions
  useGetSubmissionQuery,
  useUpdateSubmissionMutation,
  useDeleteSubmissionMutation,

  // Review
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
  useGradeSubmissionMutation,

  // Feedback
  useGetSubmissionFeedbackQuery,
  useAddFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,

  // Analytics
  useGetMentorDashboardQuery,
  useGetMentorReviewQueueQuery,
  useGetCurriculumAnalyticsQuery,
} = curriculumApi;
