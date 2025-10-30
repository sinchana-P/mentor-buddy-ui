/**
 * Permission constants - must match backend permissions exactly
 */
export const PERMISSIONS = {
  // Mentor Management
  CAN_CREATE_MENTOR: 'can_create_mentor',
  CAN_EDIT_MENTOR: 'can_edit_mentor',
  CAN_DELETE_MENTOR: 'can_delete_mentor',
  CAN_VIEW_MENTORS: 'can_view_mentors',

  // Buddy Management
  CAN_CREATE_BUDDY: 'can_create_buddy',
  CAN_EDIT_BUDDY_ALL: 'can_edit_buddy_all',
  CAN_EDIT_BUDDY_NAME: 'can_edit_buddy_name',
  CAN_EDIT_BUDDY_ROLE: 'can_edit_buddy_role',
  CAN_EDIT_BUDDY_STATUS: 'can_edit_buddy_status',
  CAN_EDIT_BUDDY_MENTOR: 'can_edit_buddy_mentor',
  CAN_DELETE_BUDDY: 'can_delete_buddy',
  CAN_VIEW_BUDDIES: 'can_view_buddies',
  CAN_VIEW_OWN_PROFILE: 'can_view_own_profile',

  // Task Management
  CAN_CREATE_TASK: 'can_create_task',
  CAN_EDIT_OWN_TASK: 'can_edit_own_task',
  CAN_EDIT_ANY_TASK: 'can_edit_any_task',
  CAN_DELETE_OWN_TASK: 'can_delete_own_task',
  CAN_DELETE_ANY_TASK: 'can_delete_any_task',
  CAN_UPDATE_TASK_STATUS: 'can_update_task_status',
  CAN_VIEW_TASKS: 'can_view_tasks',

  // Progress Management
  CAN_UPDATE_OWN_PROGRESS: 'can_update_own_progress',
  CAN_UPDATE_ASSIGNED_BUDDY_PROGRESS: 'can_update_assigned_buddy_progress',
  CAN_UPDATE_ANY_PROGRESS: 'can_update_any_progress',
  CAN_VIEW_PROGRESS: 'can_view_progress',

  // Portfolio Management
  CAN_CREATE_OWN_PORTFOLIO: 'can_create_own_portfolio',
  CAN_EDIT_OWN_PORTFOLIO: 'can_edit_own_portfolio',
  CAN_DELETE_OWN_PORTFOLIO: 'can_delete_own_portfolio',
  CAN_VIEW_PORTFOLIOS: 'can_view_portfolios',

  // Resource Management
  CAN_CREATE_RESOURCE: 'can_create_resource',
  CAN_EDIT_RESOURCE: 'can_edit_resource',
  CAN_DELETE_RESOURCE: 'can_delete_resource',
  CAN_VIEW_RESOURCES: 'can_view_resources',

  // Topic Management
  CAN_CREATE_TOPIC: 'can_create_topic',
  CAN_EDIT_TOPIC: 'can_edit_topic',
  CAN_DELETE_TOPIC: 'can_delete_topic',
  CAN_VIEW_TOPICS: 'can_view_topics',

  // Dashboard & Analytics
  CAN_VIEW_DASHBOARD: 'can_view_dashboard',
  CAN_VIEW_ANALYTICS: 'can_view_analytics',
  CAN_EXPORT_DATA: 'can_export_data',
} as const;

/**
 * Check if user has a specific permission
 */
