import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, RootDispatch } from '../store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<RootDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Note: Following your pattern, prefer direct useSelector in components:
// const mentors = useSelector((state: RootState) => state.mentors.mentors);
// const loading = useSelector((state: RootState) => state.mentors.loading);
//
// These convenience hooks are provided for legacy compatibility,
// but direct useSelector is preferred for consistency with your codebase.

// Convenience hooks for auth (use sparingly - prefer direct useSelector)
export const useAuthState = () => useAppSelector(state => state.auth);
export const useUser = () => useAppSelector(state => state.auth.user);
export const useIsAuthenticated = () => useAppSelector(state => state.auth.isAuthenticated);

// Convenience hooks for mentors (use sparingly - prefer direct useSelector)
export const useMentors = () => useAppSelector(state => state.mentors);
export const useMentorsList = () => useAppSelector(state => state.mentors.mentors);
export const useSelectedMentor = () => useAppSelector(state => state.mentors.selectedMentor);

// Convenience hooks for buddies (use sparingly - prefer direct useSelector)
export const useBuddies = () => useAppSelector(state => state.buddies);
export const useBuddiesList = () => useAppSelector(state => state.buddies.buddies);
export const useSelectedBuddy = () => useAppSelector(state => state.buddies.selectedBuddy);

// Convenience hooks for tasks (use sparingly - prefer direct useSelector)
export const useTasks = () => useAppSelector(state => state.tasks);
export const useTasksList = () => useAppSelector(state => state.tasks.tasks);
export const useSelectedTask = () => useAppSelector(state => state.tasks.selectedTask);

// Convenience hooks for resources (use sparingly - prefer direct useSelector)
export const useResources = () => useAppSelector(state => state.resources);
export const useResourcesList = () => useAppSelector(state => state.resources.resources);
export const useSelectedResource = () => useAppSelector(state => state.resources.selectedResource);