# Permission Management System - Implementation Guide

## Overview

The Mentor Buddy application implements a comprehensive role-based permission management system that controls access to features and data based on user roles (Manager, Mentor, Buddy).

## How It Works

### 1. Permission Assignment During Signup/Login

When a user signs up or logs in, permissions are automatically assigned based on their role:

- **Registration** (`POST /api/auth/register`): Permissions assigned immediately upon account creation
- **Login** (`POST /api/auth/login`): Permissions retrieved and included in response
- **JWT Token**: Permissions embedded in the authentication token for server-side validation

### 2. Role-Based Permission Sets

#### Manager (31 permissions)
Full administrative access including:
- Create/edit/delete mentors and buddies
- Full access to all tasks, progress, and resources
- Dashboard and analytics access
- Data export capabilities

#### Mentor (16 permissions)
Limited management access:
- **Buddy Management**: Can only edit buddy's domain role (other fields disabled)
- **Tasks**: Create tasks, edit/delete only tasks they created
- **Progress**: Update progress only for assigned buddies
- View access to mentors, buddies, resources, topics
- Dashboard and analytics access

#### Buddy (13 permissions)
Minimal self-service access:
- **Profile**: Edit only their own name
- **Tasks**: Update only task status (not full edit)
- **Progress**: Update only their own progress
- **Portfolio**: Create, edit, and delete their own portfolio items
- View access to tasks, resources, topics, dashboard

## Backend Implementation

### Permission Configuration

**File**: [`mentor-buddy-backend/src/config/permissions.ts`](mentor-buddy-backend/src/config/permissions.ts)

```typescript
export const PERMISSIONS = {
  // Buddy Management
  CAN_CREATE_BUDDY: 'can_create_buddy',
  CAN_EDIT_BUDDY_ALL: 'can_edit_buddy_all',
  CAN_EDIT_BUDDY_NAME: 'can_edit_buddy_name',
  CAN_EDIT_BUDDY_ROLE: 'can_edit_buddy_role',
  // ... more permissions
};

export const ROLE_PERMISSIONS = {
  manager: [/* all permissions */],
  mentor: [/* limited permissions */],
  buddy: [/* minimal permissions */],
};
```

### Helper Functions

```typescript
// Check if user has permission
hasPermission(role: string, permission: string): boolean

// Check if user can edit specific buddy field
canEditBuddyField(userRole, userId, buddyUserId, field): boolean

// Check if user can update buddy's progress
canUpdateBuddyProgress(userRole, userId, buddyId, assignedMentorId): boolean

// Check if user can edit a task
canEditTask(userRole, userId, taskMentorId): boolean
```

### Middleware

**File**: [`mentor-buddy-backend/src/middleware/permissions.ts`](mentor-buddy-backend/src/middleware/permissions.ts)

```typescript
// Generic permission middleware
requirePermission(permission: string)

// Specific permission middleware
canCreateMentor
canCreateBuddy
canCreateTask
// ... more
```

### Controller Integration

**Example**: Buddy Controller ([`buddyController.ts`](mentor-buddy-backend/src/controllers/buddyController.ts))

```typescript
export const updateBuddy = async (req: AuthRequest, res: Response) => {
  // Field-level permission checks
  if (name !== undefined) {
    if (!canEditBuddyField(req.user.role, req.user.userId, currentBuddy.user.id, 'name')) {
      return res.status(403).json(permissionDeniedResponse('You do not have permission to edit buddy name'));
    }
    userUpdates.name = name;
  }

  if (domainRole !== undefined) {
    if (!canEditBuddyField(req.user.role, req.user.userId, currentBuddy.user.id, 'domainRole')) {
      return res.status(403).json(permissionDeniedResponse('You do not have permission to edit buddy domain role'));
    }
    userUpdates.domainRole = domainRole;
  }
  // ... similar checks for other fields
};
```

### JWT Token Structure

```typescript
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "mentor",
  "domainRole": "frontend",
  "permissions": [
    "can_view_mentors",
    "can_edit_buddy_role",
    "can_create_task",
    // ... more permissions
  ],
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Frontend Implementation

### Permission Utilities

**File**: [`mentor-buddy-ui/src/utils/permissions.ts`](mentor-buddy-ui/src/utils/permissions.ts)

```typescript
// Permission constants (must match backend exactly)
export const PERMISSIONS = {
  CAN_CREATE_MENTOR: 'can_create_mentor',
  CAN_EDIT_BUDDY_ROLE: 'can_edit_buddy_role',
  // ... more permissions
};

