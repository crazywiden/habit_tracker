import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigation } from '../hooks/useNavigation'

interface ReadingPageProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

interface ReadingData {
  completed: boolean
  currentBook: string
  currentPage: number
  totalPages?: number
  chapter: string
  timeRead: number // minutes
  keyInsights: string[]
  quotes: string[]
  personalReflections: string
  rating?: number
  notes: string
  connectionToPrevious: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const ReadingPage: React.FC<ReadingPageProps> = ({ currentDate, onDateChange }) => {
  const { setPage } = useNavigation()
  const [readingData, setReadingData] = useState<ReadingData>({
    completed: false,
    currentBook: '',
    currentPage: 0,
    totalPages: undefined,
    chapter: '',
    timeRead: 0,
    keyInsights: [''],
    quotes: [''],
    personalReflections: '',
    rating: undefined,
    notes: '',
    connectionToPrevious: ''
  })

  const isToday = new Date().toDateString() === currentDate.toDateString()

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const loadReadingData = useCallback(async () => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reading_entries')
          .select('*')
          .eq('date', dateStr)
        
        if (error) {
          console.error('Error loading reading data:', error)
          return
        }

        if (data && data.length > 0) {
          const entry = data[0]
          setReadingData({
            completed: entry.completed || false,
            currentBook: entry.current_book || '',
            currentPage: entry.current_page || 0,
            totalPages: entry.total_pages || undefined,
            chapter: entry.chapter || '',
            timeRead: entry.time_read || 0,
            keyInsights: entry.key_insights || [''],
            quotes: entry.quotes || [''],
            personalReflections: entry.personal_reflections || '',
            rating: entry.rating || undefined,
            notes: entry.notes || '',
            connectionToPrevious: entry.connection_to_previous || ''
          })
        } else {
          setReadingData({
            completed: false,
            currentBook: '',
            currentPage: 0,
            totalPages: undefined,
            chapter: '',
            timeRead: 0,
            keyInsights: [''],
            quotes: [''],
            personalReflections: '',
            rating: undefined,
            notes: '',
            connectionToPrevious: ''
          })
        }
      } catch (error) {
        console.error('Error loading reading data:', error)
      }
    } else {
      try {
        const stored = localStorage.getItem(`reading-${dateStr}`)
        if (stored) {
          setReadingData(JSON.parse(stored))
        } else {
          setReadingData({
            completed: false,
            currentBook: '',
            currentPage: 0,
            totalPages: undefined,
            chapter: '',
            timeRead: 0,
            keyInsights: [''],
            quotes: [''],
            personalReflections: '',
            rating: undefined,
            notes: '',
            connectionToPrevious: ''
          })
        }
      } catch (error) {
        console.error('Error loading reading data from localStorage:', error)
      }
    }
  }, [currentDate])

  useEffect(() => {
    loadReadingData()
  }, [loadReadingData])

  const saveReadingData = async (newData: ReadingData) => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('reading_entries')
          .upsert(
            {
              date: dateStr,
              completed: newData.completed,
              current_book: newData.currentBook,
              current_page: newData.currentPage,
              total_pages: newData.totalPages,
              chapter: newData.chapter,
              time_read: newData.timeRead,
              key_insights: newData.keyInsights,
              quotes: newData.quotes,
              personal_reflections: newData.personalReflections,
              rating: newData.rating,
              notes: newData.notes,
              connection_to_previous: newData.connectionToPrevious,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'date' }
          )
        
        if (error) {
          console.error('Error saving reading data:', error)
        }
      } catch (error) {
        console.error('Error saving reading data:', error)
        // Fallback to localStorage
        localStorage.setItem(`reading-${dateStr}`, JSON.stringify(newData))
      }
    } else {
      try {
        localStorage.setItem(`reading-${dateStr}`, JSON.stringify(newData))
      } catch (error) {
        console.error('Error saving reading data to localStorage:', error)
      }
    }
  }

  const updateField = (field: keyof ReadingData, value: string | number | string[] | boolean | undefined) => {
    const newData = {
      ...readingData,
      [field]: value
    }
    setReadingData(newData)
    saveReadingData(newData)
  }

  const updateArrayField = (field: 'keyInsights' | 'quotes', index: number, value: string) => {
    const newArray = [...readingData[field]]
    newArray[index] = value
    
    const newData = {
      ...readingData,
      [field]: newArray
    }
    setReadingData(newData)
    saveReadingData(newData)
  }

  const addArrayItem = (field: 'keyInsights' | 'quotes') => {
    const newData = {
      ...readingData,
      [field]: [...readingData[field], '']
    }
    setReadingData(newData)
    saveReadingData(newData)
  }

  const removeArrayItem = (field: 'keyInsights' | 'quotes', index: number) => {
    if (readingData[field].length > 1) {
      const newArray = readingData[field].filter((_, i) => i !== index)
      const newData = {
        ...readingData,
        [field]: newArray
      }
      setReadingData(newData)
      saveReadingData(newData)
    }
  }

  const toggleReadingComplete = () => {
    const newData = {
      ...readingData,
      completed: !readingData.completed
    }
    setReadingData(newData)
    saveReadingData(newData)
  }

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const dayOfMonth = currentDate.getDate()
  const month = MONTHS[currentDate.getMonth()]
  const year = currentDate.getFullYear()
  const dayName = WEEKDAYS[currentDate.getDay()]

  const progressPercentage = readingData.totalPages ? 
    Math.round((readingData.currentPage / readingData.totalPages) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousDay}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-xl">←</span>
          </button>
          
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-1">
              {dayName}
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
              {dayOfMonth}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {month} {year}
            </div>
            {isToday && (
              <div className="text-xs px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full">
                Today 📅
              </div>
            )}
          </div>
          
          <button
            onClick={goToNextDay}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-xl">→</span>
          </button>
        </div>

        {/* Reading Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-400 to-purple-600 text-white text-center mb-6">
          <div className="text-4xl mb-2">📚</div>
          <h2 className="text-2xl font-bold mb-2">Reading Journal</h2>
          <button
            onClick={toggleReadingComplete}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              readingData.completed 
                ? 'bg-white/30 hover:bg-white/40 text-white' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {readingData.completed ? '✅ Completed' : '⭕ Mark Complete'}
          </button>
        </div>

        <button
          onClick={() => setPage('home')}
          className="w-full mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          ← Back to Home
        </button>
      </div>

      {/* Current Book Info */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">📖</span>
          Current Book
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Book Title</label>
            <input
              type="text"
              value={readingData.currentBook}
              onChange={(e) => updateField('currentBook', e.target.value)}
              placeholder="Enter book title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chapter/Section</label>
            <input
              type="text"
              value={readingData.chapter}
              onChange={(e) => updateField('chapter', e.target.value)}
              placeholder="Chapter 5, Section 2.1, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Page</label>
            <input
              type="number"
              value={readingData.currentPage}
              onChange={(e) => updateField('currentPage', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Pages (optional)</label>
            <input
              type="number"
              value={readingData.totalPages || ''}
              onChange={(e) => updateField('totalPages', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="300"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Read (minutes)</label>
            <input
              type="number"
              value={readingData.timeRead}
              onChange={(e) => updateField('timeRead', parseInt(e.target.value) || 0)}
              placeholder="30"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Progress Bar */}
        {readingData.totalPages && readingData.totalPages > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progressPercentage}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating (optional)</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateField('rating', readingData.rating === star ? undefined : star)}
                className={`text-2xl ${
                  readingData.rating && star <= readingData.rating 
                    ? 'text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-300'
                } transition-colors`}
              >
                ⭐
              </button>
            ))}
            {readingData.rating && (
              <span className="ml-2 text-sm text-gray-600">
                {readingData.rating}/5 stars
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Key Insights
          </h3>
          <button
            onClick={() => addArrayItem('keyInsights')}
            className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
          >
            + Add
          </button>
        </div>
        
        <div className="space-y-3">
          {readingData.keyInsights.map((insight, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={insight}
                onChange={(e) => updateArrayField('keyInsights', index, e.target.value)}
                placeholder="What's an important insight or takeaway?"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {readingData.keyInsights.length > 1 && (
                <button
                  onClick={() => removeArrayItem('keyInsights', index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quotes */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">💬</span>
            Memorable Quotes
          </h3>
          <button
            onClick={() => addArrayItem('quotes')}
            className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
          >
            + Add
          </button>
        </div>
        
        <div className="space-y-3">
          {readingData.quotes.map((quote, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={quote}
                onChange={(e) => updateArrayField('quotes', index, e.target.value)}
                placeholder="Copy a meaningful quote or passage..."
                rows={2}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              {readingData.quotes.length > 1 && (
                <button
                  onClick={() => removeArrayItem('quotes', index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors self-start"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Personal Reflections */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🤔</span>
          Personal Reflections
        </h3>
        <textarea
          value={readingData.personalReflections}
          onChange={(e) => updateField('personalReflections', e.target.value)}
          placeholder="What are your thoughts? How does this relate to your life or experiences? What questions does it raise?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
        />
      </div>

      {/* Connection to Previous */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🔗</span>
          Connection to Previous Readings
        </h3>
        <textarea
          value={readingData.connectionToPrevious}
          onChange={(e) => updateField('connectionToPrevious', e.target.value)}
          placeholder="How does this connect to other books you've read? What patterns or themes do you see?"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
        />
      </div>

      {/* General Notes */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">📝</span>
          Additional Notes
        </h3>
        <textarea
          value={readingData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Any other thoughts, observations, or notes about today's reading session?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
        />
      </div>
    </div>
  )
}