import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/constants';

// Create our baseQuery instance with auth handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  timeout: 15000, // 15 second timeout
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

// Wrapper to handle auth errors
const baseQuery = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle 401 responses (invalid/expired tokens)
  if (result.error && result.error.status === 401) {
    // Clear auth data and redirect to login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/auth';
  }
  
  return result;
};

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  domainRole: string;
  specialization: string;
  buddiesCount: number;
  status: string;
}

interface Buddy {
  id: string;
  name: string;
  email: string;
  mentorId: string;
  mentorName: string;
  domainRole: string;
  joinDate: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  buddyId: string;
  status: string;
  dueDate: string;
  priority: string;
}

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  tags: string[];
}

interface DashboardStats {
  totalBuddies: number;
  activeBuddies: number;
  totalMentors: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Health',
    'Users',
    'User',
    'Mentors',
    'Mentor',
    'Buddies',
    'Buddy',
    'Tasks',
    'Task',
    'Resources',
    'Resource',
    'DashboardStats',
    'DashboardActivity',
  ],
  keepUnusedDataFor: 30, // Keep data for 30 seconds instead of default 60
  refetchOnFocus: true, // Refetch when window regains focus
  refetchOnReconnect: true, // Refetch when network reconnects
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  endpoints: (builder) => ({
    // Health check
    getHealth: builder.query<{ status: string; timestamp: string }, void>({
      query: () => '/api/health',
      providesTags: ['Health'],
    }),

    // Users
    getUsers: builder.query<User[], void>({
      query: () => '/api/users',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'User' as const, id })), 'Users']
          : ['Users'],
    }),

    // Mentors
    getMentors: builder.query<Mentor[], void>({
      query: () => '/api/mentors',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Mentor' as const, id })), 'Mentors']
          : ['Mentors'],
    }),

    // Buddies
    getBuddies: builder.query<Buddy[], void>({
      query: () => '/api/buddies',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Buddy' as const, id })), 'Buddies']
          : ['Buddies'],
    }),

    // Tasks
    getTasks: builder.query<Task[], { buddyId?: string } | void>({
      query: (params) => {
        const queryString = params?.buddyId ? `?buddyId=${params.buddyId}` : '';
        return `/api/tasks${queryString}`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Task' as const, id })), 'Tasks']
          : ['Tasks'],
    }),

    // Resources
    getResources: builder.query<Resource[], void>({
      query: () => '/api/resources',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Resource' as const, id })), 'Resources']
          : ['Resources'],
    }),

    // Dashboard Stats
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/api/dashboard/stats',
      providesTags: ['DashboardStats'],
    }),

    // Dashboard Activity
    getDashboardActivity: builder.query<ActivityItem[], void>({
      query: () => '/api/dashboard/activity',
      providesTags: ['DashboardActivity'],
    }),

    // Mutations
    createBuddy: builder.mutation<Buddy, { name: string; email: string; domainRole: string }>({
      query: (buddy) => ({
        url: '/api/buddies',
        method: 'POST',
        body: buddy,
      }),
      invalidatesTags: ['Buddies', 'DashboardStats', 'DashboardActivity', 'Users'],
    }),

    createMentor: builder.mutation<Mentor, { name: string; email: string; domainRole: string; expertise?: string; experience?: string }>({
      query: (mentor) => ({
        url: '/api/mentors',
        method: 'POST',
        body: mentor,
      }),
      invalidatesTags: ['Mentors', 'DashboardStats', 'DashboardActivity', 'Users'],
    }),

    createTask: builder.mutation<Task, { title: string; description: string; mentorId: string; buddyId: string; status?: string }>({
      query: (task) => ({
        url: '/api/tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: ['Tasks', 'DashboardStats', 'DashboardActivity', 'Buddies', 'Mentors'],
    }),

    createResource: builder.mutation<Resource, { title: string; url: string; description: string; type: string; category: string; difficulty: string; duration: string; author: string; tags: string[] }>({
      query: (resource) => ({
        url: '/api/resources',
        method: 'POST',
        body: resource,
      }),
      invalidatesTags: ['Resources', 'DashboardActivity'],
    }),

    // Update mutations
    updateMentor: builder.mutation<Mentor, { id: string; data: Partial<{ name: string; email: string; domainRole: string; expertise: string; experience: string; bio: string; isActive: boolean }> }>({
      query: ({ id, data }) => ({
        url: `/api/mentors/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Mentor', id }, 
        'Mentors', 
        'DashboardStats', 
        'DashboardActivity',
        'Users'
      ],
    }),

    updateBuddy: builder.mutation<Buddy, { id: string; data: Partial<{ name: string; email: string; domainRole: string; status: string; assignedMentorId: string }> }>({
      query: ({ id, data }) => ({
        url: `/api/buddies/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Buddy', id }, 
        'Buddies', 
        'DashboardStats', 
        'DashboardActivity',
        'Users',
        'Mentors' // In case mentor assignment changed
      ],
    }),

    updateTask: builder.mutation<Task, { id: string; data: Partial<{ title: string; description: string; status: string; dueDate: string }> }>({
      query: ({ id, data }) => ({
        url: `/api/tasks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Task', id }, 
        'Tasks', 
        'DashboardStats',
        'DashboardActivity',
        'Buddies',
        'Mentors'
      ],
    }),

    updateResource: builder.mutation<Resource, { id: string; data: Partial<{ title: string; url: string; description: string; type: string; category: string; difficulty: string; duration: string; author: string; tags: string[] }> }>({
      query: ({ id, data }) => ({
        url: `/api/resources/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Resource', id }, 
        'Resources',
        'DashboardActivity'
      ],
    }),

    // Delete mutations
    deleteMentor: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/mentors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Mentor', id }, 
        'Mentors', 
        'DashboardStats',
        'DashboardActivity',
        'Users',
        'Buddies' // Buddies might be affected if mentor was assigned
      ],
    }),

    deleteBuddy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/buddies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Buddy', id }, 
        'Buddies', 
        'DashboardStats',
        'DashboardActivity',
        'Users',
        'Tasks' // Tasks assigned to this buddy
      ],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Task', id }, 
        'Tasks', 
        'DashboardStats',
        'DashboardActivity',
        'Buddies',
        'Mentors'
      ],
    }),

    deleteResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Resource', id }, 
        'Resources',
        'DashboardActivity'
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetHealthQuery,
  useGetUsersQuery,
  useGetMentorsQuery,
  useGetBuddiesQuery,
  useGetTasksQuery,
  useGetResourcesQuery,
  useGetDashboardStatsQuery,
  useGetDashboardActivityQuery,
  useCreateBuddyMutation,
  useCreateMentorMutation,
  useCreateTaskMutation,
  useCreateResourceMutation,
  useUpdateMentorMutation,
  useUpdateBuddyMutation,
  useUpdateTaskMutation,
  useUpdateResourceMutation,
  useDeleteMentorMutation,
  useDeleteBuddyMutation,
  useDeleteTaskMutation,
  useDeleteResourceMutation,
} = apiSlice;