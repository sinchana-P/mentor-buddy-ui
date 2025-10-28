// Mentors API following your reference pattern
import { api } from './api';
import type {
  MentorRO,
  CreateMentorDTO,
  UpdateMentorDTO,
  MentorsQueryDTO,
  BuddyRO,
} from './dto';

// Mentors API endpoints
export const mentorsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMentors: build.query<MentorRO[], MentorsQueryDTO>({
      query: (params = {}) => {
        const queryString = new URLSearchParams();
        if (params.domain) queryString.append('domain', params.domain);
        if (params.search) queryString.append('search', params.search);
        if (params.status) queryString.append('status', params.status);
        if (params.page) queryString.append('page', params.page.toString());
        if (params.limit) queryString.append('limit', params.limit.toString());
        
        return {
          url: '/api/mentors',
          params: queryString,
        };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Mentors' as const, id })), 'Mentors']
          : ['Mentors'],
    }),
    
    getMentorById: build.query<MentorRO, string>({
      query: (id) => `/api/mentors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Mentors', id }],
    }),
    
    getMentorBuddies: build.query<BuddyRO[], { mentorId: string; status?: string }>({
      query: ({ mentorId, status }) => {
        const queryString = new URLSearchParams();
        if (status) queryString.append('status', status);
        
        return {
          url: `/api/mentors/${mentorId}/buddies`,
          params: queryString,
        };
      },
      providesTags: (result, error, { mentorId }) => [
        { type: 'Mentors', id: mentorId },
        'Buddies',
      ],
    }),
    
    createMentor: build.mutation<MentorRO, CreateMentorDTO>({
      query: (mentorData) => ({
        url: '/api/mentors',
        method: 'POST',
        body: mentorData,
      }),
      invalidatesTags: ['Mentors', 'DashboardStats', 'DashboardActivity', 'Users'],
    }),
    
    updateMentor: build.mutation<MentorRO, { id: string; mentorData: UpdateMentorDTO }>({
      query: ({ id, mentorData }) => ({
        url: `/api/mentors/${id}`,
        method: 'PATCH',
        body: mentorData,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Mentors', id },
        'Mentors',
        'DashboardStats',
        'DashboardActivity',
        'Users',
        'Buddies',
      ],
    }),
    
    deleteMentor: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/mentors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Mentors', id },
        'Mentors',
        'DashboardStats',
        'DashboardActivity',
        'Users',
        'Buddies',
      ],
    }),
  }),
});

export const {
  useGetMentorsQuery,
  useLazyGetMentorsQuery,
  useGetMentorByIdQuery,
  useLazyGetMentorByIdQuery,
  useGetMentorBuddiesQuery,
  useLazyGetMentorBuddiesQuery,
  useCreateMentorMutation,
  useUpdateMentorMutation,
  useDeleteMentorMutation,
} = mentorsApi;