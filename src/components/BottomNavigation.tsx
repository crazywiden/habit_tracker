import React from 'react'
import { useNavigation } from '../hooks/useNavigation'
import type { Page } from '../types/navigation'

interface NavItem {
  page: Page
  emoji: string
  label: string
  gradient: string
}

const navItems: NavItem[] = [
  {
    page: 'home',
    emoji: '🏠',
    label: 'Home',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    page: 'workout',
    emoji: '💪',
    label: 'Workout', 
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    page: 'reading',
    emoji: '📚',
    label: 'Reading',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    page: 'diary',
    emoji: '📝', 
    label: 'Diary',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    page: 'social',
    emoji: '🚫',
    label: 'Focus',
    gradient: 'from-red-500 to-red-600'
  }
]

export const BottomNavigation: React.FC = () => {
  const { currentPage, setPage } = useNavigation()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-white/30 shadow-2xl">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = currentPage === item.page
            return (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[60px] ${
                  isActive 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-110` 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl mb-1">{item.emoji}</span>
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}