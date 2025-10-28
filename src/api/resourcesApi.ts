// Resources API following your reference pattern
import { api } from './api';
import type {
  ResourceRO,
  CreateResourceDTO,
  UpdateResourceDTO,
  ResourcesQueryDTO,
} from './dto';

// Resources API endpoints
export const resourcesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getResources: build.query<ResourceRO[], ResourcesQueryDTO>({
      query: (params = {}) => {
        const queryString = new URLSearchParams();
        if (params.type) queryString.append('type', params.type);
        if (params.category) queryString.append('category', params.category);
        if (params.difficulty) queryString.append('difficulty', params.difficulty);
        if (params.search) queryString.append('search', params.search);
        if (params.tags?.length) queryString.append('tags', params.tags.join(','));
        if (params.page) queryString.append('page', params.page.toString());
        if (params.limit) queryString.append('limit', params.limit.toString());
        
        return {
          url: '/api/resources',
          params: queryString,
        };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Resources' as const, id })), 'Resources']
          : ['Resources'],
    }),
    
    getResourceById: build.query<ResourceRO, string>({
      query: (id) => `/api/resources/${id}`,
      providesTags: (_, __, id) => [{ type: 'Resources', id }],
    }),
    
    createResource: build.mutation<ResourceRO, CreateResourceDTO>({
      query: (resourceData) => ({
        url: '/api/resources',
        method: 'POST',
        body: resourceData,
      }),
      invalidatesTags: ['Resources', 'DashboardActivity'],
    }),
    
    updateResource: build.mutation<ResourceRO, { id: string; data: UpdateResourceDTO }>({
      query: ({ id, data }) => ({
        url: `/api/resources/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Resources', id },
        'Resources',
        'DashboardActivity',
      ],
    }),
    
    deleteResource: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Resources', id },
        'Resources',
        'DashboardActivity',
      ],
    }),
  }),
});

export const {
  useGetResourcesQuery,
  useLazyGetResourcesQuery,
  useGetResourceByIdQuery,
  useLazyGetResourceByIdQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} = resourcesApi;