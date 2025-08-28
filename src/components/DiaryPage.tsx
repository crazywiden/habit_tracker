import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigation } from '../hooks/useNavigation'

interface DiaryPageProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

interface DiaryData {
  completed: boolean
  mood: number // 1-10 scale
  gratitude: string[] // 3 entries
  keyEvents: string
  challenges: string
  wins: string
  tomorrowsFocus: string
  energyLevel: number // 1-10 scale
  stressLevel: number // 1-10 scale
  reflection: string
  goals: string[]
  habits: string
  weatherEmoji: string
  notes: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const MOOD_LABELS = [
  '', 'Terrible', 'Very Bad', 'Bad', 'Poor', 'Okay', 'Good', 'Very Good', 'Great', 'Excellent', 'Amazing'
]

const WEATHER_OPTIONS = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '🌦️', '🌨️', '❄️', '🌪️', '🌈']

export const DiaryPage: React.FC<DiaryPageProps> = ({ currentDate, onDateChange }) => {
  const { setPage } = useNavigation()
  const [diaryData, setDiaryData] = useState<DiaryData>({
    completed: false,
    mood: 5,
    gratitude: ['', '', ''],
    keyEvents: '',
    challenges: '',
    wins: '',
    tomorrowsFocus: '',
    energyLevel: 5,
    stressLevel: 5,
    reflection: '',
    goals: [''],
    habits: '',
    weatherEmoji: '☀️',
    notes: ''
  })

  const isToday = new Date().toDateString() === currentDate.toDateString()

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const loadDiaryData = useCallback(async () => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('date', dateStr)
        
        if (error) {
          console.error('Error loading diary data:', error)
          return
        }

        if (data && data.length > 0) {
          const entry = data[0]
          setDiaryData({
            completed: entry.completed || false,
            mood: entry.mood || 5,
            gratitude: entry.gratitude || ['', '', ''],
            keyEvents: entry.key_events || '',
            challenges: entry.challenges || '',
            wins: entry.wins || '',
            tomorrowsFocus: entry.tomorrows_focus || '',
            energyLevel: entry.energy_level || 5,
            stressLevel: entry.stress_level || 5,
            reflection: entry.reflection || '',
            goals: entry.goals || [''],
            habits: entry.habits || '',
            weatherEmoji: entry.weather_emoji || '☀️',
            notes: entry.notes || ''
          })
        } else {
          setDiaryData({
            completed: false,
            mood: 5,
            gratitude: ['', '', ''],
            keyEvents: '',
            challenges: '',
            wins: '',
            tomorrowsFocus: '',
            energyLevel: 5,
            stressLevel: 5,
            reflection: '',
            goals: [''],
            habits: '',
            weatherEmoji: '☀️',
            notes: ''
          })
        }
      } catch (error) {
        console.error('Error loading diary data:', error)
      }
    } else {
      try {
        const stored = localStorage.getItem(`diary-${dateStr}`)
        if (stored) {
          setDiaryData(JSON.parse(stored))
        } else {
          setDiaryData({
            completed: false,
            mood: 5,
            gratitude: ['', '', ''],
            keyEvents: '',
            challenges: '',
            wins: '',
            tomorrowsFocus: '',
            energyLevel: 5,
            stressLevel: 5,
            reflection: '',
            goals: [''],
            habits: '',
            weatherEmoji: '☀️',
            notes: ''
          })
        }
      } catch (error) {
        console.error('Error loading diary data from localStorage:', error)
      }
    }
  }, [currentDate])

  useEffect(() => {
    loadDiaryData()
  }, [loadDiaryData])

  const saveDiaryData = async (newData: DiaryData) => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('diary_entries')
          .upsert(
            {
              date: dateStr,
              completed: newData.completed,
              mood: newData.mood,
              gratitude: newData.gratitude,
              key_events: newData.keyEvents,
              challenges: newData.challenges,
              wins: newData.wins,
              tomorrows_focus: newData.tomorrowsFocus,
              energy_level: newData.energyLevel,
              stress_level: newData.stressLevel,
              reflection: newData.reflection,
              goals: newData.goals,
              habits: newData.habits,
              weather_emoji: newData.weatherEmoji,
              notes: newData.notes,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'date' }
          )
        
        if (error) {
          console.error('Error saving diary data:', error)
        }
      } catch (error) {
        console.error('Error saving diary data:', error)
        // Fallback to localStorage
        localStorage.setItem(`diary-${dateStr}`, JSON.stringify(newData))
      }
    } else {
      try {
        localStorage.setItem(`diary-${dateStr}`, JSON.stringify(newData))
      } catch (error) {
        console.error('Error saving diary data to localStorage:', error)
      }
    }
  }

  const updateField = (field: keyof DiaryData, value: string | number | string[] | boolean) => {
    const newData = {
      ...diaryData,
      [field]: value
    }
    setDiaryData(newData)
    saveDiaryData(newData)
  }

  const updateGratitude = (index: number, value: string) => {
    const newGratitude = [...diaryData.gratitude]
    newGratitude[index] = value
    
    const newData = {
      ...diaryData,
      gratitude: newGratitude
    }
    setDiaryData(newData)
    saveDiaryData(newData)
  }

  const updateGoals = (index: number, value: string) => {
    const newGoals = [...diaryData.goals]
    newGoals[index] = value
    
    const newData = {
      ...diaryData,
      goals: newGoals
    }
    setDiaryData(newData)
    saveDiaryData(newData)
  }

  const addGoal = () => {
    const newData = {
      ...diaryData,
      goals: [...diaryData.goals, '']
    }
    setDiaryData(newData)
    saveDiaryData(newData)
  }

  const removeGoal = (index: number) => {
    if (diaryData.goals.length > 1) {
      const newGoals = diaryData.goals.filter((_, i) => i !== index)
      const newData = {
        ...diaryData,
        goals: newGoals
      }
      setDiaryData(newData)
      saveDiaryData(newData)
    }
  }

  const toggleDiaryComplete = () => {
    const newData = {
      ...diaryData,
      completed: !diaryData.completed
    }
    setDiaryData(newData)
    saveDiaryData(newData)
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

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return 'from-red-400 to-red-600'
    if (mood <= 5) return 'from-yellow-400 to-yellow-600' 
    if (mood <= 7) return 'from-green-400 to-green-600'
    return 'from-emerald-400 to-emerald-600'
  }

  const getStressColor = (stress: number) => {
    if (stress <= 3) return 'from-green-400 to-green-600'
    if (stress <= 6) return 'from-yellow-400 to-yellow-600'
    return 'from-red-400 to-red-600'
  }

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

        {/* Diary Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 text-white text-center mb-6">
          <div className="text-4xl mb-2">📝</div>
          <h2 className="text-2xl font-bold mb-2">Daily Reflection</h2>
          <div className="flex justify-center items-center gap-4 mb-3">
            <span>Weather:</span>
            <div className="flex gap-1">
              {WEATHER_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => updateField('weatherEmoji', emoji)}
                  className={`text-2xl p-1 rounded ${diaryData.weatherEmoji === emoji ? 'bg-white/30' : 'hover:bg-white/20'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={toggleDiaryComplete}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              diaryData.completed 
                ? 'bg-white/30 hover:bg-white/40 text-white' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {diaryData.completed ? '✅ Completed' : '⭕ Mark Complete'}
          </button>
        </div>

        <button
          onClick={() => setPage('home')}
          className="w-full mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          ← Back to Home
        </button>
      </div>

      {/* Mood & Energy Tracking */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-2">🌡️</span>
          Mood & Energy Check-in
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Mood: <span className="font-bold">{MOOD_LABELS[diaryData.mood]}</span> ({diaryData.mood}/10)
            </label>
            <div className={`p-4 rounded-xl bg-gradient-to-r ${getMoodColor(diaryData.mood)} text-white text-center mb-3`}>
              <div className="text-3xl mb-2">
                {diaryData.mood <= 3 ? '😢' : diaryData.mood <= 5 ? '😐' : diaryData.mood <= 7 ? '🙂' : '😊'}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={diaryData.mood}
              onChange={(e) => updateField('mood', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Terrible</span>
              <span>Amazing</span>
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Energy Level: <span className="font-bold">{diaryData.energyLevel}/10</span>
            </label>
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 text-white text-center mb-3">
              <div className="text-3xl mb-2">
                {diaryData.energyLevel <= 3 ? '🔋' : diaryData.energyLevel <= 6 ? '🔋' : '⚡'}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={diaryData.energyLevel}
              onChange={(e) => updateField('energyLevel', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Drained</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Stress Level: <span className="font-bold">{diaryData.stressLevel}/10</span>
            </label>
            <div className={`p-4 rounded-xl bg-gradient-to-r ${getStressColor(diaryData.stressLevel)} text-white text-center mb-3`}>
              <div className="text-3xl mb-2">
                {diaryData.stressLevel <= 3 ? '😌' : diaryData.stressLevel <= 6 ? '😬' : '😰'}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={diaryData.stressLevel}
              onChange={(e) => updateField('stressLevel', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Calm</span>
              <span>Stressed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gratitude */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🙏</span>
          Three Things I'm Grateful For
        </h3>
        
        <div className="space-y-3">
          {diaryData.gratitude.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xl">{index + 1}.</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateGratitude(index, e.target.value)}
                placeholder={`Something you're grateful for today...`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Key Events */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">📅</span>
          Key Events of the Day
        </h3>
        <textarea
          value={diaryData.keyEvents}
          onChange={(e) => updateField('keyEvents', e.target.value)}
          placeholder="What were the main events, activities, or moments of your day?"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Challenges & Wins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Challenges */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🤔</span>
            Challenges
          </h3>
          <textarea
            value={diaryData.challenges}
            onChange={(e) => updateField('challenges', e.target.value)}
            placeholder="What difficulties did you face? What was hard about today?"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Wins */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🏆</span>
            Wins & Achievements
          </h3>
          <textarea
            value={diaryData.wins}
            onChange={(e) => updateField('wins', e.target.value)}
            placeholder="What went well? What are you proud of today?"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Goals & Tomorrow's Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Goals */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Goals Progress
            </h3>
            <button
              onClick={addGoal}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              + Add
            </button>
          </div>
          
          <div className="space-y-2">
            {diaryData.goals.map((goal, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateGoals(index, e.target.value)}
                  placeholder="What goal are you working on?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {diaryData.goals.length > 1 && (
                  <button
                    onClick={() => removeGoal(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tomorrow's Focus */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🌅</span>
            Tomorrow's Focus
          </h3>
          <textarea
            value={diaryData.tomorrowsFocus}
            onChange={(e) => updateField('tomorrowsFocus', e.target.value)}
            placeholder="What's your main priority for tomorrow? What do you want to focus on?"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Habits Reflection */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🔄</span>
          Habits & Patterns
        </h3>
        <textarea
          value={diaryData.habits}
          onChange={(e) => updateField('habits', e.target.value)}
          placeholder="How did you do with your habits today? What patterns are you noticing?"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Overall Reflection */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">💭</span>
          Overall Reflection
        </h3>
        <textarea
          value={diaryData.reflection}
          onChange={(e) => updateField('reflection', e.target.value)}
          placeholder="How are you feeling about life in general? Any deeper thoughts or realizations?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Additional Notes */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">📝</span>
          Additional Notes
        </h3>
        <textarea
          value={diaryData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Anything else you want to remember about today?"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>
    </div>
  )
}