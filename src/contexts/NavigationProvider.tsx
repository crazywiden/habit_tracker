import React, { useState, useEffect } from 'react'
import { NavigationContext } from './NavigationContext'
import type { NavigationContextType, Page } from '../types/navigation'

interface NavigationProviderProps {
  children: React.ReactNode
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Update URL hash when page changes
  useEffect(() => {
    const hash = currentPage === 'home' ? '' : `#/${currentPage}`
    window.history.replaceState(null, '', hash)
  }, [currentPage])

  // Handle browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove #
      const page = hash.split('/')[1] as Page
      if (page && ['home', 'workout', 'reading', 'diary', 'social'].includes(page)) {
        setCurrentPage(page)
      } else {
        setCurrentPage('home')
      }
    }

    // Set initial page from URL
    handleHashChange()
    
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const setPage = (page: Page) => {
    setCurrentPage(page)
  }

  const setDate = (date: Date) => {
    setSelectedDate(date)
  }

  const navigateToHabitDetail = (habitId: string, date?: Date) => {
    if (date) {
      setSelectedDate(date)
    }
    
    const pageMap: Record<string, Page> = {
      'workout': 'workout',
      'reading': 'reading', 
      'dailyDiary': 'diary',
      'socialMediaCounter': 'social'
    }
    
    const page = pageMap[habitId] || 'home'
    setCurrentPage(page)
  }

  const value: NavigationContextType = {
    currentPage,
    selectedDate,
    setPage,
    setDate,
    navigateToHabitDetail
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}