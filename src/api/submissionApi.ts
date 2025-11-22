import { apiSlice } from './apiSlice';

// Types
export interface SubmissionResource {
  id?: string;
  submissionId?: string;
  type: string;
  label: string;
  url: string;
  filename?: string;
  filesize?: number;
  displayOrder?: number;
  createdAt?: string;
}

export interface Submission {
  id: string;
  taskAssignmentId: string;
  buddyId: string;
  version: number;
  description: string;
  notes?: string;
  reviewStatus: 'pending' | 'under_review' | 'approved' | 'needs_revision' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  grade?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  resources?: SubmissionResource[];
  feedback?: Feedback[];
}

export interface Feedback {
  id: string;
  submissionId: string;
  authorId: string;
  authorRole: 'mentor' | 'buddy' | 'manager';
  message: string;
  feedbackType: 'comment' | 'question' | 'approval' | 'revision_request' | 'reply';
  parentFeedbackId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignmentDetail {
  assignment: {
    id: string;
    buddyId: string;
    taskTemplateId: string;
    buddyCurriculumId: string;
    buddyWeekProgressId: string;
    assignedAt: string;
    dueDate?: string;
    status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'needs_revision' | 'completed';
    startedAt?: string;
    firstSubmissionAt?: string;
    completedAt?: string;
    submissionCount: number;
    createdAt: string;
    updatedAt: string;
  };
  taskTemplate: any;
}

export interface SubmitTaskData {
  description: string;
  notes?: string;
  resources: {
    type: string;
    label: string;
    url: string;
    filename?: string;
    filesize?: number;
  }[];
}

export interface ReviewQueueItem {
  submission: Submission;
  assignment: any;
  taskTemplate: any;
  resources: SubmissionResource[];
}

export const submissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ═══════════════════════════════════════════════════════════
    // TASK ASSIGNMENTS
    // ═══════════════════════════════════════════════════════════

    getTaskAssignment: builder.query<TaskAssignmentDetail, string>({
      query: (id) => `/api/task-assignments/${id}`,
      providesTags: (result, error, id) => [{ type: 'TaskAssignment', id }],
    }),

    startTaskAssignment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/task-assignments/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'TaskAssignment', id },
        'BuddyCurriculum',
      ],
    }),

    submitTaskAssignment: builder.mutation<Submission, { id: string; data: SubmitTaskData }>({
      query: ({ id, data }) => ({
        url: `/api/task-assignments/${id}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TaskAssignment', id },
        'Submission',
        'BuddyCurriculum',
      ],
    }),

    getTaskAssignmentSubmissions: builder.query<Submission[], string>({
      query: (taskAssignmentId) => `/api/task-assignments/${taskAssignmentId}/submissions`,
      providesTags: (result, error, taskAssignmentId) => [
        { type: 'Submission', id: taskAssignmentId },
      ],
    }),

    // ═══════════════════════════════════════════════════════════
    // SUBMISSIONS
    // ═══════════════════════════════════════════════════════════

    getSubmission: builder.query<Submission, string>({
      query: (id) => `/api/submissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Submission', id }],
    }),

    updateSubmission: builder.mutation<Submission, { id: string; data: { description?: string; notes?: string } }>({
      query: ({ id, data }) => ({
        url: `/api/submissions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Submission', id },
      ],
    }),

    deleteSubmission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/submissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Submission', 'TaskAssignment'],
    }),

    // ═══════════════════════════════════════════════════════════
    // REVIEW ACTIONS
    // ═══════════════════════════════════════════════════════════

    approveSubmission: builder.mutation<Submission, { id: string; grade?: string }>({
      query: ({ id, grade }) => ({
        url: `/api/submissions/${id}/approve`,
        method: 'POST',
        body: { grade },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Submission', id },
        'TaskAssignment',
        'BuddyCurriculum',
        'ReviewQueue',
      ],
    }),

    requestRevision: builder.mutation<Submission, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: `/api/submissions/${id}/request-revision`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Submission', id },
        'TaskAssignment',
        'BuddyCurriculum',
        'ReviewQueue',
      ],
    }),

    rejectSubmission: builder.mutation<Submission, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: `/api/submissions/${id}/reject`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Submission', id },
        'TaskAssignment',
        'BuddyCurriculum',
        'ReviewQueue',
      ],
    }),

    // ═══════════════════════════════════════════════════════════
    // FEEDBACK
    // ═══════════════════════════════════════════════════════════

    addFeedback: builder.mutation<Feedback, { submissionId: string; data: { message: string; feedbackType?: string; parentFeedbackId?: string } }>({
      query: ({ submissionId, data }) => ({
        url: `/api/submissions/${submissionId}/feedback`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { submissionId }) => [
        { type: 'Submission', id: submissionId },
        'Feedback',
      ],
    }),

    getSubmissionFeedback: builder.query<Feedback[], string>({
      query: (submissionId) => `/api/submissions/${submissionId}/feedback`,
      providesTags: (result, error, submissionId) => [
        { type: 'Feedback', id: submissionId },
      ],
    }),

    updateFeedback: builder.mutation<Feedback, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: `/api/feedback/${id}`,
        method: 'PATCH',
        body: { message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Feedback', id },
        'Feedback',
      ],
    }),

    deleteFeedback: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/feedback/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Feedback'],
    }),

    // ═══════════════════════════════════════════════════════════
    // MENTOR REVIEW QUEUE
    // ═══════════════════════════════════════════════════════════

    getMentorReviewQueue: builder.query<ReviewQueueItem[], string>({
      query: (mentorId) => `/api/mentors/${mentorId}/review-queue`,
      providesTags: ['ReviewQueue'],
    }),
  }),
});

export const {
  useGetTaskAssignmentQuery,
  useStartTaskAssignmentMutation,
  useSubmitTaskAssignmentMutation,
  useGetTaskAssignmentSubmissionsQuery,
  useGetSubmissionQuery,
  useUpdateSubmissionMutation,
  useDeleteSubmissionMutation,
  useApproveSubmissionMutation,
  useRequestRevisionMutation,
  useRejectSubmissionMutation,
  useAddFeedbackMutation,
  useGetSubmissionFeedbackQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetMentorReviewQueueQuery,
} = submissionApi;
