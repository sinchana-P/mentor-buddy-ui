# Mentor Buddy Management System

A comprehensive mentor-buddy management platform that facilitates mentorship programs with role-based access control, task management, progress tracking, and resource sharing.

## Overview

This full-stack application manages mentorship relationships between Managers, Mentors, and Buddies. It provides tools for task assignment, skill tracking, curriculum management, and progress monitoring across multiple technical domains (Frontend, Backend, Full-Stack, DevOps, QA, HR).

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Render

**Key Libraries**:
- `express` - Web framework
- `drizzle-orm` - Type-safe ORM
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-Origin Resource Sharing
- `tsx` / `nodemon` - Development tools

### Frontend
- **Library**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **CSS Framework**: Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **UI Components**: Radix UI
- **Router**: Wouter
- **Deployment**: Vercel

**Key Libraries**:
- `@reduxjs/toolkit` - State management
- `@radix-ui/*` - Accessible UI components
- `tailwindcss` - Utility-first CSS
- `wouter` - Lightweight routing

## Architecture

### User Roles & Permissions
- **Manager**: Full system access, user management, analytics
- **Mentor**: Buddy management, task assignment, progress tracking
- **Buddy**: Task completion, resource access, profile management

### Key Features
- Role-based authentication and authorization
- Task assignment and submission tracking
- Curriculum and resource management
- Skills and topic progress tracking
- Activity feeds and analytics dashboard
- GitHub and deployment link integration

### Database Schema
Main entities include:
- **users**: Core user profiles with role-based permissions
- **mentors**: Extended mentor profiles
- **buddies**: Buddy profiles with mentor assignments
- **tasks**: Task management and assignments
- **submissions**: Task submissions with links
- **resources**: Learning resources with categorization
- **curriculum**: Domain-specific curriculum content
- **topics & buddyTopicProgress**: Skills tracking system

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (or Supabase account)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd mentor-buddy-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create `.env` file):
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ORIGIN=http://localhost:5173
```

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev          # Standard dev server
npm run dev:watch    # With auto-reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd mentor-buddy-ui
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create `.env` file):
```bash
VITE_API_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development Commands

### Backend
```bash
npm run dev              # Start development server
npm run dev:watch        # Start with auto-reload
npm run build           # Build for production
npm start               # Start production server
npm run db:push         # Push schema changes to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Drizzle Studio
npm run db:generate     # Generate migrations from schema
```

### Frontend
```bash
npm run dev             # Start development server (Vite)
npm run build           # Production build
npm run lint            # Run ESLint
npm run preview         # Preview production build
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

### Core API Routes
- `/api/users/*` - User management (Manager only)
- `/api/mentors/*` - Mentor operations
- `/api/buddies/*` - Buddy management and progress
- `/api/tasks/*` - Task assignment and submissions
- `/api/resources/*` - Learning resources
- `/api/settings/*` - User profile and preferences
- `/api/dashboard/*` - Analytics and activity feeds

All protected routes require JWT token in `Authorization` header:
```
Authorization: Bearer <token>
```

## State Management

The frontend uses a feature-based Redux architecture:

```
store/
├── auth/           # Authentication & user management
├── mentors/        # Mentors CRUD operations
├── buddies/        # Buddies CRUD operations
├── tasks/          # Tasks CRUD operations
├── resources/      # Resources CRUD operations
├── services/       # Service layer for API integration
└── index.ts        # Store configuration
```

### Usage Example
```tsx
import { mentorBuddyService } from '../store/services';
import { useMentorsList } from '../hooks/redux';

// Fetch data
useEffect(() => {
  mentorBuddyService.fetchMentors();
}, []);

// Access state
const mentors = useMentorsList();

// CRUD operations
await mentorBuddyService.createMentor(data);
await mentorBuddyService.updateMentorById(id, data);
await mentorBuddyService.deleteMentorById(id);
```

## Deployment

### Backend (Render)
The backend is configured for Render deployment using `render.yaml`. Set the required environment variables in your Render dashboard.

### Frontend (Vercel)
The frontend is configured for Vercel deployment using `vercel.json`. Set `VITE_API_URL` to your production backend URL.

## Project Structure

```
mentor-buddy/
├── mentor-buddy-backend/
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth & validation middleware
│   │   ├── routes/           # API routes
│   │   ├── shared/           # Shared types & schema
│   │   └── index.ts          # Entry point
│   ├── drizzle.config.ts     # Drizzle ORM config
│   └── package.json
│
├── mentor-buddy-ui/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── store/           # Redux store & slices
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   └── App.tsx          # Main app component
│   ├── tailwind.config.js   # Tailwind configuration
│   └── package.json
│
├── CLAUDE.md                # AI assistant instructions
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Quality

- Run `npm run lint` in the frontend to check code quality
- Follow TypeScript best practices
- Use feature-based organization for Redux slices
- Maintain type safety with DTOs and Response Objects

## License

This project is private and proprietary.

## Support

For questions or issues, please contact the development team or create an issue in the repository.

---

Built with ❤️ using React, TypeScript, Express, and PostgreSQL
