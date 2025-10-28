// Tasks API following your reference pattern
import { api } from './api';
import type {
  TaskRO,
  CreateTaskDTO,
  UpdateTaskDTO,
  TasksQueryDTO,
} from './dto';

// Additional types specific to tasks
export interface Submission {
  id: string;
  taskId: string;
  buddyId: string;
  mentorId: string;
  githubUrl?: string;
  deploymentUrl?: string;
  description?: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  feedback?: string;
}

export interface CreateSubmissionDTO {
  taskId: string;
  githubUrl?: string;
  deploymentUrl?: string;
  description?: string;
}

// Tasks API endpoints
export const tasksApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<TaskRO[], TasksQueryDTO>({
      query: (params = {}) => {
        const queryString = new URLSearchParams();
        if (params.buddyId) queryString.append('buddyId', params.buddyId);
        if (params.mentorId) queryString.append('mentorId', params.mentorId);
        if (params.status) queryString.append('status', params.status);
        if (params.priority) queryString.append('priority', params.priority);
        if (params.search) queryString.append('search', params.search);
        if (params.page) queryString.append('page', params.page.toString());
        if (params.limit) queryString.append('limit', params.limit.toString());
        
        return {
          url: '/api/tasks',
          params: queryString,
        };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Tasks' as const, id })), 'Tasks']
          : ['Tasks'],
    }),
    
    getTaskById: build.query<TaskRO, string>({
      query: (id) => `/api/tasks/${id}`,
      providesTags: (_, __, id) => [{ type: 'Tasks', id }],
    }),
    
    createTask: build.mutation<TaskRO, CreateTaskDTO>({
      query: (taskData) => ({
        url: '/api/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Tasks', 'Buddies', 'Mentors', 'DashboardStats', 'DashboardActivity'],
    }),
    
    updateTask: build.mutation<TaskRO, { id: string; data: UpdateTaskDTO }>({
      query: ({ id, data }) => ({
        url: `/api/tasks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Tasks', id },
        'Tasks',
        'Buddies',
        'Mentors',
        'DashboardStats',
        'DashboardActivity',
      ],
    }),
    
    deleteTask: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Tasks', id },
        'Tasks',
        'Buddies',
        'Mentors',
        'DashboardStats',
        'DashboardActivity',
      ],
    }),
    
    createSubmission: build.mutation<Submission, CreateSubmissionDTO>({
      query: (submissionData) => ({
        url: '/api/submissions',
        method: 'POST',
        body: submissionData,
      }),
      invalidatesTags: (result) => [
        { type: 'Tasks', id: result?.taskId },
        'Tasks',
        'Submissions',
        'Buddies',
        'DashboardStats',
        'DashboardActivity',
      ],
    }),
    
    getSubmissionsByTask: build.query<Submission[], string>({
      query: (taskId) => `/api/tasks/${taskId}/submissions`,
      providesTags: (_, __, taskId) => [
        { type: 'Tasks', id: taskId },
        'Submissions',
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useLazyGetTasksQuery,
  useGetTaskByIdQuery,
  useLazyGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCreateSubmissionMutation,
  useGetSubmissionsByTaskQuery,
  useLazyGetSubmissionsByTaskQuery,
} = tasksApi;