export function hasPermission(userPermissions: string[] | undefined, permission: string): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(permission);
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(userPermissions: string[] | undefined, permissions: string[]): boolean {
  if (!userPermissions) return false;
  return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(userPermissions: string[] | undefined, permissions: string[]): boolean {
  if (!userPermissions) return false;
  return permissions.every(permission => userPermissions.includes(permission));
}

/**
 * Check if user can edit a specific buddy field
 */
export function canEditBuddyField(
  userPermissions: string[] | undefined,
  userRole: string,
  userId: string,
  buddyUserId: string,
  field: 'name' | 'email' | 'domainRole' | 'status' | 'assignedMentorId'
): boolean {
  if (!userPermissions) return false;

  // Manager can edit everything except email
  if (userRole === 'manager') {
    if (field === 'email') return false;
    return hasPermission(userPermissions, PERMISSIONS.CAN_EDIT_BUDDY_ALL);
  }

  // Mentor cannot edit any fields (only Manager can edit)
  if (userRole === 'mentor') {
    return false;
  }

  // Buddy can only edit their own name
  if (userRole === 'buddy' && userId === buddyUserId) {
    return field === 'name' && hasPermission(userPermissions, PERMISSIONS.CAN_EDIT_BUDDY_NAME);
  }

  return false;
}

/**
 * Check if user can update a buddy's progress
 */
/**
 * Check if user can update buddy progress
 * ONLY assigned mentor and the buddy themselves can edit progress
 */
export function canUpdateBuddyProgress(
  userPermissions: string[] | undefined,
  userRole: string,
  userId: string,
  buddyUserId: string,
  assignedMentorUserId?: string
): boolean {
  if (!userPermissions) return false;

  // Mentor can update progress ONLY of their assigned buddies
  if (userRole === 'mentor' && assignedMentorUserId === userId) {
    return hasPermission(userPermissions, PERMISSIONS.CAN_UPDATE_ASSIGNED_BUDDY_PROGRESS);
  }

  // Buddy can update their own progress
  if (userRole === 'buddy' && userId === buddyUserId) {
    return hasPermission(userPermissions, PERMISSIONS.CAN_UPDATE_OWN_PROGRESS);
  }

  // Managers and unassigned mentors CANNOT edit progress
  return false;
}

/**
 * Check if user can edit a task
 */
export function canEditTask(
  userPermissions: string[] | undefined,
  userRole: string,
  userId: string,
  taskCreatorUserId: string
): boolean {
  if (!userPermissions) return false;

  // Manager can edit any task
  if (hasPermission(userPermissions, PERMISSIONS.CAN_EDIT_ANY_TASK)) {
    return true;
  }

  // Mentor can edit only tasks they created
  if (userRole === 'mentor' && userId === taskCreatorUserId) {
    return hasPermission(userPermissions, PERMISSIONS.CAN_EDIT_OWN_TASK);
  }

  return false;
}

/**
 * Check if user can update task status (buddies can only update status, not full edit)
 */
export function canUpdateTaskStatus(
  userPermissions: string[] | undefined,
  userRole: string,
  userId: string,
  taskAssignedToUserId: string
): boolean {
  if (!userPermissions) return false;

  // Manager and mentor can always update status if they can edit
  if (userRole === 'manager' || userRole === 'mentor') {
    return hasAnyPermission(userPermissions, [
      PERMISSIONS.CAN_EDIT_ANY_TASK,
      PERMISSIONS.CAN_EDIT_OWN_TASK
    ]);
  }

  // Buddy can update status of their assigned tasks
  if (userRole === 'buddy' && userId === taskAssignedToUserId) {
    return hasPermission(userPermissions, PERMISSIONS.CAN_UPDATE_TASK_STATUS);
  }

  return false;
}

/**
 * Check if user can manage their own portfolio
 */
export function canManageOwnPortfolio(
  userPermissions: string[] | undefined,
  action: 'create' | 'edit' | 'delete'
): boolean {
  if (!userPermissions) return false;

  const permissionMap = {
    create: PERMISSIONS.CAN_CREATE_OWN_PORTFOLIO,
    edit: PERMISSIONS.CAN_EDIT_OWN_PORTFOLIO,
    delete: PERMISSIONS.CAN_DELETE_OWN_PORTFOLIO,
  };

  return hasPermission(userPermissions, permissionMap[action]);
}

/**
 * Get disabled fields for buddy form based on permissions
 */
export function getDisabledBuddyFields(
  userPermissions: string[] | undefined,
  userRole: string,
  userId: string,
  buddyUserId: string
): {
  name: boolean;
  email: boolean;
  domainRole: boolean;
  status: boolean;
  assignedMentorId: boolean;
} {
  return {
    name: !canEditBuddyField(userPermissions, userRole, userId, buddyUserId, 'name'),
    email: true, // Email is always disabled
    domainRole: !canEditBuddyField(userPermissions, userRole, userId, buddyUserId, 'domainRole'),
    status: !canEditBuddyField(userPermissions, userRole, userId, buddyUserId, 'status'),
    assignedMentorId: !canEditBuddyField(userPermissions, userRole, userId, buddyUserId, 'assignedMentorId'),
  };
}
