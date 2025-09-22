# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a **Habit Flywheel** (习惯飞轮) application built with React + TypeScript + Vite, featuring a unique habit management system where users accumulate energy through habit completion to redeem specific rewards.

### Core Concept
The application implements a "habit flywheel" system where:
- Users create **habits** that generate energy when completed
- Users create **rewards** that require energy to redeem
- Habits can be **bound** to specific rewards, creating direct energy flows
- This creates a closed-loop system validating genuine desire for rewards through consistent action

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Query + Context API
- **Internationalization**: i18next (supports zh/en/ja)
- **PWA**: Vite PWA plugin with service worker
- **Icons**: Lucide React

### Key Architecture Patterns

**1. Hook-Based Data Management**
- `useHabits` - Manages habit CRUD operations with optimistic updates
- `useRewards` - Manages reward CRUD with energy tracking  
- `useHabitCompletions` - Tracks daily habit completions
- `useAuth` - Supabase authentication wrapper

**2. Context Providers**
- `SettingsProvider` - App settings with localStorage persistence
- `LanguageProvider` - i18n language switching
- `AuthProvider` - Authentication state management

**3. Component Structure**
- `src/pages/` - Route components (Index, Auth, NotFound)
- `src/components/` - Feature components (HabitForm, RewardForm, etc.)
- `src/components/ui/` - shadcn/ui reusable components
- `src/hooks/` - Custom hooks for data and business logic

### Database Schema (Supabase)
- `habits` - User habits with energy values and reward bindings
- `rewards` - User rewards with energy costs and current energy
- `habit_completions` - Daily habit completion records
- `user_energy` - User's total accumulated energy

### Key Features
- **Multi-language Support**: Chinese (default), English, Japanese
- **Dark/Light Mode**: Auto-detection with manual override
- **PWA Support**: Offline capabilities and app-like experience
- **Responsive Design**: Mobile-first with desktop enhancements
- **Optimistic Updates**: Immediate UI feedback with rollback on errors

## Development Guidelines

### File Organization
- Use absolute imports with `@/` prefix (configured in Vite + TypeScript)
- Follow existing patterns for component structure
- Keep business logic in custom hooks, not components

### State Management
- Use React Query for server state
- Use Context API for app-wide client state
- Implement optimistic updates for better UX
- Always include error handling with toast notifications

### Styling
- Use Tailwind CSS classes exclusively
- Follow shadcn/ui component patterns
- Support both light and dark modes
- Maintain responsive design principles

### Database Operations
- All database operations go through Supabase client
- Implement retry logic for critical operations (energy updates)
- Use optimistic locking where needed (e.g., energy updates)
- Handle concurrent user operations gracefully

### Internationalization
- All user-facing text must use `t()` function from react-i18next
- Translation keys follow nested structure (e.g., `habits.title`)
- Add new translations to all supported language files

### Authentication
- Authentication is required for all main app features
- Use `ProtectedRoute` wrapper for authenticated pages
- Handle loading states during auth checks