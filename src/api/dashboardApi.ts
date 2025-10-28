// Dashboard API following your reference pattern
import { api } from './api';
import type {
  DashboardStatsRO,
  ActivityItemRO,
} from './dto';

// Dashboard API endpoints
export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStatsRO, void>({
      query: () => '/api/dashboard/stats',
      providesTags: ['DashboardStats'],
    }),
    
    getDashboardActivity: build.query<ActivityItemRO[], void>({
      query: () => '/api/dashboard/activity',
      providesTags: ['DashboardActivity'],
    }),
    
    getHealthCheck: build.query<{ status: string; timestamp: string }, void>({
      query: () => '/api/health',
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useLazyGetDashboardStatsQuery,
  useGetDashboardActivityQuery,
  useLazyGetDashboardActivityQuery,
  useGetHealthCheckQuery,
  useLazyGetHealthCheckQuery,
} = dashboardApi;