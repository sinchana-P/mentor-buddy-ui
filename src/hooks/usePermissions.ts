import { useSelector } from 'react-redux';
import type { RootState } from '../store/index';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canEditBuddyField,
  canUpdateBuddyProgress,
  canEditTask,
  canUpdateTaskStatus,
  canManageOwnPortfolio,
  getDisabledBuddyFields,
  PERMISSIONS,
} from '../utils/permissions';

/**
 * Custom hook to access and check user permissions
 */
export function usePermissions() {
  const user = useSelector((state: RootState) => state.auth.user);
  const permissions = user?.permissions || [];
  const role = user?.role || '';
  const userId = user?.id || '';

  return {
    // User info
    user,
    permissions,
    role,
    userId,

    // Permission checkers
    hasPermission: (permission: string) => hasPermission(permissions, permission),
    hasAnyPermission: (perms: string[]) => hasAnyPermission(permissions, perms),
    hasAllPermissions: (perms: string[]) => hasAllPermissions(permissions, perms),

    // Buddy permissions
    canEditBuddyField: (buddyUserId: string, field: 'name' | 'email' | 'domainRole' | 'status' | 'assignedMentorId') =>
      canEditBuddyField(permissions, role, userId, buddyUserId, field),
    getDisabledBuddyFields: (buddyUserId: string) =>
      getDisabledBuddyFields(permissions, role, userId, buddyUserId),

    // Progress permissions
    canUpdateBuddyProgress: (buddyUserId: string, assignedMentorUserId?: string) =>
      canUpdateBuddyProgress(permissions, role, userId, buddyUserId, assignedMentorUserId),

    // Task permissions
    canEditTask: (taskCreatorUserId: string) => canEditTask(permissions, role, userId, taskCreatorUserId),
    canUpdateTaskStatus: (taskAssignedToUserId: string) =>
      canUpdateTaskStatus(permissions, role, userId, taskAssignedToUserId),

    // Portfolio permissions
    canManageOwnPortfolio: (action: 'create' | 'edit' | 'delete') =>
      canManageOwnPortfolio(permissions, action),

    // Common permission checks (convenience methods)
    canCreateMentor: hasPermission(permissions, PERMISSIONS.CAN_CREATE_MENTOR),
    canEditMentor: hasPermission(permissions, PERMISSIONS.CAN_EDIT_MENTOR),
    canDeleteMentor: hasPermission(permissions, PERMISSIONS.CAN_DELETE_MENTOR),
    canCreateBuddy: hasPermission(permissions, PERMISSIONS.CAN_CREATE_BUDDY),
    canDeleteBuddy: hasPermission(permissions, PERMISSIONS.CAN_DELETE_BUDDY),
    canCreateTask: hasPermission(permissions, PERMISSIONS.CAN_CREATE_TASK),
    canCreateResource: hasPermission(permissions, PERMISSIONS.CAN_CREATE_RESOURCE),
    canEditResource: hasPermission(permissions, PERMISSIONS.CAN_EDIT_RESOURCE),
    canDeleteResource: hasPermission(permissions, PERMISSIONS.CAN_DELETE_RESOURCE),
    canViewDashboard: hasPermission(permissions, PERMISSIONS.CAN_VIEW_DASHBOARD),
    canViewAnalytics: hasPermission(permissions, PERMISSIONS.CAN_VIEW_ANALYTICS),
    canExportData: hasPermission(permissions, PERMISSIONS.CAN_EXPORT_DATA),

    // Role checks (legacy support, prefer permission checks)
    isManager: role === 'manager',
    isMentor: role === 'mentor',
    isBuddy: role === 'buddy',
  };
}

/**
 * Hook to check if any of the specified permissions are granted
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check if all of the specified permissions are granted
 */
export function useHasAllPermissions(permissions: string[]): boolean {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(permissions);
}

/**
 * Hook to check a single permission
 */
export function useHasPermission(permission: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}
