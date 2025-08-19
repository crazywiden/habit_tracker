import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Habit {
  id: number
  name: string
  color: string
  type: 'toggle' | 'counter'
}

export interface HabitEntry {
  id: number
  habit_id: number
  date: string
  completed: boolean
  counter_value: number
  created_at: string
  updated_at: string
}