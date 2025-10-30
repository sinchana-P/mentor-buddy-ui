# Mentor Buddy Management System

## Overview

A comprehensive mentorship management platform that connects mentors with buddies (mentees) to track learning progress, manage tasks, and build portfolios. The system supports three user roles with granular permissions and domain-specific assignments across Frontend, Backend, Fullstack, DevOps, QA, and HR domains.

---

## User Roles

### 👨‍💼 Manager
Full administrative access to all system features. Can manage mentors, buddies, tasks, resources, and view comprehensive analytics.

### 👨‍🏫 Mentor
Guides and monitors assigned buddies. Can create tasks, update progress for assigned buddies, manage resources, and view portfolios.

### 👨‍🎓 Buddy (Mentee)
Learning participants who work on tasks, track their own progress, manage personal portfolios, and access learning resources.

---

## Core Modules

### 🔐 Authentication & User Management

**Features:**
- User registration with email and password
- Secure login with JWT authentication (7-day token expiration)
- Token-based session management with blacklist for logout
- Profile management (view/edit personal information)
- Change password functionality
- Role-based access control

**Permissions by Role:**
- **Manager:** Full user CRUD operations, role management
- **Mentor:** View own profile
- **Buddy:** View and edit own profile (limited to name)

---

### 👨‍🏫 Mentors Management

**Features:**
- Create new mentor profiles
- View all mentors with search and filtering
- Update mentor information (name, email, domain, bio, avatar)
- Delete mentor profiles
- View assigned buddies per mentor
- Domain-specific mentor assignments

**Operations:**
- **Create Mentor** - Add new mentor with domain expertise
- **View Mentors** - List all mentors with details
- **Update Mentor** - Edit mentor profile and domain
- **Delete Mentor** - Remove mentor from system
- **View Assigned Buddies** - See all buddies under a mentor

**Permissions by Role:**
- **Manager:** Full CRUD access
- **Mentor:** View all mentors
- **Buddy:** No access

---

### 👨‍🎓 Buddies Management

**Features:**
- Create new buddy profiles with mentor assignment
- View all buddies with search and filtering
- Update buddy information (name, email, domain, status)
- Manage mentor assignments
- Track buddy status (active, inactive, graduated)
- Domain role management
- Progress monitoring

**Operations:**
- **Create Buddy** - Add new buddy with initial mentor assignment
- **View Buddies** - List all buddies with details
- **Update Buddy** - Edit buddy profile, domain, status, mentor
- **Delete Buddy** - Remove buddy from system
- **Assign/Reassign Mentor** - Change buddy's assigned mentor
- **Update Status** - Mark buddy as active, inactive, or graduated

**Permissions by Role:**
- **Manager:** Full CRUD access, can edit all fields (except email)
- **Mentor:** View buddies, edit domain role only
- **Buddy:** View own profile, edit own name only

---

### ✅ Tasks Management

**Features:**
- Create tasks and assign to buddies
- Task categorization (coding, research, documentation, etc.)
- Priority levels (low, medium, high)
- Due date management
- Task status tracking (pending, in-progress, completed, overdue)
- Task descriptions with rich details
- Multiple submissions per task
- Submission reviews with GitHub and deployment links

**Operations:**
- **Create Task** - Assign new task to a buddy
- **View Tasks** - List all tasks with filtering
- **Update Task** - Edit task details, priority, due date
- **Delete Task** - Remove task from system
- **Update Task Status** - Change task progress status
- **Submit Task** - Add submission with links and notes
- **View Submissions** - Review all task submissions

**Permissions by Role:**
- **Manager:** Full CRUD access to all tasks
- **Mentor:** Create tasks, edit/delete own tasks only
- **Buddy:** View assigned tasks, update task status, submit work

---

### 📊 Progress Tracking

**Features:**
- Track buddy progress across multiple topics/skills
- Topic-based skill assessment
- Progress percentage tracking per topic
- Status indicators (not-started, in-progress, completed)
- Historical progress view
- Progress notes and timestamps

**Operations:**
- **View Progress** - See buddy progress across all topics
- **Update Progress** - Modify progress percentage and status
- **Track Topics** - Monitor skill development per topic
- **Add Progress Notes** - Document learning milestones

**Permissions by Role:**
- **Manager:** View all progress (cannot edit)
- **Mentor:** View and update progress for assigned buddies only
- **Buddy:** View and update own progress

---

### 💼 Portfolio Management

**Features:**
- Create and showcase project portfolios
- Add project details (title, description, tech stack)
- Include project links (GitHub, live demo, documentation)
- Upload project screenshots/images
- Categorize projects by domain
- Public portfolio visibility

**Operations:**
- **Create Portfolio** - Add new project to portfolio
- **View Portfolios** - Browse all buddy portfolios
- **Update Portfolio** - Edit project details and links
- **Delete Portfolio** - Remove project from portfolio
- **Upload Images** - Add project screenshots

**Permissions by Role:**
- **Manager:** View all portfolios, can edit any portfolio
- **Mentor:** View all portfolios
- **Buddy:** Full CRUD access to own portfolio only

---

### 📚 Resources Management

**Features:**
- Curated learning resource library
- Multiple resource types (article, video, tutorial, course, documentation)
- Resource categorization by topic
- Domain-specific resources (frontend, backend, fullstack, etc.)
- Difficulty levels (beginner, intermediate, advanced)
- Resource links and descriptions
- Search and filter capabilities

**Operations:**
- **Create Resource** - Add new learning resource
- **View Resources** - Browse resource library
- **Update Resource** - Edit resource details and links
- **Delete Resource** - Remove resource from library
- **Filter by Domain** - Find domain-specific resources
- **Filter by Type** - Search by resource type

