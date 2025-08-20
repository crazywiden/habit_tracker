import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { habits as habitsConfig } from '../lib/habits'

interface DailyViewProps {
  currentDate: Date
  onPreviousDay: () => void
  onNextDay: () => void
  onViewModeChange: (mode: 'monthly' | 'daily') => void
}

interface HabitData {
  dailyDiary: boolean
  workout: boolean
  reading: boolean
  socialMediaCounter: number
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const DailyView: React.FC<DailyViewProps> = ({ 
  currentDate, 
  onPreviousDay, 
  onNextDay, 
  onViewModeChange 
}) => {
  const [habitData, setHabitData] = useState<HabitData>({
    dailyDiary: false,
    workout: false,
    reading: false,
    socialMediaCounter: 0
  })

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const loadHabits = useCallback(async () => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
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
          setHabitData({
            dailyDiary: entry.daily_diary || false,
            workout: entry.workout || false,
            reading: entry.reading || false,
            socialMediaCounter: entry.social_media_counter || 0
          })
        } else {
          setHabitData({
            dailyDiary: false,
            workout: false,
            reading: false,
            socialMediaCounter: 0
          })
        }
      } catch (error) {
        console.error('Error loading habits:', error)
      }
    } else {
      try {
        const stored = localStorage.getItem(`habits-${dateStr}`)
        if (stored) {
          const parsedData = JSON.parse(stored)
          setHabitData({
            dailyDiary: parsedData.dailyDiary || false,
            workout: parsedData.workout || false,
            reading: parsedData.reading || false,
            socialMediaCounter: parsedData.socialMediaCounter || 0
          })
        } else {
          setHabitData({
            dailyDiary: false,
            workout: false,
            reading: false,
            socialMediaCounter: 0
          })
        }
      } catch (error) {
        console.error('Error loading habits from localStorage:', error)
      }
    }
  }, [currentDate])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  const saveHabits = async (newHabits: HabitData) => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('habit_entries')
          .upsert(
            {
              date: dateStr,
              daily_diary: newHabits.dailyDiary,
              workout: newHabits.workout,
              reading: newHabits.reading,
              social_media_counter: newHabits.socialMediaCounter,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'date' }
          )
        
        if (error) {
          console.error('Error saving habits:', error)
        }
      } catch (error) {
        console.error('Error saving habits:', error)
      }
    } else {
      try {
        localStorage.setItem(`habits-${dateStr}`, JSON.stringify(newHabits))
      } catch (error) {
        console.error('Error saving habits to localStorage:', error)
      }
    }
  }

  const toggleHabit = (habitType: 'dailyDiary' | 'workout' | 'reading') => {
    const newHabits = {
      ...habitData,
      [habitType]: !habitData[habitType]
    }
    setHabitData(newHabits)
    saveHabits(newHabits)
  }

  const incrementCounter = () => {
    const newHabits = {
      ...habitData,
      socialMediaCounter: habitData.socialMediaCounter + 1
    }
    setHabitData(newHabits)
    saveHabits(newHabits)
  }

  const decrementCounter = () => {
    if (habitData.socialMediaCounter > 0) {
      const newHabits = {
        ...habitData,
        socialMediaCounter: habitData.socialMediaCounter - 1
      }
      setHabitData(newHabits)
      saveHabits(newHabits)
    }
  }

  const getSocialMediaColor = (count: number) => {
    if (count === 0) return 'from-gray-400 to-gray-500'
    if (count <= 2) return 'from-red-300 to-red-400'
    if (count <= 5) return 'from-red-400 to-red-500'
    if (count <= 8) return 'from-red-500 to-red-600'
    return 'from-red-600 to-red-700'
  }

  const isToday = new Date().toDateString() === currentDate.toDateString()
  const dayOfWeek = WEEKDAYS[currentDate.getDay()]
  const dayOfMonth = currentDate.getDate()
  const month = MONTHS[currentDate.getMonth()]
  const year = currentDate.getFullYear()

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
        
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onPreviousDay}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-xl">←</span>
          </button>
          
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">
              {dayOfWeek}
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {dayOfMonth}
            </div>
            <div className="text-sm text-gray-600">
              {month} {year}
            </div>
            {isToday && (
              <div className="mt-1 text-xs px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full">
                Today
              </div>
            )}
          </div>
          
          <button
            onClick={onNextDay}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-xl">→</span>
          </button>
        </div>

        <button
          onClick={() => onViewModeChange('monthly')}
          className="w-full mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Back to Monthly View
        </button>

        <div className="space-y-4">
          {habitsConfig.map((habit) => {
            if (habit.type === 'toggle') {
              const isCompleted = habitData[habit.id as keyof HabitData] as boolean
              return (
                <div
                  key={habit.id}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    isCompleted
                      ? (
                          habit.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          habit.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                          habit.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                          habit.color === 'red' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                          'bg-gradient-to-br from-gray-400 to-gray-600'
                        )
                      : 'bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400'
                  }`}
                  onClick={() => {
                    if (habit.id !== 'socialMediaCounter') {
                      toggleHabit(habit.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl mb-2 ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
                        {habit.emoji}
                      </div>
                      <div className={`text-lg font-bold mb-1 ${isCompleted ? 'text-white' : 'text-gray-700'}`}>
                        {habit.name}
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-white border-white' 
                        : 'border-gray-400'
                    }`}>
                      {isCompleted && <span className="text-gray-600 text-lg">✓</span>}
                    </div>
                  </div>
                </div>
              )
            }
            
            if (habit.type === 'counter') {
              return (
                <div
                  key={habit.id}
                  className={`p-6 rounded-2xl shadow-lg bg-gradient-to-br ${getSocialMediaColor(habitData.socialMediaCounter)}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl mb-2 text-white">
                        {habit.emoji}
                      </div>
                      <div className="text-lg font-bold mb-1 text-white">
                        {habit.name}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {habitData.socialMediaCounter}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={decrementCounter}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm"
                      disabled={habitData.socialMediaCounter === 0}
                    >
                      - Remove
                    </button>
                    <button
                      onClick={incrementCounter}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}