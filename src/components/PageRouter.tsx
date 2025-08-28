import React from 'react'
import { useNavigation } from '../hooks/useNavigation'
import { Calendar } from './Calendar'
import { WorkoutPage } from './WorkoutPage'
import { ReadingPage } from './ReadingPage'
import { DiaryPage } from './DiaryPage'
import { SocialPage } from './SocialPage'
import { BottomNavigation } from './BottomNavigation'

export const PageRouter: React.FC = () => {
  const { currentPage, selectedDate, setDate, setPage } = useNavigation()

  const handleDateChange = (date: Date) => {
    setDate(date)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Calendar />
      case 'workout':
        return (
          <WorkoutPage 
            currentDate={selectedDate}
            onDateChange={handleDateChange}
          />
        )
      case 'reading':
        return (
          <ReadingPage 
            currentDate={selectedDate}
            onDateChange={handleDateChange}
          />
        )
      case 'diary':
        return (
          <DiaryPage 
            currentDate={selectedDate}
            onDateChange={handleDateChange}
          />
        )
      case 'social':
        return (
          <SocialPage 
            currentDate={selectedDate}
            onDateChange={handleDateChange}
          />
        )
      default:
        return <Calendar />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-10">
          <button
            onClick={() => setPage('home')}
            className="cursor-pointer"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-200">
              Daily Habit Tracker
            </h1>
          </button>
          <p className="text-xl text-gray-600 font-light">
            Build better habits, one day at a time ✨
          </p>
        </div>
        
        {/* Current Page Content */}
        {renderCurrentPage()}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}