**Permissions by Role:**
- **Manager:** Full CRUD access
- **Mentor:** Create and edit resources
- **Buddy:** View resources only

---

### 🎯 Topics & Skills Management

**Features:**
- Define skills and topics to track
- Topic categorization by domain
- Associate topics with curriculum
- Track buddy progress per topic
- Topic descriptions and learning objectives

**Operations:**
- **Create Topic** - Add new skill/topic to track
- **View Topics** - List all available topics
- **Update Topic** - Edit topic details
- **Delete Topic** - Remove topic from system
- **Link to Progress** - Associate topics with buddy progress

**Permissions by Role:**
- **Manager:** Full CRUD access
- **Mentor:** View topics only
- **Buddy:** View topics only

---

### 📖 Curriculum Management

**Features:**
- Domain-specific curriculum content
- Structured learning paths
- Curriculum topics and modules
- Learning objectives per domain
- Curriculum ordering and sequencing

**Operations:**
- **Create Curriculum** - Add domain curriculum content
- **View Curriculum** - Browse learning paths
- **Update Curriculum** - Edit curriculum structure
- **Delete Curriculum** - Remove curriculum content

**Permissions by Role:**
- **Manager:** Full CRUD access
- **Mentor:** View curriculum
- **Buddy:** View curriculum

---

### 📈 Dashboard & Analytics

**Features:**
- Real-time statistics overview
- Activity feed (recent tasks, submissions, updates)
- Key metrics display:
  - Total mentors and buddies count
  - Active buddies count
  - Pending, active, completed tasks count
  - Overdue tasks alert
  - Task completion rate
- Recent activity timeline
- Role-specific dashboard views

**Operations:**
- **View Dashboard** - Access statistics overview
- **View Activity Feed** - See recent system activity
- **View Statistics** - Monitor key metrics
- **Track Completion Rate** - Analyze task completion trends

**Permissions by Role:**
- **Manager:** Full dashboard access with all metrics
- **Mentor:** Dashboard access with assigned buddy metrics
- **Buddy:** Dashboard access with personal metrics

---

### ⚙️ Settings & Preferences

**Features:**
- Profile settings management
- Privacy settings control
- User preferences configuration
- Data export functionality
- Account information update

**Operations:**
- **Update Profile** - Edit personal information
- **Change Password** - Update account password
- **Configure Preferences** - Set user preferences
- **Manage Privacy** - Control privacy settings
- **Export Data** - Download personal data

**Permissions by Role:**
- **All Roles:** Access to own settings and preferences

---

## Technology Stack

### Backend
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Drizzle ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** Redux Toolkit with RTK Query
- **UI Components:** Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Error Tracking:** Sentry

---

## Domain Specializations

The system supports domain-specific assignments and tracking:

- **Frontend** - React, Vue, Angular, HTML/CSS, JavaScript
- **Backend** - Node.js, Python, Java, databases, APIs
- **Fullstack** - Complete stack development
- **DevOps** - CI/CD, Docker, Kubernetes, cloud platforms
- **QA** - Testing, automation, quality assurance
- **HR** - Human resources and team management

Each mentor and buddy is assigned a domain role, enabling domain-specific resource recommendations, task assignments, and progress tracking.

---

## Key Features Summary

✨ **Role-Based Access Control** - Granular permissions for 3 user roles
🔐 **Secure Authentication** - JWT-based with token blacklisting
👥 **Mentor-Buddy Pairing** - Structured mentorship assignments
✅ **Task Management** - Complete task lifecycle with submissions
📊 **Progress Tracking** - Topic-based skill development monitoring
💼 **Portfolio Showcase** - Project portfolio management
📚 **Resource Library** - Curated learning resources
📈 **Analytics Dashboard** - Real-time metrics and activity feed
🎯 **Domain-Specific** - Support for 6 technical domains
🔄 **State Persistence** - Redux with local storage persistence
🎨 **Modern UI** - Radix UI components with Tailwind CSS
📱 **Responsive Design** - Mobile-friendly interface

---

## Permission Matrix

| Feature | Manager | Mentor | Buddy |
|---------|---------|--------|-------|
| **User Management** | Full CRUD | View own | View own |
| **Mentors** | Full CRUD | View all | - |
| **Buddies** | Full CRUD | View all, Edit domain | View all, View own, Edit name |
| **Tasks** | Full CRUD | CRUD own tasks | View assigned, Update status |
| **Progress** | View only | Update assigned buddies | Update own |
| **Portfolio** | Edit any | View all | CRUD own |
| **Resources** | Full CRUD | Create/Edit | View only |
| **Topics** | Full CRUD | View only | View only |
| **Dashboard** | Full access | Full access | Full access |
| **Curriculum** | Full CRUD | View only | View only |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- npm or yarn

### Installation

**Backend:**
```bash
cd mentor-buddy-backend
npm install
npm run db:push
npm run dev
```

**Frontend:**
```bash
cd mentor-buddy-ui
npm install
npm run dev
```

### Default Users
The system requires initial user registration. First user registered as "manager" role has full administrative access.

---

## Project Status

✅ **Completed Modules:**
- Authentication & User Management
- Mentors Management
- Buddies Management
- Tasks Management with Submissions
- Progress Tracking
- Portfolio Management
- Resources Library
- Dashboard & Analytics
- Role-Based Permissions
- Settings & Preferences

🚀 **Production Ready** - All core features implemented and tested.

---

## Contributing

This is a mentor management system designed for educational institutions, bootcamps, and corporate training programs to streamline mentorship programs and track learning progress effectively.

---

**Built with ❤️ for effective mentorship management**