// Helper functions
hasPermission(userPermissions, permission): boolean
hasAnyPermission(userPermissions, permissions): boolean
hasAllPermissions(userPermissions, permissions): boolean
canEditBuddyField(permissions, role, userId, buddyUserId, field): boolean
// ... more helpers
```

### Custom React Hooks

**File**: [`mentor-buddy-ui/src/hooks/usePermissions.ts`](mentor-buddy-ui/src/hooks/usePermissions.ts)

```typescript
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const {
    permissions,
    role,
    hasPermission,
    canCreateMentor,
    canEditBuddyField,
    getDisabledBuddyFields,
  } = usePermissions();

  // Use in component logic
  if (!canCreateMentor) {
    return <div>Access denied</div>;
  }

  return <CreateMentorForm />;
}
```

### Usage Examples

#### Example 1: Conditionally Show/Hide Buttons

```typescript
import { usePermissions, PERMISSIONS } from '../hooks/usePermissions';

function BuddyList() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission(PERMISSIONS.CAN_CREATE_BUDDY) && (
        <Button onClick={createBuddy}>Create Buddy</Button>
      )}

      {hasPermission(PERMISSIONS.CAN_DELETE_BUDDY) && (
        <Button onClick={deleteBuddy}>Delete Buddy</Button>
      )}
    </div>
  );
}
```

#### Example 2: Disable Form Fields Based on Permissions

```typescript
import { usePermissions } from '../hooks/usePermissions';

function BuddyEditForm({ buddy }) {
  const { getDisabledBuddyFields, userId } = usePermissions();
  const disabledFields = getDisabledBuddyFields(buddy.userId);

  return (
    <form>
      <input
        name="name"
        disabled={disabledFields.name}
      />
      <input
        name="email"
        disabled={disabledFields.email} // Always disabled
      />
      <select
        name="domainRole"
        disabled={disabledFields.domainRole}
      />
      <select
        name="status"
        disabled={disabledFields.status}
      />
    </form>
  );
}
```

#### Example 3: Task Edit Permission

```typescript
import { usePermissions } from '../hooks/usePermissions';

function TaskCard({ task }) {
  const { canEditTask, canUpdateTaskStatus, userId, role } = usePermissions();

  const canEdit = canEditTask(task.mentorUserId);
  const canUpdateStatus = canUpdateTaskStatus(task.assignedToUserId);

  return (
    <div>
      <h3>{task.title}</h3>

      {/* Mentor can edit full task if they created it */}
      {canEdit && (
        <Button onClick={editTask}>Edit Task</Button>
      )}

      {/* Buddy can only update status */}
      {canUpdateStatus && !canEdit && (
        <select onChange={updateStatus}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      )}
    </div>
  );
}
```

#### Example 4: Progress Update Permission

```typescript
import { usePermissions } from '../hooks/usePermissions';

function ProgressTracker({ buddy }) {
  const { canUpdateBuddyProgress } = usePermissions();

  const canUpdate = canUpdateBuddyProgress(
    buddy.userId,
    buddy.assignedMentorUserId
  );

  return (
    <div>
      {buddy.topics.map(topic => (
        <Checkbox
          key={topic.id}
          checked={topic.checked}
          disabled={!canUpdate}
          onChange={() => updateProgress(topic.id)}
        />
      ))}
    </div>
  );
}
```

## Permission List by Role

### Manager Permissions (31 total)
```
Mentor Management:
- can_create_mentor
- can_edit_mentor
- can_delete_mentor
- can_view_mentors

Buddy Management:
- can_create_buddy
- can_edit_buddy_all
- can_edit_buddy_name
- can_edit_buddy_role
- can_edit_buddy_status
- can_edit_buddy_mentor
- can_delete_buddy
- can_view_buddies
- can_view_own_profile

Task Management:
- can_create_task
- can_edit_any_task
- can_delete_any_task
- can_update_task_status
- can_view_tasks

Progress Management:
- can_update_any_progress
- can_view_progress

Portfolio Management:
- can_view_portfolios

Resource Management:
- can_create_resource
- can_edit_resource
- can_delete_resource
- can_view_resources

Topic Management:
- can_create_topic
- can_edit_topic
- can_delete_topic
- can_view_topics

Dashboard & Analytics:
- can_view_dashboard
- can_view_analytics
- can_export_data
```

### Mentor Permissions (16 total)
```
Buddy Management:
- can_edit_buddy_role (ONLY domain role field)
- can_view_buddies
- can_view_mentors

Task Management:
- can_create_task
- can_edit_own_task (ONLY tasks they created)
- can_delete_own_task (ONLY tasks they created)
- can_view_tasks

Progress Management:
- can_update_assigned_buddy_progress (ONLY assigned buddies)
- can_view_progress

Portfolio Management:
- can_view_portfolios

Resource Management:
- can_create_resource
- can_edit_resource
- can_view_resources

Topic Management:
- can_view_topics

