# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React + TypeScript habit tracking application built with Vite and styled with Tailwind CSS.

### Key Components Structure
- **App.tsx** - Main application component with habit display and gradient UI
- **Calendar.tsx** - Monthly calendar view with navigation controls, supports both monthly and daily views
- **DailyView.tsx** - Detailed daily view for individual habit management with increment/decrement controls
- **DayCell.tsx** - Individual day component for habit interactions in monthly view
- **lib/habits.ts** - Static habit definitions (Daily Diary, Workout, Reading, Social Media Resistance)
- **lib/supabase.ts** - Supabase client configuration with optional persistence

### Data Architecture
- Habits have types: `toggle` (boolean completion) or `counter` (numeric tracking)
- Each habit has: id, name, emoji, color theme, and type
- Data persistence works in two modes:
  - **Supabase mode**: Uses `habit_entries` table with columns: `date`, `daily_diary`, `workout`, `reading`, `social_media_counter`
  - **LocalStorage fallback**: Stores data as JSON with key format `habits-YYYY-MM-DD`
- Supabase integration is optional - app runs without persistence if env vars missing
- Database interfaces defined for User, Habit, and HabitEntry entities

### Styling System
- Tailwind CSS with custom gradient themes per habit color (blue, emerald, purple, red)
- Responsive design with mobile-first approach
- Glass morphism effects with backdrop-blur and transparency
- Color-coded habit cards with consistent theming

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL (optional)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (optional)

The app gracefully degrades without Supabase configuration, displaying a console warning but maintaining full UI functionality.

### User Interaction Patterns
- **Monthly View**: Click day cells to toggle habits or increment counters
- **Daily View**: Large habit cards with toggle buttons and increment/decrement controls for counters
- **View Switching**: Toggle between monthly and daily views via navigation buttons
- **Social Media Counter**: Visual color progression (gray → red gradient) based on resistance count
- **Today Indicator**: Special styling and 📅 emoji for current date

### State Management
- Each component manages its own habit data state locally
- Data loading happens on component mount and date changes
- Automatic saving occurs on every habit interaction
- Uses `upsert` operations for Supabase to handle date conflicts
- Error handling with fallback to localStorage when Supabase fails