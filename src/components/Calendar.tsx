import React, { useState } from 'react'
import { DayCell } from './DayCell'
import { DailyView } from './DailyView'
import { habits } from '../lib/habits'
import { useNavigation } from '../hooks/useNavigation'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type ViewMode = 'monthly' | 'daily'

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const { navigateToHabitDetail } = useNavigation()
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const days = []
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  if (viewMode === 'daily') {
    return <DailyView 
      currentDate={currentDate}
      onPreviousDay={goToPreviousDay}
      onNextDay={goToNextDay}
      onViewModeChange={setViewMode}
    />
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6 mb-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goToPreviousMonth}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-lg">←</span>
            <span className="font-medium">Previous</span>
          </button>
          
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {MONTHS[month]} {year}
            </h1>
            <button
              onClick={() => setViewMode('daily')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Switch to Daily View
            </button>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="font-medium">Next</span>
            <span className="text-lg">→</span>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center font-bold py-4 text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <DayCell 
              key={day ? `${year}-${month}-${day}` : `empty-${index}`} 
              day={day} 
              date={day ? new Date(year, month, day) : null}
            />
          ))}
        </div>
      </div>

      {/* Habit Goals Section */}
      <div className="mt-12 max-w-3xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🎯 Your Habit Goals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map((habit) => {
            const colorClasses: Record<string, { container: string; badge: string; title: string; subtitle: string }> = {
              blue: {
                container: 'from-blue-50 to-blue-100 border-blue-200',
                badge: 'from-blue-500 to-blue-600',
                title: 'text-blue-800',
                subtitle: 'text-blue-600',
              },
              emerald: {
                container: 'from-emerald-50 to-emerald-100 border-emerald-200',
                badge: 'from-emerald-500 to-emerald-600',
                title: 'text-emerald-800',
                subtitle: 'text-emerald-600',
              },
              purple: {
                container: 'from-purple-50 to-purple-100 border-purple-200',
                badge: 'from-purple-500 to-purple-600',
                title: 'text-purple-800',
                subtitle: 'text-purple-600',
              },
              red: {
                container: 'from-red-50 to-red-100 border-red-200',
                badge: 'from-red-500 to-red-600',
                title: 'text-red-800',
                subtitle: 'text-red-600',
              },
            }
            const c = colorClasses[habit.color] ?? colorClasses.blue
            return (
              <div
                key={habit.id}
                className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${c.container} border cursor-pointer hover:scale-105 transition-transform duration-200`}
                onClick={() => navigateToHabitDetail(habit.id)}
              >
                <div
                  className={`w-6 h-6 bg-gradient-to-r ${c.badge} rounded-lg shadow-lg flex items-center justify-center text-white text-xs font-bold`}
                >
                  {habit.type === 'counter' ? habit.emoji : ''}
                </div>
                <div className="flex-1">
                  <span className={`font-semibold ${c.title}`}>
                    {habit.name}
                  </span>
                  <p className={`text-sm ${c.subtitle}`}>
                    {habit.type === 'toggle'
                      ? 'Track your daily progress'
                      : 'Count your resistance wins'}
                  </p>
                </div>
                <div className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
          <p className="text-amber-800 font-medium text-center">
            💡 <strong>How to use:</strong> Click on each habit square to mark as complete. 
            Click on habit cards above to dive into detailed tracking!
          </p>
        </div>
      </div>
    </div>
  )
}