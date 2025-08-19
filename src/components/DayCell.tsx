import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface DayCellProps {
  day: number | null
  date: Date | null
}

interface HabitData {
  dailyDiary: boolean
  workout: boolean
  reading: boolean
  socialMediaCounter: number
}

export const DayCell: React.FC<DayCellProps> = ({ day, date }) => {
  const [habits, setHabits] = useState<HabitData>({
    dailyDiary: false,
    workout: false,
    reading: false,
    socialMediaCounter: 0
  })

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  useEffect(() => {
    if (date) {
      loadHabits()
    }
  }, [date])

  const loadHabits = async () => {
    if (!date) return
    
    try {
      const dateStr = formatDate(date)
      const { data, error } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('date', dateStr)
      
      if (error) {
        console.error('Error loading habits:', error)
        return
      }

      if (data && data.length > 0) {
        const entry = data[0]
        setHabits({
          dailyDiary: entry.daily_diary || false,
          workout: entry.workout || false,
          reading: entry.reading || false,
          socialMediaCounter: entry.social_media_counter || 0
        })
      }
    } catch (error) {
      console.error('Error loading habits:', error)
    }
  }

  const saveHabits = async (newHabits: HabitData) => {
    if (!date) return
    
    try {
      const dateStr = formatDate(date)
      const { error } = await supabase
        .from('habit_entries')
        .upsert({
          date: dateStr,
          daily_diary: newHabits.dailyDiary,
          workout: newHabits.workout,
          reading: newHabits.reading,
          social_media_counter: newHabits.socialMediaCounter,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error saving habits:', error)
      }
    } catch (error) {
      console.error('Error saving habits:', error)
    }
  }

  const toggleHabit = (habitType: keyof Omit<HabitData, 'socialMediaCounter'>) => {
    const newHabits = {
      ...habits,
      [habitType]: !habits[habitType]
    }
    setHabits(newHabits)
    saveHabits(newHabits)
  }

  const incrementCounter = () => {
    const newHabits = {
      ...habits,
      socialMediaCounter: habits.socialMediaCounter + 1
    }
    setHabits(newHabits)
    saveHabits(newHabits)
  }

  const getSocialMediaColor = (count: number) => {
    if (count === 0) return 'bg-gradient-to-br from-gray-300 to-gray-400'
    if (count <= 2) return 'bg-gradient-to-br from-red-300 to-red-400'
    if (count <= 5) return 'bg-gradient-to-br from-red-400 to-red-500'
    if (count <= 8) return 'bg-gradient-to-br from-red-500 to-red-600'
    return 'bg-gradient-to-br from-red-600 to-red-700'
  }

  if (!day || !date) {
    return <div className="h-28 bg-gray-50/50 rounded-lg"></div>
  }

  const isToday = new Date().toDateString() === date.toDateString()

  return (
    <div className={`h-28 bg-white rounded-lg border-2 p-2 flex flex-col transition-all duration-200 hover:shadow-md ${
      isToday ? 'border-indigo-400 shadow-lg ring-2 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className={`text-sm font-bold mb-2 ${
        isToday ? 'text-indigo-600' : 'text-gray-700'
      }`}>
        {day}
        {isToday && <span className="ml-1 text-xs">📅</span>}
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-1">
        <div
          className={`rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
            habits.dailyDiary 
              ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-md' 
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          onClick={() => toggleHabit('dailyDiary')}
          title="Daily Diary"
        >
          <div className="w-full h-full flex items-center justify-center text-white text-xs">
            {habits.dailyDiary ? '📝' : ''}
          </div>
        </div>
        
        <div
          className={`rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
            habits.workout 
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md' 
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          onClick={() => toggleHabit('workout')}
          title="Workout"
        >
          <div className="w-full h-full flex items-center justify-center text-white text-xs">
            {habits.workout ? '💪' : ''}
          </div>
        </div>
        
        <div
          className={`rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
            habits.reading 
              ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-md' 
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          onClick={() => toggleHabit('reading')}
          title="Reading"
        >
          <div className="w-full h-full flex items-center justify-center text-white text-xs">
            {habits.reading ? '📚' : ''}
          </div>
        </div>
        
        <div
          className={`rounded-lg cursor-pointer flex items-center justify-center text-xs font-bold text-white transition-all duration-200 transform hover:scale-105 shadow-md ${getSocialMediaColor(habits.socialMediaCounter)}`}
          onClick={incrementCounter}
          title="Social Media Resistance Count"
        >
          {habits.socialMediaCounter || '🚫'}
        </div>
      </div>
    </div>
  )
}