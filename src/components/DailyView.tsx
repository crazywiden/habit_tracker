import React, { useEffect } from 'react'
import { habits as habitsConfig } from '../lib/habits'
import { useNavigation } from '../hooks/useNavigation'
import { useHabitData } from '../contexts/HabitDataContext'

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
  const { navigateToHabitDetail } = useNavigation()
  const { getHabitData, toggleHabit, incrementCounter, decrementCounter, refreshHabitData } = useHabitData()
  
  const habitData = getHabitData(currentDate)

  useEffect(() => {
    refreshHabitData(currentDate)
  }, [currentDate, refreshHabitData])

  const handleToggleHabit = (habitType: 'dailyDiary' | 'workout' | 'reading') => {
    toggleHabit(currentDate, habitType)
  }

  const handleIncrementCounter = () => {
    incrementCounter(currentDate)
  }

  const handleDecrementCounter = () => {
    decrementCounter(currentDate)
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
                      handleToggleHabit(habit.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
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
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateToHabitDetail(habit.id, currentDate)
                    }}
                    className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-white/20 hover:bg-white/30 text-white' 
                        : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-700'
                    }`}
                  >
                    📊 View Details
                  </button>
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
                  
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={handleDecrementCounter}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm"
                      disabled={habitData.socialMediaCounter === 0}
                    >
                      - Remove
                    </button>
                    <button
                      onClick={handleIncrementCounter}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm"
                    >
                      + Add
                    </button>
                  </div>

                  <button
                    onClick={() => navigateToHabitDetail(habit.id, currentDate)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                  >
                    📊 View Details
                  </button>
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