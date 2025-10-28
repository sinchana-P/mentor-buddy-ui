import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  useSignInMutation, 
  useSignUpMutation, 
  useSignOutMutation,
  useGetCurrentUserQuery
} from '@/api/authApi';
import { setUser, setToken, logoutUser, setLoading, setError } from '@/store/auth/actions';
import type { DomainRole } from '@/types';

export function useAuth() {
  const dispatch = useAppDispatch();
  
  // Get auth state from Redux
  const { user, token, isAuthenticated, loading, error } = useAppSelector(state => state.auth);
  
  // RTK Query hooks
  const [signInMutation] = useSignInMutation();
  const [signUpMutation] = useSignUpMutation();
  const [signOutMutation] = useSignOutMutation();
  
  // Set loading to false on mount since initial state is loaded from localStorage
  useEffect(() => {
    dispatch(setLoading(false));
  }, [dispatch]);
  
  // Get current user query (for token validation) - only if we have a token from Redux
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token, // Skip if no token in Redux
  });
  
  // Sync current user data with Redux state
  useEffect(() => {
    if (currentUser && currentUser.id !== user?.id) {
      dispatch(setUser(currentUser));
    }
  }, [currentUser, user?.id, dispatch]);
  
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const result = await signInMutation({ email, password }).unwrap();

      // Dispatch actions - redux-persist will handle localStorage
      if (result.token) {
        dispatch(setToken(result.token));
      }

      dispatch(setUser(result.user));
      return {};
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Login failed';
      dispatch(setError(errorMessage));
      return { error: errorMessage };
    }
  }, [dispatch, signInMutation]);
  
  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: 'manager' | 'mentor' | 'buddy',
    domainRole: DomainRole
  ) => {
    try {
      dispatch(setLoading(true));
      const result = await signUpMutation({
        email,
        password,
        name,
        role,
        domainRole
      }).unwrap();

      // Dispatch actions - redux-persist will handle localStorage
      if (result.token) {
        dispatch(setToken(result.token));
      }

      dispatch(setUser(result.user));
      return {};
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Registration failed';
      dispatch(setError(errorMessage));
      return { error: errorMessage };
    }
  }, [dispatch, signUpMutation]);
  
  const signOut = useCallback(async () => {
    try {
      await signOutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear Redux state - redux-persist will handle localStorage
      dispatch(logoutUser());
    }
  }, [dispatch, signOutMutation]);
  
  const updateUserRole = useCallback(async (role: 'manager' | 'mentor' | 'buddy', domainRole?: DomainRole) => {
    // TODO: Implement role update API endpoint for role: ${role} and domainRole: ${domainRole}
    console.log('TODO: Update user role', { role, domainRole });
    return { error: 'Not implemented yet' };
  }, []);
  
  return {
    user,
    token,
    isAuthenticated,
    loading: loading || userLoading,
    error,
    signIn,
    signUp,
    signOut,
    updateUserRole,
  };
}