Dashboard & Analytics:
- can_view_dashboard
- can_view_analytics
```

### Buddy Permissions (13 total)
```
Buddy Management:
- can_view_own_profile
- can_edit_buddy_name (ONLY their own name)

Task Management:
- can_update_task_status (ONLY status field)
- can_view_tasks

Progress Management:
- can_update_own_progress (ONLY their own progress)
- can_view_progress

Portfolio Management:
- can_create_own_portfolio
- can_edit_own_portfolio
- can_delete_own_portfolio
- can_view_portfolios

Resource Management:
- can_view_resources

Topic Management:
- can_view_topics

Dashboard & Analytics:
- can_view_dashboard
```

## Testing Permissions

### Test Registration with Different Roles

```bash
# Test Mentor Registration
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test-mentor@example.com",
    "password": "TestPassword123@",
    "name": "Test Mentor",
    "role": "mentor",
    "domainRole": "frontend"
  }'

# Expected Response:
{
  "message": "Registration successful",
  "token": "...",
  "user": {
    "id": "...",
    "email": "test-mentor@example.com",
    "name": "Test Mentor",
    "role": "mentor",
    "domainRole": "frontend",
    "permissions": [
      "can_view_mentors",
      "can_edit_buddy_role",
      "can_view_buddies",
      // ... 16 permissions total
    ]
  }
}
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test-mentor@example.com",
    "password": "TestPassword123@"
  }'

# Expected: Same response structure with permissions included
```

## API Endpoints with Permission Checks

### Protected Buddy Endpoints

```
PUT /api/buddies/:id
- Checks field-level permissions
- Manager: Can edit name, domainRole, status, assignedMentorId
- Mentor: Can ONLY edit domainRole
- Buddy: Can ONLY edit their own name

PATCH /api/buddies/:id/progress/:topicId
- Manager: Can update any buddy's progress
- Mentor: Can update ONLY assigned buddies' progress
- Buddy: Can update ONLY their own progress

PATCH /api/buddy-topics/:topicId
- Same as progress update above
```

### Protected Task Endpoints

```
PUT /api/tasks/:id
- Manager: Can edit any task
- Mentor: Can edit ONLY tasks they created
- Buddy: Cannot edit tasks (can only update status)

PATCH /api/tasks/:id/status
- Manager/Mentor: Can update any task status
- Buddy: Can update ONLY tasks assigned to them
```

### Protected Portfolio Endpoints

```
POST /api/portfolio
- Buddy: Can create their own portfolio items
- Manager/Mentor: View only (future enhancement)

PUT /api/portfolio/:id
DELETE /api/portfolio/:id
- Buddy: Can edit/delete ONLY their own portfolio items
```

## Error Responses

When a user attempts an action without permission:

```json
{
  "message": "Permission denied",
  "reason": "You do not have permission to edit buddy domain role"
}
```

HTTP Status: `403 Forbidden`

## Best Practices

1. **Always check permissions on backend**: Never rely solely on frontend permission checks
2. **Use granular permissions**: Check specific permissions (e.g., `can_edit_buddy_role`) instead of role checks
3. **Provide clear error messages**: Tell users exactly what permission is missing
4. **Log permission denials**: Track unauthorized access attempts for security
5. **Keep frontend and backend permissions in sync**: Update both `PERMISSIONS` constants when adding new permissions

## Adding New Permissions

### Step 1: Add to Backend Config
```typescript
// mentor-buddy-backend/src/config/permissions.ts
export const PERMISSIONS = {
  // ... existing permissions
  CAN_NEW_FEATURE: 'can_new_feature',
};

export const ROLE_PERMISSIONS = {
  manager: [
    // ... existing permissions
    PERMISSIONS.CAN_NEW_FEATURE,
  ],
  // ... other roles
};
```

### Step 2: Add to Frontend Utils
```typescript
// mentor-buddy-ui/src/utils/permissions.ts
export const PERMISSIONS = {
  // ... existing permissions
  CAN_NEW_FEATURE: 'can_new_feature',
} as const;
```

### Step 3: Use in Components
```typescript
const { hasPermission } = usePermissions();

if (hasPermission(PERMISSIONS.CAN_NEW_FEATURE)) {
  // Show feature
}
```

## Summary

The permission management system provides:
- ✅ Automatic permission assignment during signup based on role
- ✅ Permissions included in JWT tokens for server-side validation
- ✅ Granular field-level and action-level permission checks
- ✅ Backend middleware for route protection
- ✅ Frontend utilities and hooks for UI conditional rendering
- ✅ Clear error messages when permissions are denied
- ✅ Type-safe permission constants on both frontend and backend
- ✅ Extensive helper functions for common permission scenarios

The system is fully functional and ready for use in production!
