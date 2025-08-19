import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!supabase) {
  // Missing env vars should not crash the app; run without persistence.
  // Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable storage.
  console.warn('Supabase env vars are missing; running without persistence.')
}

export interface User {
  id: string
  email: string
  createdAt: string
}

export interface Habit {
  id: number
  userId: string
  name: string
  emoji: string | null
  color: string | null
  type: 'toggle' | 'counter'
  createdAt: string
}

export interface HabitEntry {
  id: number
  habitId: number
  date: string
  completed: boolean | null
  counterValue: number | null
  createdAt: string
  updatedAt: string
}