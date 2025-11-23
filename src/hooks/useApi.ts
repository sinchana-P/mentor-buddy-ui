// Re-export RTK Query hooks for backward compatibility
// This allows existing components to continue using the same hook names
export {
  useGetHealthCheckQuery as useHealth,
  useGetUsersQuery as useUsers,
  useGetMentorsQuery as useMentors,
  useGetBuddiesQuery as useBuddies,
  useGetResourcesQuery as useResources,
  useGetDashboardStatsQuery as useDashboardStats,
  useGetDashboardActivityQuery as useDashboardActivity,
} from '../api/apiSlice';