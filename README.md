# Mentor Buddy UI

A modern React TypeScript frontend for the Mentor Buddy Panel application.

## Features

- React 18 + TypeScript + Vite
- Tailwind CSS for styling  
- TanStack Query for state management
- Wouter for client-side routing
- Production-ready with deployment configs

## Development

```bash
npm install
npm run dev
```

Application runs on `http://localhost:5173`

## Build

```bash
npm run build
```

## Deployment

Configured for Vercel deployment with `vercel.json`.

### Environment Variables

- `VITE_API_URL`: Backend API URL (defaults to localhost:3000 in dev)

## Project Structure

```
src/
  hooks/       # Custom React hooks for API calls
  lib/         # API client and utilities  
  App.tsx      # Main application component
  index.css    # Tailwind CSS imports and custom styles
```

## API Integration

Uses custom hooks for API calls:
- `useHealth()` - Health check
- `useDashboardStats()` - Dashboard statistics
- `useMentors()`, `useBuddies()`, `useTasks()` - Entity management