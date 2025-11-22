# Curriculum Management System

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Permission Model](#permission-model)
- [Buddy Creation Flow](#buddy-creation-flow)
- [API Endpoints](#api-endpoints)
- [UI Components](#ui-components)
- [Features](#features)
- [Implementation Plan](#implementation-plan)

---

## Overview

### System Concept

A **week-based curriculum management system** where:
- **Managers & Mentors** create and manage reusable curriculum templates
- **Buddies** are automatically assigned tasks when they join based on their domain role
- Progress is tracked automatically per week (e.g., 3/4 tasks = 75% for Week 3)
- All tasks are visible from day 1 (no locking - buddies can work ahead)
- Mentors review submissions and provide feedback through conversation threads

### Key Innovation

**Template → Auto-Assignment Model**

```
1. Manager/Mentor creates "Frontend Program" template
   └─ 10 weeks × 3-4 tasks per week = 30+ tasks

2. Buddy joins with role "Frontend"
   └─ Automatically assigned ALL 30+ tasks from template
   └─ Auto-assigned frontend-specific topics

3. Buddy works through curriculum
   └─ Week 1: 3/3 tasks = 100% ✅
   └─ Week 2: 2/3 tasks = 66% 🔄
   └─ Week 3-10: 0% (visible but not started)

4. Mentor just reviews submissions
   └─ No manual task assignment needed!
```

---

## Architecture

### 3-Tier System

```
┌─────────────────────────────────────────────────────┐
│ 👔 MANAGER & 👨‍🏫 MENTOR (Admin - Full Control)       │
│ ├─ ✅ Create/Edit/Delete Curriculums                │
│ ├─ ✅ Manage Weeks & Task Templates                 │
│ ├─ ✅ Publish/Unpublish Curriculums                 │
│ ├─ ✅ Review Submissions & Give Feedback            │
│ ├─ ✅ View All Analytics                            │
│ └─ ✅ Manage Topics                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 👤 BUDDY (Consumer - View & Submit Only)            │
│ ├─ ✅ View Assigned Tasks (READ ONLY)               │
│ ├─ ✅ Submit Work (URLs, files, resources)          │
│ ├─ ✅ Track Own Progress                            │
│ ├─ ✅ Reply to Feedback                             │
│ └─ ❌ Cannot: Create/Edit/Delete templates          │
└─────────────────────────────────────────────────────┘
```

### Curriculum Structure

```
Curriculum (Frontend Developer Program)
  │
  ├─ Week 1: HTML, CSS, JS Basics
  │   ├─ Task 1: Build Landing Page
  │   ├─ Task 2: CSS Flexbox Layout
  │   └─ Task 3: JavaScript Calculator
  │
  ├─ Week 2: Advanced JavaScript
  │   ├─ Task 1: Array Methods
  │   ├─ Task 2: Async/Promises
  │   └─ Task 3: Fetch API Project
  │
  ├─ Week 3: React Fundamentals
  │   ├─ Task 1: React Components
  │   ├─ Task 2: Props & State
  │   ├─ Task 3: Event Handling
  │   └─ Task 4: Build Todo App
  │
  ... continues to Week 10
```

---

## Database Schema

### Core Tables

#### 1. **curriculums** (One per domain role)

```typescript
{
  id: uuid,
  name: text,                    // "Frontend Developer Program"
  description: text,
  slug: text,                    // "frontend-10week-2025"

  domainRole: enum,              // "frontend" | "backend" | "fullstack" | "devops" | "qa" | "hr"
  totalWeeks: integer,           // 10

  status: enum,                  // "draft" | "published" | "archived"
  publishedAt: timestamp,
  version: text,                 // "1.0"

  createdBy: uuid,               // Manager/Mentor who created
  lastModifiedBy: uuid,

  tags: jsonb<string[]>,
  isActive: boolean,

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 2. **curriculum_weeks** (Week definitions)

```typescript
{
  id: uuid,
  curriculumId: uuid,            // Foreign key to curriculums

  weekNumber: integer,           // 1, 2, 3...
  title: text,                   // "HTML, CSS, JS Basics"
  description: text,

  learningObjectives: jsonb<string[]>,  // ["Understand HTML5", "Master CSS Grid"]

  resources: jsonb<{             // Week learning materials
    title: string,
    url: string,
    type: string,
    duration?: string
  }[]>,

  displayOrder: integer,

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. **task_templates** (Reusable task definitions)

```typescript
{
  id: uuid,
  curriculumWeekId: uuid,        // Which week does this belong to

  title: text,                   // "Build Landing Page"
  description: text,             // Full task description (Markdown supported)
  requirements: text,            // What must be included

  difficulty: enum,              // "easy" | "medium" | "hard"
  estimatedHours: integer,       // 6

  expectedResourceTypes: jsonb<{ // What buddy should submit
    type: string,                // "github", "hosted_url", "pdf", etc.
    label: string,               // "GitHub Repository"
    required: boolean
  }[]>,

  resources: jsonb<{             // Task learning materials
    title: string,
    url: string,
    type: string
  }[]>,

  displayOrder: integer,

  createdBy: uuid,
  lastModifiedBy: uuid,
  isActive: boolean,

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 4. **buddy_curriculums** (Auto-created when buddy joins)

```typescript
{
  id: uuid,
  buddyId: uuid,
  curriculumId: uuid,

  startedAt: timestamp,
  targetCompletionDate: timestamp,
  completedAt: timestamp,

  currentWeek: integer,          // Recommended week buddy should be on
  overallProgress: integer,      // 0-100% (calculated from completed tasks)

  status: enum,                  // "active" | "paused" | "completed" | "dropped"

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 5. **buddy_week_progress** (Track progress per week)

```typescript
{
  id: uuid,
  buddyCurriculumId: uuid,
  curriculumWeekId: uuid,

  weekNumber: integer,

  totalTasks: integer,           // 4
  completedTasks: integer,       // 2
  progressPercentage: integer,   // 50% (auto-calculated: 2/4 * 100)

  startedAt: timestamp,          // When buddy started any task in this week
  completedAt: timestamp,        // When all tasks completed

  status: enum,                  // "not_started" | "in_progress" | "completed"

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 6. **task_assignments** (Individual buddy task tracking)

```typescript
{
  id: uuid,
  buddyId: uuid,
  taskTemplateId: uuid,
  buddyCurriculumId: uuid,
  buddyWeekProgressId: uuid,

  assignedAt: timestamp,
  dueDate: timestamp,

  status: enum,                  // "not_started" | "in_progress" | "submitted"
                                 // | "under_review" | "needs_revision" | "completed"

  startedAt: timestamp,
  firstSubmissionAt: timestamp,
  completedAt: timestamp,

  submissionCount: integer,      // How many times submitted

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 7. **submissions** (Multiple versions per assignment)

```typescript
{
  id: uuid,
  taskAssignmentId: uuid,
  buddyId: uuid,

  version: integer,              // 1, 2, 3... (revision tracking)

  description: text,             // Buddy's explanation
  notes: text,                   // Optional notes

  reviewStatus: enum,            // "pending" | "under_review" | "approved"
                                 // | "needs_revision" | "rejected"

  reviewedBy: uuid,              // Mentor who reviewed
  reviewedAt: timestamp,
  grade: text,                   // Optional: "Pass", "A", "85%"

  submittedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 8. **submission_resources** (Multiple URLs/files per submission)

```typescript
{
  id: uuid,
  submissionId: uuid,

  type: text,                    // Free-form: "github", "hosted_url", "pdf",
                                 // "postman_collection", "docker_hub", etc.
  label: text,                   // "Source Code", "Live Website"
  url: text,                     // The actual link

  filename: text,                // For uploaded files
  filesize: integer,             // In bytes

  displayOrder: integer,

  createdAt: timestamp
}
```

**Example: Buddy submits with multiple resources**
```json
{
  "description": "Built a portfolio website with React",
  "resources": [
    { "type": "github", "label": "Source Code", "url": "https://github.com/user/portfolio" },
    { "type": "hosted_url", "label": "Live Site", "url": "https://mysite.vercel.app" },
    { "type": "hosted_url", "label": "Storybook", "url": "https://storybook.mysite.app" },
    { "type": "pdf", "label": "Documentation", "url": "...", "filename": "docs.pdf", "filesize": 1024000 }
  ]
}
```

#### 9. **submission_feedback** (Conversation thread)

```typescript
{
  id: uuid,
  submissionId: uuid,

  authorId: uuid,                // User who wrote this
  authorRole: enum,              // "mentor" | "buddy" | "manager"

  message: text,                 // The feedback/reply
  feedbackType: enum,            // "comment" | "question" | "approval"
                                 // | "revision_request" | "reply"

  parentFeedbackId: uuid,        // For threaded replies (optional)

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 10. **topics** (Domain-specific skills)

```typescript
{
  id: uuid,
  name: text,                    // "React Hooks"
  category: text,                // "Frontend Frameworks"
  domainRole: enum,              // "frontend" | "backend" | etc.
  description: text,
  displayOrder: integer,

  createdAt: timestamp
}
```

#### 11. **buddy_topics** (Track buddy's topic progress)

```typescript
{
  id: uuid,
  buddyId: uuid,
  topicId: uuid,

  checked: boolean,              // Has buddy mastered this?
  completedAt: timestamp,

  createdAt: timestamp
}
```

---

## Permission Model

### Simple 2-Tier Access Control

| Action | Manager | Mentor | Buddy |
|--------|---------|--------|-------|
| **Curriculums** ||||
| Create curriculum | ✅ | ✅ | ❌ |
| Edit curriculum | ✅ | ✅ | ❌ |
| Delete curriculum | ✅ | ✅ | ❌ |
| Publish/Unpublish | ✅ | ✅ | ❌ |
| View curriculum | ✅ | ✅ | ✅ (assigned only) |
| **Weeks** ||||
| Create week | ✅ | ✅ | ❌ |
| Edit week | ✅ | ✅ | ❌ |
| Delete week | ✅ | ✅ | ❌ |
| Reorder weeks | ✅ | ✅ | ❌ |
| View weeks | ✅ | ✅ | ✅ (assigned only) |
| **Task Templates** ||||
| Create task | ✅ | ✅ | ❌ |
| Edit task | ✅ | ✅ | ❌ |
| Delete task | ✅ | ✅ | ❌ |
| Duplicate task | ✅ | ✅ | ❌ |
| View task details | ✅ | ✅ | ✅ (assigned only) |
| **Topics** ||||
| Create topic | ✅ | ✅ | ❌ |
| Edit topic | ✅ | ✅ | ❌ |
| Delete topic | ✅ | ✅ | ❌ |
| Track topic progress | ✅ (all) | ✅ (assigned) | ✅ (own only) |
| **Submissions** ||||
| Submit work | ❌ | ❌ | ✅ |
| View submissions | ✅ (all) | ✅ (assigned) | ✅ (own only) |
| Review/Approve | ✅ | ✅ | ❌ |
| Give feedback | ✅ | ✅ | ✅ (replies) |

### Middleware Implementation

```typescript
// middleware/auth.ts

// Managers & Mentors = Admins
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'manager' && req.user.role !== 'mentor') {
    return res.status(403).json({
      error: 'Access denied. Only managers and mentors can manage curriculums.'
    });
  }

  next();
};
```

---

## Buddy Creation Flow

### Auto-Assignment Based on Role

**Step 1: Create Buddy with Domain Role**

```typescript
POST /api/buddies
{
  userId: "user-uuid",
  assignedMentorId: "mentor-uuid",
  domainRole: "frontend"  // ⭐ KEY: Determines curriculum
}
```

**Step 2: Backend Auto-Assignment Logic**

```typescript
async createBuddy(req, res) {
  const { userId, assignedMentorId, domainRole } = req.body;

  // 1. Create buddy profile
  const buddy = await db.insert(buddies).values({
    userId, assignedMentorId, status: "active"
  }).returning();

  // 2. Find PUBLISHED curriculum for this domain role
  const curriculum = await db.select()
    .from(curriculums)
    .where(
      and(
        eq(curriculums.domainRole, domainRole),
        eq(curriculums.status, "published"),
        eq(curriculums.isActive, true)
      )
    )
    .limit(1);

  if (!curriculum.length) {
    return res.status(400).json({
      error: `No published curriculum for ${domainRole}`
    });
  }

  // 3. Enroll buddy in curriculum
  const enrollment = await db.insert(buddyCurriculums).values({
    buddyId: buddy[0].id,
    curriculumId: curriculum[0].id,
    currentWeek: 1,
    targetCompletionDate: addWeeks(new Date(), curriculum[0].totalWeeks)
  }).returning();

  // 4. Get all weeks
  const weeks = await db.select()
    .from(curriculumWeeks)
    .where(eq(curriculumWeeks.curriculumId, curriculum[0].id))
    .orderBy(curriculumWeeks.displayOrder);

  // 5. For each week, create assignments
  for (const week of weeks) {
    const tasks = await db.select()
      .from(taskTemplates)
      .where(eq(taskTemplates.curriculumWeekId, week.id))
      .orderBy(taskTemplates.displayOrder);

    // Create week progress
    const weekProgress = await db.insert(buddyWeekProgress).values({
      buddyCurriculumId: enrollment[0].id,
      curriculumWeekId: week.id,
      weekNumber: week.weekNumber,
      totalTasks: tasks.length,
      status: "not_started"
    }).returning();

    // Create ALL task assignments (no locking!)
    for (const task of tasks) {
      await db.insert(taskAssignments).values({
        buddyId: buddy[0].id,
        taskTemplateId: task.id,
        buddyCurriculumId: enrollment[0].id,
        buddyWeekProgressId: weekProgress[0].id,
        status: "not_started",
        dueDate: addDays(new Date(), week.weekNumber * 7)
      });
    }
  }

  // 6. Auto-assign topics based on domain role
  const domainTopics = await db.select()
    .from(topics)
    .where(eq(topics.domainRole, domainRole));

  for (const topic of domainTopics) {
    await db.insert(buddyTopics).values({
      buddyId: buddy[0].id,
      topicId: topic.id,
      checked: false
    });
  }

  res.json({
    message: "Buddy created and enrolled!",
    totalTasks: weeks.reduce((sum, w) => sum + w.taskCount, 0)
  });
}
```

**Result:**
- ✅ Buddy created
- ✅ Enrolled in domain-specific curriculum
- ✅ ALL tasks assigned automatically
- ✅ Topics assigned
- ✅ Ready to start Week 1!

---

## API Endpoints

### Curriculums (Admin Only)

```
POST   /api/curriculums                  // Create curriculum
GET    /api/curriculums                  // List all
GET    /api/curriculums/:id              // Get details
PATCH  /api/curriculums/:id              // Update
DELETE /api/curriculums/:id              // Delete
POST   /api/curriculums/:id/publish      // Publish
POST   /api/curriculums/:id/unpublish    // Unpublish
POST   /api/curriculums/:id/duplicate    // Clone curriculum
GET    /api/curriculums/domain/:role     // Get by domain role
```

### Weeks (Admin Only)

```
POST   /api/curriculums/:id/weeks        // Create week
GET    /api/curriculums/:id/weeks        // List weeks
GET    /api/weeks/:id                    // Get week details
PATCH  /api/weeks/:id                    // Update week
DELETE /api/weeks/:id                    // Delete week
POST   /api/weeks/reorder                // Reorder weeks
```

### Task Templates (Admin Only)

```
POST   /api/weeks/:id/tasks              // Create task
GET    /api/weeks/:id/tasks              // List tasks
GET    /api/task-templates/:id           // Get task details
PATCH  /api/task-templates/:id           // Update task
DELETE /api/task-templates/:id           // Delete task
POST   /api/task-templates/:id/duplicate // Clone task
POST   /api/task-templates/reorder       // Reorder tasks
```

### Buddies

```
POST   /api/buddies                      // Create buddy (auto-assigns curriculum)
GET    /api/buddies/:id                  // Get buddy details
GET    /api/buddies/:id/curriculum       // Get assigned curriculum
GET    /api/buddies/:id/progress         // Get week-by-week progress
GET    /api/buddies/:id/assignments      // Get all task assignments
```

### Task Assignments (Buddy Actions)

```
GET    /api/task-assignments/:id         // Get assignment details
POST   /api/task-assignments/:id/start   // Mark as started
POST   /api/task-assignments/:id/submit  // Submit work (creates submission)
```

### Submissions

```
GET    /api/submissions/:id              // Get submission details
PATCH  /api/submissions/:id              // Update submission
DELETE /api/submissions/:id              // Delete submission
POST   /api/submissions/:id/resources    // Add resource
DELETE /api/submission-resources/:id     // Remove resource
```

### Feedback (Conversation Thread)

```
POST   /api/submissions/:id/feedback     // Add feedback/comment
GET    /api/submissions/:id/feedback     // Get all feedback
PATCH  /api/feedback/:id                 // Edit feedback
DELETE /api/feedback/:id                 // Delete feedback
```

### Review (Admin Actions)

```
POST   /api/submissions/:id/approve      // Approve submission
POST   /api/submissions/:id/reject       // Request revision
POST   /api/submissions/:id/grade        // Add grade
```

### Topics (Admin Manage, Buddy Track)

```
POST   /api/topics                       // Create topic (admin)
GET    /api/topics                       // List all topics
GET    /api/topics/domain/:role          // Get by domain
PATCH  /api/topics/:id                   // Update topic (admin)
DELETE /api/topics/:id                   // Delete topic (admin)

GET    /api/buddies/:id/topics           // Get buddy's topics
PATCH  /api/buddy-topics/:id             // Toggle topic (buddy)
```

### Analytics & Reports

```
GET    /api/mentors/:id/dashboard        // Mentor overview
GET    /api/mentors/:id/review-queue     // Submissions needing review
GET    /api/buddies/:id/statistics       // Buddy stats
GET    /api/curriculums/:id/analytics    // Curriculum analytics
```

---

## UI Components

### 1. Manager/Mentor Dashboard

#### Curriculum Management

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👔 Curriculum Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[+ Create New Curriculum]  [Import Template]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 EXISTING CURRICULUMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Filter: [All Roles ▼]  [All Status ▼]  🔍 Search...

┌────────────────────────────────────────────────┐
│ 📘 Frontend Developer Program v1.0             │
│ Domain: Frontend | Status: ✅ Published        │
│ 10 weeks | 28 tasks | 45 active buddies        │
│                                                 │
│ Last modified: Nov 1 by John (Mentor)          │
│                                                 │
│ [Edit] [Duplicate] [View Details] [Archive]    │
├────────────────────────────────────────────────┤
│ 📗 Backend Developer Program v1.0              │
│ Domain: Backend | Status: ✅ Published         │
│ 10 weeks | 32 tasks | 28 active buddies        │
│                                                 │
│ Last modified: Oct 28 by Sarah (Manager)       │
│                                                 │
│ [Edit] [Duplicate] [View Details] [Archive]    │
├────────────────────────────────────────────────┤
│ 📙 Fullstack Program v2.0                      │
│ Domain: Fullstack | Status: 📝 Draft           │
│ 12 weeks | 40 tasks | 0 buddies                │
│                                                 │
│ Last modified: Today by You (Mentor)           │
│                                                 │
│ [Edit] [Publish] [Preview] [Delete]            │
└────────────────────────────────────────────────┘
```

#### Curriculum Builder (Drag & Drop)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️ Edit Curriculum: Frontend Developer Program
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ Basic Info ──────────────────────────────────┐
│ Name: [Frontend Developer Program          ] │
│ Domain: [Frontend ▼]                          │
│ Version: [1.0    ]                            │
│ Status: [Published ▼]                         │
│                                                │
│ Description: (Markdown supported)             │
│ ┌──────────────────────────────────────────┐ │
│ │ 10-week intensive program covering       │ │
│ │ modern frontend development...           │ │
│ └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 WEEKS & TASKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[+ Add Week]

┌─ 📌 Week 1: HTML, CSS, JS Basics ─────────────┐
│ ⋮⋮ (drag to reorder)                          │
│                                                │
│ Description: Learn web fundamentals...        │
│ [Edit Week Info] [Delete Week]                │
│                                                │
│ Tasks (3):                                     │
│   ┌─ Task 1: Build Landing Page ─────────┐   │
│   │ ⋮⋮ Easy | 6 hours                    │   │
│   │ [Edit] [Duplicate] [Delete]          │   │
│   └──────────────────────────────────────┘   │
│                                                │
│   ┌─ Task 2: CSS Flexbox Layout ────────┐    │
│   │ ⋮⋮ Easy | 4 hours                    │   │
│   │ [Edit] [Duplicate] [Delete]          │   │
│   └──────────────────────────────────────┘   │
│                                                │
│   ┌─ Task 3: JavaScript Calculator ─────┐    │
│   │ ⋮⋮ Medium | 8 hours                  │   │
│   │ [Edit] [Duplicate] [Delete]          │   │
│   └──────────────────────────────────────┘   │
│                                                │
│ [+ Add Task to Week 1]                        │
└────────────────────────────────────────────────┘

... More weeks ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Save Changes]  [Preview]  [Publish]  [Cancel]
```

#### Task Template Editor

**📝 IMPORTANT: Use Rich Markdown Editor with Live Preview**
- Libraries: `react-markdown-editor-lite` or `@uiw/react-md-editor`
- Features needed:
  - Live preview split-pane
  - Syntax highlighting
  - Image upload support
  - Code blocks with language selection
  - Tables, lists, checkboxes
  - Toolbar for formatting

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️ Edit Task: Build Landing Page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ Task Details ────────────────────────────────┐
│ Title: [Build Landing Page                 ] │
│ Difficulty: [Easy ▼]                          │
│ Est. Hours: [6                             ]  │
└────────────────────────────────────────────────┘

┌─ Description ─────────────────────────────────┐
│ ⭐ MARKDOWN EDITOR WITH LIVE PREVIEW          │
│                                                │
│ ┌─ Edit ───────────┬─ Preview ─────────────┐ │
│ │ # Landing Page   │ Landing Page          │ │
│ │                  │                       │ │
│ │ Create a modern  │ Create a modern       │ │
│ │ responsive...    │ responsive...         │ │
│ │                  │                       │ │
│ │ ## Requirements  │ Requirements          │ │
│ │ - Hero section   │ • Hero section        │ │
│ │ - Features       │ • Features            │ │
│ │                  │                       │ │
│ │ ```html          │ [code block shown]    │ │
│ │ <header>...</     │                       │ │
│ │ ```              │                       │ │
│ └──────────────────┴───────────────────────┘ │
│                                                │
│ [B] [I] [Link] [Image] [Code] [List] [Table]  │
└────────────────────────────────────────────────┘

┌─ Expected Submissions ────────────────────────┐
│ [+ Add Resource Type]                         │
│                                                │
│ ☑️ GitHub Repository (Required)               │
│    Buddy must provide a GitHub repo link      │
│    [✕ Remove]                                 │
│                                                │
│ ☑️ Live Hosted Link (Required)                │
│    Buddy must deploy and share live URL       │
│    [✕ Remove]                                 │
│                                                │
│ ☐ Screenshot/PDF (Optional)                   │
│    Additional documentation                   │
│    [✕ Remove]                                 │
└────────────────────────────────────────────────┘

┌─ Learning Resources ──────────────────────────┐
│ [+ Add Resource]                              │
│                                                │
│ 🔗 HTML Crash Course                          │
│    https://youtube.com/...                    │
│    [Edit] [Remove]                            │
│                                                │
│ 📄 Flexbox Guide                              │
│    https://css-tricks.com/...                 │
│    [Edit] [Remove]                            │
└────────────────────────────────────────────────┘

[Save Task]  [Save & Add Another]  [Cancel]
```

#### Mentor Review Queue

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍🏫 Review Queue
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Filter: [All Buddies ▼] [All Weeks ▼] [All Tasks ▼]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 URGENT (Submitted >2 days ago) - 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────────────────┐
│ John Doe | Week 3: Event Handling             │
│ Task: Build Todo App                          │
│ Submitted: 2 days ago (v2)                    │
│                                                │
│ 🔗 GitHub: github.com/john/todo               │
│ 🌐 Live: todo.vercel.app                      │
│                                                │
│ 💬 1 previous feedback: "Fix mobile navbar"   │
│                                                │
│ [Review Now]                                  │
└────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟡 RECENT (Last 48 hours) - 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────────────────┐
│ Sarah Lee | Week 4: React Router              │
│ Submitted: 5 hours ago (v1)                   │
│                                                │
│ 🔗 GitHub + 🌐 Live + 📄 Documentation        │
│                                                │
│ [Review Now]                                  │
└────────────────────────────────────────────────┘
```

### 2. Buddy Dashboard

#### Curriculum Overview

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Welcome back, John!
📚 Frontend Developer Program
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Overall Progress: 25% ████░░░░░░░░░░░░
   Completed: 7/28 tasks | Current focus: Week 3
   Started: Oct 15 | Expected completion: Dec 20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 WEEKLY PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Week 1: HTML, CSS, JS Basics                    100%
   Due: Oct 22 | Completed: Oct 21 (1 day early!)

   ✅ Task 1: Build Landing Page
   ✅ Task 2: CSS Flexbox Layout
   ✅ Task 3: JavaScript Calculator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Week 2: Advanced JavaScript                     100%
   Due: Oct 29 | Completed: Oct 28

   ✅ Task 1: Array Methods
   ✅ Task 2: Async/Promises
   ✅ Task 3: Fetch API Project

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Week 3: React Fundamentals                      50%
   Due: Nov 5 | 3 days remaining

   ✅ Task 1: React Components (Approved ✓)
   ✅ Task 2: Props & State (Approved ✓)
   🕐 Task 3: Event Handling (Under Review)
       💬 2 comments from mentor
   📝 Task 4: Build Todo App (Not Started)
       [Start Task] [View Details]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Week 4: React Router & APIs                     0%
   Due: Nov 12 | Starts in 8 days (or work ahead!)

   📝 Task 1: Setup React Router
      [View Details] [Start Early]

   📝 Task 2: Dynamic Routes
      [View Details]

   📝 Task 3: API Integration
      [View Details]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Week 5-10: Click to expand
   [▼ Show All Weeks]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TIP: You can work ahead! All tasks are available now.
   Suggested pace: Complete current week before moving on.
```

#### Task Detail & Submission

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Week 3, Task 4: Build Todo App
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Status: Not Started
⏱️ Estimated: 8 hours
📅 Due: Nov 5, 2025
🏷️ Difficulty: Medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 DESCRIPTION (Rendered Markdown)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Todo Application with React

Create a fully functional todo application using React.

## Requirements

✓ Add new todos
✓ Mark todos as complete
✓ Delete todos
✓ Filter by: All, Active, Completed
✓ Persistent storage (localStorage)
✓ Responsive design

## Example

[Screenshot or demo gif]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 LEARNING RESOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 React Documentation
   https://react.dev

🎥 Todo App Tutorial
   https://youtube.com/...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 SUBMIT YOUR WORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Description (Markdown supported):
┌──────────────────────────────────────────────┐
│ I built a todo app with React and...         │
│                                               │
└──────────────────────────────────────────────┘

Optional Notes:
┌──────────────────────────────────────────────┐
│ Had some challenges with state management... │
└──────────────────────────────────────────────┘

Resources:

Resource 1:
  Type: [GitHub Repo ▼]
  Label: [Source Code              ]
  URL:   [https://github.com/...  ]

Resource 2:
  Type: [Live Website ▼]
  Label: [Live Demo                ]
  URL:   [https://todo.vercel.app ]

[+ Add Another Resource]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Submit for Review]  [Save Draft]  [Cancel]
```

#### Submission with Feedback Thread

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Task: Build Todo App
👤 Buddy: John Doe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━ SUBMISSION v2 (Latest) ━━━━━━━━━━━━━━━━━━━
Status: ✅ Approved
Submitted: Oct 29, 2:00 PM
Duration: 9 hours

Description:
Built a todo app with React. Implemented all features
including localStorage persistence and responsive design.

Resources:
🔗 GitHub: github.com/john/todo-app
🌐 Live: todo-app.vercel.app

━━━ FEEDBACK CONVERSATION (4 messages) ━━━━━━━━

┌────────────────────────────────────────────────┐
│ 👨‍🏫 Mentor Sarah - Oct 29, 3:00 PM            │
│ ✅ Approval                                    │
│                                                │
│ Excellent work! All requirements met. The     │
│ code is clean and the UI is responsive.       │
│ Approved! ✓                                   │
│                                                │
│ Grade: Pass                                   │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 👤 You - Oct 29, 3:15 PM                      │
│ 💬 Reply                                      │
│                                                │
│ Thank you! Can I work ahead to Week 4 now?    │
└────────────────────────────────────────────────┘

━━━ SUBMISSION v1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ⚠️ Needs Revision
Submitted: Oct 28, 10:00 AM

[Click to expand]
```

---

## Features

### Core Features (MVP)

1. **Curriculum Management**
   - ✅ Create/Edit/Delete curriculums
   - ✅ Week-based organization
   - ✅ Task templates with markdown descriptions
   - ✅ Domain role filtering (frontend/backend/etc)
   - ✅ Publish/Unpublish control

2. **Auto-Assignment**
   - ✅ Buddy creation triggers auto-assignment
   - ✅ Role-based curriculum selection
   - ✅ All tasks assigned at once (no locking)
   - ✅ Auto-assign domain-specific topics

3. **Progress Tracking**
   - ✅ Week-level progress (e.g., 2/4 tasks = 50%)
   - ✅ Overall curriculum progress
   - ✅ Time tracking (started, submitted, completed)
   - ✅ Status per task (not_started → completed)

4. **Submission System**
   - ✅ Multiple resource types per submission
   - ✅ Version tracking (v1, v2, v3)
   - ✅ Flexible resource types (free-form text field)
   - ✅ Description with markdown support

5. **Review & Feedback**
   - ✅ Conversation threads (mentor ↔ buddy)
   - ✅ Approve/Reject submissions
   - ✅ Request revisions
   - ✅ Optional grading

6. **Role-Based Access**
   - ✅ Managers & Mentors: Full admin access
   - ✅ Buddies: View & submit only
   - ✅ Simple 2-tier permission model

### Enhanced Features (Phase 2)

1. **Curriculum Templates**
   - Import/Export curriculum as JSON
   - Pre-built templates library
   - Duplicate/Clone existing curriculums

2. **Drag & Drop UI**
   - Reorder weeks
   - Reorder tasks within weeks
   - Visual curriculum builder

3. **Rich Markdown Editor**
   - Live preview split-pane
   - Syntax highlighting
   - Image upload support
   - Code blocks

4. **Analytics Dashboard**
   - Curriculum completion rates
   - Average time per task
   - Buddy performance metrics
   - Mentor review metrics

5. **Cohort System**
   - Group buddies by start date
   - Cohort-wide announcements
   - Leaderboard within cohort

6. **Gamification**
   - Badges for milestones
   - Week completion streaks
   - Peer recognition

7. **Smart Notifications**
   - Task due date reminders
   - Submission review alerts
   - Feedback notifications
   - Behind schedule warnings

8. **Portfolio Auto-Generation**
   - Approved submissions → portfolio
   - Buddy can toggle visibility
   - Showcase best work

---

## Implementation Plan

### Phase 1: Database & Backend (Week 1)

**Day 1-2: Schema & Migrations**
- [ ] Create all database tables
- [ ] Add indexes and foreign keys
- [ ] Run migrations
- [ ] Seed sample data

**Day 3-4: Core APIs**
- [ ] Curriculum CRUD endpoints
- [ ] Week CRUD endpoints
- [ ] Task template CRUD endpoints
- [ ] Auto-assignment logic on buddy creation
- [ ] Progress calculation helpers

**Day 5: Submission & Review**
- [ ] Submission endpoints
- [ ] Resource attachment endpoints
- [ ] Feedback thread endpoints
- [ ] Approve/reject logic

**Day 6-7: Testing & Refinement**
- [ ] Test auto-assignment flow
- [ ] Test progress calculation
- [ ] Test permission middleware
- [ ] API documentation

### Phase 2: Frontend (Week 2)

**Day 1-2: Admin Dashboard**
- [ ] Curriculum list page
- [ ] Curriculum builder (basic form)
- [ ] Week management
- [ ] Task template editor (basic textarea)

**Day 3-4: Buddy Dashboard**
- [ ] Curriculum overview (week list)
- [ ] Task detail page
- [ ] Submission form (multi-resource)
- [ ] Progress tracking view

**Day 5-6: Review System**
- [ ] Mentor review queue
- [ ] Submission detail view
- [ ] Feedback thread UI
- [ ] Approve/reject actions

**Day 7: Polish & Testing**
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] End-to-end testing

### Phase 3: Enhanced Features (Week 3)

**Day 1-2: Rich Markdown Editor**
- [ ] Install markdown editor library
- [ ] Integrate into task template editor
- [ ] Live preview split-pane
- [ ] Image upload handling

**Day 3-4: Drag & Drop**
- [ ] Install drag-drop library (react-beautiful-dnd)
- [ ] Reorderable week list
- [ ] Reorderable task list
- [ ] Save order to database

**Day 5-6: Analytics**
- [ ] Curriculum analytics page
- [ ] Mentor dashboard metrics
- [ ] Buddy progress charts
- [ ] Export reports

**Day 7: Final Polish**
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deployment

---

## Technical Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Auth:** JWT tokens
- **Validation:** Zod schemas

### Frontend
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **State Management:** Redux Toolkit
- **Routing:** Wouter
- **Forms:** react-hook-form + Zod
- **Markdown:** react-markdown-editor-lite or @uiw/react-md-editor
- **Drag & Drop:** react-beautiful-dnd or @dnd-kit

### Deployment
- **Backend:** Render
- **Frontend:** Vercel
- **Database:** Supabase PostgreSQL

---

## Best Practices

### Markdown Editor Requirements

**Must-have features:**
1. **Split-pane view** - Edit on left, preview on right
2. **Toolbar** - Quick formatting buttons
3. **Syntax highlighting** - For code blocks
4. **Image upload** - Drag & drop or file picker
5. **Tables** - Support markdown tables
6. **Checklists** - Task lists with checkboxes
7. **Auto-save** - Save drafts as user types
8. **Mobile responsive** - Stack vertically on small screens

**Recommended Libraries:**
- `@uiw/react-md-editor` (lightweight, good UX)
- `react-markdown-editor-lite` (feature-rich)
- `@toast-ui/react-editor` (enterprise-grade)

**Implementation:**
```tsx
import MDEditor from '@uiw/react-md-editor';

function TaskEditor() {
  const [description, setDescription] = useState('');

  return (
    <MDEditor
      value={description}
      onChange={setDescription}
      preview="live"
      height={400}
    />
  );
}
```

### Progress Calculation

**Auto-update triggers:**
- When submission is approved → increment completedTasks
- When task is unapproved → decrement completedTasks
- Recalculate week percentage: `(completed / total) * 100`
- Update overall curriculum progress: `(allCompleted / allTotal) * 100`

**Database triggers or application logic:**
```typescript
async function updateProgress(taskAssignmentId) {
  // Get assignment
  const assignment = await getAssignment(taskAssignmentId);

  // Update week progress
  const week = await getWeekProgress(assignment.buddyWeekProgressId);
  const completed = await countCompletedTasks(week.id);

  await updateWeekProgress(week.id, {
    completedTasks: completed,
    progressPercentage: Math.round((completed / week.totalTasks) * 100)
  });

  // Update overall curriculum progress
  const curriculum = await getCurriculum(assignment.buddyCurriculumId);
  const allCompleted = await countAllCompletedTasks(curriculum.id);
  const allTotal = await countAllTasks(curriculum.id);

  await updateCurriculumProgress(curriculum.id, {
    overallProgress: Math.round((allCompleted / allTotal) * 100)
  });
}
```

### Security Considerations

1. **Validate domain role match** when creating buddy
2. **Check ownership** before allowing edits (createdBy checks)
3. **Prevent SQL injection** via parameterized queries (Drizzle handles this)
4. **Sanitize markdown** before rendering (use `rehype-sanitize`)
5. **Rate limit** submission endpoints to prevent spam
6. **File size limits** for uploaded resources

---

## Example Workflows

### Workflow 1: Manager Creates Curriculum

```
1. Manager navigates to "Curriculum Management"
2. Clicks [+ Create New Curriculum]
3. Fills in basic info:
   - Name: "Backend Developer Program"
   - Domain: Backend
   - Description: "10-week intensive..."
4. Clicks [Save Draft]
5. Adds Week 1:
   - Title: "Node.js Fundamentals"
   - Description: "Learn Node.js basics..."
6. Adds tasks to Week 1:
   - Task 1: "Build REST API"
   - Task 2: "Database Integration"
7. Repeats for weeks 2-10
8. Clicks [Publish]
9. Curriculum is now live and will auto-assign to new backend buddies!
```

### Workflow 2: Buddy Joins & Gets Auto-Assigned

```
1. Manager creates buddy:
   POST /api/buddies
   { userId: "...", domainRole: "backend" }

2. Backend auto-assigns:
   ✅ Finds "Backend Developer Program" curriculum
   ✅ Enrolls buddy in curriculum
   ✅ Creates 30+ task assignments (all weeks)
   ✅ Assigns backend-specific topics
   ✅ Sets due dates per week

3. Buddy logs in and sees:
   📚 Backend Developer Program
   📊 0% progress
   📋 Week 1: 0/3 tasks (visible & clickable)
   📋 Week 2-10: All visible (can work ahead)
```

### Workflow 3: Buddy Submits Task

```
1. Buddy opens "Week 1, Task 1: Build REST API"
2. Reads description (rendered markdown)
3. Works on task (builds REST API)
4. Returns to platform and clicks [Submit]
5. Fills in:
   - Description: "Built REST API with Express..."
   - Resource 1: github.com/buddy/rest-api
   - Resource 2: api.herokuapp.com
   - Resource 3: postman.com/collection/xyz
6. Clicks [Submit for Review]
7. Status changes: not_started → submitted
8. Mentor gets notification

9. Mentor reviews:
   - Opens submission
   - Checks GitHub code
   - Tests live API
   - Leaves feedback: "Great work! Add error handling."
   - Clicks [Request Revision]

10. Buddy sees feedback notification
11. Buddy fixes issues and resubmits (v2)
12. Mentor approves (v2)
13. Status: submitted → completed
14. Week progress: 0/3 → 1/3 (33%)
```

---

## FAQ

### Q: What if we want to update a task template after buddies are assigned?

**A:** Task assignments reference `taskTemplateId`, so:
- **Template updates** reflect in future assignments
- **Existing assignments** remain unchanged (keeps consistency)
- **Option:** Add "Push update to existing assignments" checkbox

### Q: Can buddies work on multiple weeks simultaneously?

**A:** Yes! All tasks are unlocked from day 1. Buddy can:
- Start Week 4 task while Week 3 is incomplete
- UI shows "💡 Consider completing Week 3 first" suggestion
- But doesn't block access

### Q: How do we handle buddy switching domain roles?

**A:**
- Not common, but possible:
  1. Archive current enrollment
  2. Create new enrollment with new domain curriculum
  3. Previous progress saved (read-only)

### Q: Can mentors create personal tasks outside curriculum?

**A:** Not in MVP. But Phase 2 could add:
- "Custom Task" type (not part of curriculum)
- Manually assigned to specific buddy
- Doesn't affect week progress

### Q: What about buddy performance reviews?

**A:** Phase 2 feature:
- Export buddy progress report (PDF)
- Include: completion rate, quality scores, time management
- Mentor can add written review

---

## Success Metrics

### For System Success
- ✅ 100% of new buddies auto-assigned within 5 seconds
- ✅ 0 manual task assignments needed (all automatic)
- ✅ 90%+ curriculum completion rate
- ✅ Average mentor review time < 10 minutes per submission

### For User Experience
- ✅ Buddies understand week progress (clear UI)
- ✅ Mentors spend more time reviewing, less time managing
- ✅ Managers can create curriculum in < 2 hours
- ✅ Zero confusion about "what to do next"

---

## Future Enhancements

1. **AI-Powered Features**
   - Auto-suggest task descriptions
   - Code review assistance for mentors
   - Personalized learning paths

2. **Integrations**
   - GitHub auto-check (verify repo exists)
   - Lighthouse score for hosted sites
   - Calendar sync for due dates
   - Slack/Discord notifications

3. **Advanced Analytics**
   - Predict buddy drop-off risk
   - Identify struggling buddies early
   - Task difficulty calibration (adjust based on data)

4. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Offline task viewing

5. **Video Integration**
   - Loom/Zoom submissions
   - Screen recording reviews
   - Live 1-on-1 sessions

---

## Contact & Support

For questions or suggestions about this curriculum system:
- Technical: Create GitHub issue
- Product: Contact product team
- Urgent: Slack #mentor-buddy-support

---

**Last Updated:** 2025-10-31
**Version:** 1.0
**Author:** Development Team
