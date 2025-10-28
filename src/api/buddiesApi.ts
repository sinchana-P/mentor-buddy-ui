// Buddies API following your reference pattern
import { api } from './api';
import type {
  BuddyRO,
  CreateBuddyDTO,
  UpdateBuddyDTO,
  BuddiesQueryDTO,
  TaskRO,
} from './dto';

// Additional types specific to buddies
export interface BuddyTopicProgress {
  id: string;
  buddyId: string;
  topicId: string;
  checked: boolean;
  updatedAt: string;
}

// New buddy-specific topics types
export interface BuddyTopic {
  id: string;
  buddyId: string;
  topicName: string;
  category: string | null;
  checked: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface BuddyTopicsResponse {
  topics: BuddyTopic[];
  percentage: number;
}

export interface PortfolioItem {
  id: string;
  buddyId: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  createdAt: string;
}

// Buddies API endpoints
export const buddiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBuddies: build.query<BuddyRO[], BuddiesQueryDTO>({
      query: (params = {}) => {
        const queryString = new URLSearchParams();
        if (params.mentorId) queryString.append('mentorId', params.mentorId);
        if (params.domain) queryString.append('domain', params.domain);
        if (params.search) queryString.append('search', params.search);
        if (params.status) queryString.append('status', params.status);
        if (params.page) queryString.append('page', params.page.toString());
        if (params.limit) queryString.append('limit', params.limit.toString());
        
        return {
          url: '/api/buddies',
          params: queryString,
        };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Buddies' as const, id })), 'Buddies']
          : ['Buddies'],
    }),
    
    getBuddyById: build.query<BuddyRO, string>({
      query: (id) => `/api/buddies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Buddies', id }],
    }),
    
    getBuddyTasks: build.query<TaskRO[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/tasks`,
      providesTags: (result, error, buddyId) => [
        { type: 'Buddies', id: buddyId },
        'Tasks',
      ],
    }),
    
    getBuddyProgress: build.query<BuddyTopicProgress[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/progress`,
      providesTags: (result, error, buddyId) => [
        { type: 'Buddies', id: buddyId },
        'Progress',
      ],
    }),
    
    updateBuddyProgress: build.mutation<BuddyTopicProgress, { buddyId: string; topicId: string; checked: boolean }>({
      query: ({ buddyId, topicId, checked }) => ({
        url: `/api/buddies/${buddyId}/progress/${topicId}`,
        method: 'PATCH',
        body: { checked },
      }),
      invalidatesTags: (result, error, { buddyId }) => [
        { type: 'Buddies', id: buddyId },
        'Progress',
      ],
    }),
    
    getBuddyPortfolio: build.query<PortfolioItem[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/portfolio`,
      providesTags: (result, error, buddyId) => [
        { type: 'Buddies', id: buddyId },
        'Portfolio',
      ],
    }),
    
    createBuddy: build.mutation<BuddyRO, CreateBuddyDTO>({
      query: (buddyData) => ({
        url: '/api/buddies',
        method: 'POST',
        body: buddyData,
      }),
      invalidatesTags: ['Buddies', 'Mentors', 'DashboardStats', 'DashboardActivity', 'Users'],
    }),
    
    assignBuddyToMentor: build.mutation<BuddyRO, { buddyId: string; mentorId: string }>({
      query: ({ buddyId, mentorId }) => ({
        url: `/api/buddies/${buddyId}/assign`,
        method: 'PATCH',
        body: { mentorId },
      }),
      invalidatesTags: (result, error, { buddyId, mentorId }) => [
        { type: 'Buddies', id: buddyId },
        { type: 'Mentors', id: mentorId },
        'Buddies',
        'Mentors',
      ],
    }),
    
    updateBuddy: build.mutation<BuddyRO, { id: string; data: UpdateBuddyDTO }>({
      query: ({ id, data }) => ({
        url: `/api/buddies/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Buddies', id },
        'Buddies',
        'Mentors',
        'DashboardStats',
        'DashboardActivity',
        'Users',
        'Tasks',
      ],
    }),
    
    deleteBuddy: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/buddies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Buddies', id },
        'Buddies',
        'Mentors',
        'DashboardStats',
        'DashboardActivity',
        'Users',
        'Tasks',
      ],
    }),

    // New buddy-specific topics endpoints
    getBuddyTopics: build.query<BuddyTopicsResponse, string>({
      query: (buddyId) => `/api/buddies/${buddyId}/topics`,
      providesTags: (result, error, buddyId) => [
        { type: 'Buddies', id: buddyId },
        'BuddyTopics',
      ],
    }),

    updateBuddyTopic: build.mutation<BuddyTopic, { topicId: string; checked: boolean }>({
      query: ({ topicId, checked }) => ({
        url: `/api/buddy-topics/${topicId}`,
        method: 'PATCH',
        body: { checked },
      }),
      invalidatesTags: ['BuddyTopics', 'Buddies'],
    }),
  }),
});

export const {
  useGetBuddiesQuery,
  useLazyGetBuddiesQuery,
  useGetBuddyByIdQuery,
  useLazyGetBuddyByIdQuery,
  useGetBuddyTasksQuery,
  useLazyGetBuddyTasksQuery,
  useGetBuddyProgressQuery,
  useLazyGetBuddyProgressQuery,
  useUpdateBuddyProgressMutation,
  useGetBuddyPortfolioQuery,
  useLazyGetBuddyPortfolioQuery,
  useCreateBuddyMutation,
  useAssignBuddyToMentorMutation,
  useUpdateBuddyMutation,
  useDeleteBuddyMutation,
  // New buddy topics hooks
  useGetBuddyTopicsQuery,
  useLazyGetBuddyTopicsQuery,
  useUpdateBuddyTopicMutation,
} = buddiesApi;