// Users API following your reference pattern
import { api } from './api';
import type {
  UserRO,
} from './dto';

// Users API endpoints  
export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UserRO[], { role?: string; status?: string; search?: string }>({
      query: (params = {}) => {
        const queryString = new URLSearchParams();
        if (params.role) queryString.append('role', params.role);
        if (params.status) queryString.append('status', params.status);
        if (params.search) queryString.append('search', params.search);
        
        return {
          url: '/api/users',
          params: queryString,
        };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Users' as const, id })), 'Users']
          : ['Users'],
    }),
    
    getUserById: build.query<UserRO, string>({
      query: (id) => `/api/users/${id}`,
      providesTags: (_, __, id) => [{ type: 'Users', id }],
    }),
    
    createUser: build.mutation<UserRO, Partial<UserRO>>({
      query: (userData) => ({
        url: '/api/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users', 'DashboardStats', 'DashboardActivity'],
    }),
    
    updateUser: build.mutation<UserRO, { id: string; data: Partial<UserRO> }>({
      query: ({ id, data }) => ({
        url: `/api/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Users', id },
        'Users',
        'Mentors',
        'Buddies',
        'DashboardStats',
        'DashboardActivity',
      ],
    }),
    
    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Users', id },
        'Users',
        'Mentors',
        'Buddies',
        'Tasks',
        'DashboardStats',
        'DashboardActivity',
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;