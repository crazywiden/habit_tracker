import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface HabitData {
  dailyDiary: boolean
  workout: boolean
  reading: boolean
  socialMediaCounter: number
}

interface HabitDataContextType {
  getHabitData: (date: Date) => HabitData
  setHabitData: (date: Date, data: HabitData) => void
  toggleHabit: (date: Date, habitType: 'dailyDiary' | 'workout' | 'reading') => void
  incrementCounter: (date: Date) => void
  decrementCounter: (date: Date) => void
  refreshHabitData: (date: Date) => Promise<void>
}

const HabitDataContext = createContext<HabitDataContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useHabitData = () => {
  const context = useContext(HabitDataContext)
  if (!context) {
    throw new Error('useHabitData must be used within a HabitDataProvider')
  }
  return context
}

interface HabitDataProviderProps {
  children: ReactNode
}

export const HabitDataProvider: React.FC<HabitDataProviderProps> = ({ children }) => {
  // Cache habit data for multiple dates
  const [habitCache, setHabitCache] = useState<Map<string, HabitData>>(new Map())

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getDefaultHabitData = (): HabitData => ({
    dailyDiary: false,
    workout: false,
    reading: false,
    socialMediaCounter: 0
  })

  const loadHabitDataFromStorage = useCallback(async (date: Date): Promise<HabitData> => {
    const dateStr = formatDate(date)
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('habit_entries')
          .select('*')
          .eq('date', dateStr)
        
        if (error) {
          console.error('Error loading habits:', error)
          return getDefaultHabitData()
        }

        if (data && data.length > 0) {
          const entry = data[0]
          return {
            dailyDiary: entry.daily_diary || false,
            workout: entry.workout || false,
            reading: entry.reading || false,
            socialMediaCounter: entry.social_media_counter || 0
          }
        }
      } catch (error) {
        console.error('Error loading habits:', error)
      }
    } else {
      try {
        const stored = localStorage.getItem(`habits-${dateStr}`)
        if (stored) {
          const parsedData = JSON.parse(stored)
          return {
            dailyDiary: parsedData.dailyDiary || false,
            workout: parsedData.workout || false,
            reading: parsedData.reading || false,
            socialMediaCounter: parsedData.socialMediaCounter || 0
          }
        }
      } catch (error) {
        console.error('Error loading habits from localStorage:', error)
      }
    }
    
    return getDefaultHabitData()
  }, [])

  const saveHabitDataToStorage = useCallback(async (date: Date, habitData: HabitData) => {
    const dateStr = formatDate(date)
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('habit_entries')
          .upsert(
            {
              date: dateStr,
              daily_diary: habitData.dailyDiary,
              workout: habitData.workout,
              reading: habitData.reading,
              social_media_counter: habitData.socialMediaCounter,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'date' }
          )
        
        if (error) {
          console.error('Error saving habits:', error)
        }
        
        // Also update diary_entries table for daily diary completion
        if (habitData.dailyDiary !== undefined) {
          await supabase
            .from('diary_entries')
            .upsert(
              {
                date: dateStr,
                completed: habitData.dailyDiary,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'date' }
            )
        }
      } catch (error) {
        console.error('Error saving habits:', error)
      }
    } else {
      try {
        localStorage.setItem(`habits-${dateStr}`, JSON.stringify(habitData))
        
        // Also update diary localStorage for consistency
        const diaryKey = `diary-${dateStr}`
        const existingDiary = localStorage.getItem(diaryKey)
        if (existingDiary) {
          const diaryData = JSON.parse(existingDiary)
          diaryData.completed = habitData.dailyDiary
          localStorage.setItem(diaryKey, JSON.stringify(diaryData))
        }
      } catch (error) {
        console.error('Error saving habits to localStorage:', error)
      }
    }
  }, [])

  const getHabitData = useCallback((date: Date): HabitData => {
    const dateStr = formatDate(date)
    return habitCache.get(dateStr) || getDefaultHabitData()
  }, [habitCache])

  const setHabitData = useCallback(async (date: Date, data: HabitData) => {
    const dateStr = formatDate(date)
    
    // Update cache
    setHabitCache(prev => new Map(prev.set(dateStr, data)))
    
    // Save to storage
    await saveHabitDataToStorage(date, data)
  }, [saveHabitDataToStorage])

  const toggleHabit = useCallback(async (date: Date, habitType: 'dailyDiary' | 'workout' | 'reading') => {
    const currentData = getHabitData(date)
    const newData = {
      ...currentData,
      [habitType]: !currentData[habitType]
    }
    await setHabitData(date, newData)
  }, [getHabitData, setHabitData])

  const incrementCounter = useCallback(async (date: Date) => {
    const currentData = getHabitData(date)
    const newData = {
      ...currentData,
      socialMediaCounter: currentData.socialMediaCounter + 1
    }
    await setHabitData(date, newData)
  }, [getHabitData, setHabitData])

  const decrementCounter = useCallback(async (date: Date) => {
    const currentData = getHabitData(date)
    if (currentData.socialMediaCounter > 0) {
      const newData = {
        ...currentData,
        socialMediaCounter: currentData.socialMediaCounter - 1
      }
      await setHabitData(date, newData)
    }
  }, [getHabitData, setHabitData])

  const refreshHabitData = useCallback(async (date: Date) => {
    const dateStr = formatDate(date)
    const data = await loadHabitDataFromStorage(date)
    setHabitCache(prev => new Map(prev.set(dateStr, data)))
  }, [loadHabitDataFromStorage])

  const value: HabitDataContextType = {
    getHabitData,
    setHabitData,
    toggleHabit,
    incrementCounter,
    decrementCounter,
    refreshHabitData
  }

  return (
    <HabitDataContext.Provider value={value}>
      {children}
    </HabitDataContext.Provider>
  )
}