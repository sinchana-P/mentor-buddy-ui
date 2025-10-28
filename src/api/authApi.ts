// Auth API following your reference pattern
import { api } from './api';
import type {
  UserRO,
  SignInDTO,
  SignUpDTO,
  AuthResponseRO,
  ChangePasswordDTO,
  UserProfileDTO,
} from './dto';

// Auth API endpoints
export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    signIn: build.mutation<AuthResponseRO, SignInDTO>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Users', 'DashboardStats', 'DashboardActivity'],
    }),
    
    signUp: build.mutation<AuthResponseRO, SignUpDTO>({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users', 'DashboardStats', 'DashboardActivity'],
    }),
    
    signOut: build.mutation<{ message: string }, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Users', 'Mentors', 'Buddies', 'Tasks', 'Resources'],
    }),
    
    getCurrentUser: build.query<UserRO, void>({
      query: () => '/api/auth/me',
      providesTags: ['Users'],
    }),
    
    updateProfile: build.mutation<UserRO, UserProfileDTO>({
      query: (profileData) => ({
        url: '/api/settings/profile',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['Users'],
    }),
    
    changePassword: build.mutation<{ message: string }, ChangePasswordDTO>({
      query: (passwordData) => ({
        url: '/api/auth/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),
    
    refreshToken: build.mutation<{ access_token: string; refresh_token: string }, { refresh_token: string }>({
      query: ({ refresh_token }) => ({
        url: '/api/auth/refresh',
        method: 'POST',
        body: { refresh_token },
      }),
    }),
    
    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: ({ email }) => ({
        url: '/api/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    
    resetPassword: build.mutation<{ message: string }, { token: string; password: string; confirmPassword: string }>({
      query: ({ token, password, confirmPassword }) => ({
        url: `/api/auth/reset-password/${token}`,
        method: 'POST',
        body: { password, confirmPassword },
      }),
    }),
    
    // Settings mutations
    updatePreferences: build.mutation<unknown, unknown>({
      query: (preferences) => ({
        url: '/api/settings/preferences',
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['Settings'],
    }),

    updatePrivacySettings: build.mutation<unknown, unknown>({
      query: (privacySettings) => ({
        url: '/api/settings/privacy',
        method: 'PATCH',
        body: privacySettings,
      }),
      invalidatesTags: ['Settings'],
    }),

    deleteAccount: build.mutation<void, void>({
      query: () => ({
        url: '/api/settings/account',
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Settings'],
    }),

    exportUserData: build.query<unknown, void>({
      query: () => '/api/settings/export',
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdatePreferencesMutation,
  useUpdatePrivacySettingsMutation,
  useDeleteAccountMutation,
  useExportUserDataQuery,
  useLazyExportUserDataQuery,
} = authApi;