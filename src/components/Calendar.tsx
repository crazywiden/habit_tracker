import React, { useState } from 'react'
import { DayCell } from './DayCell'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
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
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {MONTHS[month]} {year}
          </h1>
          
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
              key={index} 
              day={day} 
              date={day ? new Date(year, month, day) : null}
            />
          ))}
        </div>
      </div>
    </div>
  )
}