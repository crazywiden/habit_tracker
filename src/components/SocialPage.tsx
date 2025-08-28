import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigation } from '../hooks/useNavigation'

interface SocialPageProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

interface SocialData {
  completed: boolean
  resistanceCount: number
  totalUsageTime: number // minutes
  triggers: string[]
  alternativeActivities: string[]
  moodBefore: number // 1-10
  moodAfter: number // 1-10
  timeOfDay: string[]
  platforms: string[]
  reflection: string
  streakDays: number
  goals: string
  notes: string
}

interface TriggerOption {
  id: string
  label: string
  emoji: string
}

interface AlternativeOption {
  id: string
  label: string
  emoji: string
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  { id: 'boredom', label: 'Boredom', emoji: '😴' },
  { id: 'anxiety', label: 'Anxiety/Stress', emoji: '😰' },
  { id: 'loneliness', label: 'Loneliness', emoji: '😔' },
  { id: 'habit', label: 'Force of Habit', emoji: '🔄' },
  { id: 'notification', label: 'Notification', emoji: '📱' },
  { id: 'work_break', label: 'Work Break', emoji: '☕' },
  { id: 'procrastination', label: 'Procrastination', emoji: '⏰' },
  { id: 'fomo', label: 'FOMO', emoji: '👀' }
]

const ALTERNATIVE_OPTIONS: AlternativeOption[] = [
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'walk', label: 'Taking a Walk', emoji: '🚶' },
  { id: 'exercise', label: 'Exercise', emoji: '💪' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘' },
  { id: 'call_friend', label: 'Called a Friend', emoji: '📞' },
  { id: 'hobby', label: 'Worked on Hobby', emoji: '🎨' },
  { id: 'journal', label: 'Journaling', emoji: '📝' },
  { id: 'music', label: 'Listened to Music', emoji: '🎵' },
  { id: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { id: 'cleaning', label: 'Cleaning/Organizing', emoji: '🧹' }
]

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram', emoji: '📷' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'twitter', label: 'Twitter/X', emoji: '🐦' },
  { id: 'facebook', label: 'Facebook', emoji: '👥' },
  { id: 'youtube', label: 'YouTube', emoji: '📺' },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { id: 'reddit', label: 'Reddit', emoji: '🤖' },
  { id: 'snapchat', label: 'Snapchat', emoji: '👻' }
]

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Late Night']

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const SocialPage: React.FC<SocialPageProps> = ({ currentDate, onDateChange }) => {
  const { setPage } = useNavigation()
  const [socialData, setSocialData] = useState<SocialData>({
    completed: false,
    resistanceCount: 0,
    totalUsageTime: 0,
    triggers: [],
    alternativeActivities: [],
    moodBefore: 5,
    moodAfter: 5,
    timeOfDay: [],
    platforms: [],
    reflection: '',
    streakDays: 0,
    goals: '',
    notes: ''
  })

  const isToday = new Date().toDateString() === currentDate.toDateString()

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const loadSocialData = useCallback(async () => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('social_entries')
          .select('*')
          .eq('date', dateStr)
        
        if (error) {
          console.error('Error loading social data:', error)
          return
        }

        if (data && data.length > 0) {
          const entry = data[0]
          setSocialData({
            completed: entry.completed || false,
            resistanceCount: entry.resistance_count || 0,
            totalUsageTime: entry.total_usage_time || 0,
            triggers: entry.triggers || [],
            alternativeActivities: entry.alternative_activities || [],
            moodBefore: entry.mood_before || 5,
            moodAfter: entry.mood_after || 5,
            timeOfDay: entry.time_of_day || [],
            platforms: entry.platforms || [],
            reflection: entry.reflection || '',
            streakDays: entry.streak_days || 0,
            goals: entry.goals || '',
            notes: entry.notes || ''
          })
        } else {
          setSocialData({
            completed: false,
            resistanceCount: 0,
            totalUsageTime: 0,
            triggers: [],
            alternativeActivities: [],
            moodBefore: 5,
            moodAfter: 5,
            timeOfDay: [],
            platforms: [],
            reflection: '',
            streakDays: 0,
            goals: '',
            notes: ''
          })
        }
      } catch (error) {
        console.error('Error loading social data:', error)
      }
    } else {
      try {
        const stored = localStorage.getItem(`social-${dateStr}`)
        if (stored) {
          setSocialData(JSON.parse(stored))
        } else {
          setSocialData({
            completed: false,
            resistanceCount: 0,
            totalUsageTime: 0,
            triggers: [],
            alternativeActivities: [],
            moodBefore: 5,
            moodAfter: 5,
            timeOfDay: [],
            platforms: [],
            reflection: '',
            streakDays: 0,
            goals: '',
            notes: ''
          })
        }
      } catch (error) {
        console.error('Error loading social data from localStorage:', error)
      }
    }
  }, [currentDate])

  useEffect(() => {
    loadSocialData()
  }, [loadSocialData])

  const saveSocialData = async (newData: SocialData) => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('social_entries')
          .upsert(
            {
              date: dateStr,
              completed: newData.completed,
              resistance_count: newData.resistanceCount,
              total_usage_time: newData.totalUsageTime,
              triggers: newData.triggers,
              alternative_activities: newData.alternativeActivities,
              mood_before: newData.moodBefore,
              mood_after: newData.moodAfter,
              time_of_day: newData.timeOfDay,
              platforms: newData.platforms,
              reflection: newData.reflection,
              streak_days: newData.streakDays,
              goals: newData.goals,
              notes: newData.notes,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'date' }
          )
        
        if (error) {
          console.error('Error saving social data:', error)
        }
      } catch (error) {
        console.error('Error saving social data:', error)
        // Fallback to localStorage
        localStorage.setItem(`social-${dateStr}`, JSON.stringify(newData))
      }
    } else {
      try {
        localStorage.setItem(`social-${dateStr}`, JSON.stringify(newData))
      } catch (error) {
        console.error('Error saving social data to localStorage:', error)
      }
    }
  }

  const updateField = (field: keyof SocialData, value: string | number | string[] | boolean) => {
    const newData = {
      ...socialData,
      [field]: value
    }
    setSocialData(newData)
    saveSocialData(newData)
  }

  const toggleArrayItem = (field: 'triggers' | 'alternativeActivities' | 'timeOfDay' | 'platforms', item: string) => {
    const currentArray = socialData[field] as string[]
    const newArray = currentArray.includes(item)
      ? currentArray.filter(x => x !== item)
      : [...currentArray, item]
    
    updateField(field, newArray)
  }

  const incrementResistance = () => {
    updateField('resistanceCount', socialData.resistanceCount + 1)
  }

  const decrementResistance = () => {
    if (socialData.resistanceCount > 0) {
      updateField('resistanceCount', socialData.resistanceCount - 1)
    }
  }

  const toggleSocialComplete = () => {
    updateField('completed', !socialData.completed)
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

  const getResistanceColor = (count: number) => {
    if (count === 0) return 'from-gray-400 to-gray-500'
    if (count <= 2) return 'from-green-400 to-green-500'
    if (count <= 5) return 'from-emerald-400 to-emerald-500'
    if (count <= 8) return 'from-blue-400 to-blue-500'
    return 'from-purple-400 to-purple-500'
  }

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return 'text-red-500'
    if (mood <= 5) return 'text-yellow-500'
    if (mood <= 7) return 'text-green-500'
    return 'text-emerald-500'
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

        {/* Social Header */}
        <div className={`p-6 rounded-2xl bg-gradient-to-r ${getResistanceColor(socialData.resistanceCount)} text-white text-center mb-6`}>
          <div className="text-4xl mb-2">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Social Media Focus</h2>
          <div className="text-lg mb-3">
            Resistance Count: <span className="font-bold">{socialData.resistanceCount}</span>
          </div>
          <div className="flex justify-center gap-3 mb-3">
            <button
              onClick={decrementResistance}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
              disabled={socialData.resistanceCount === 0}
            >
              - Remove
            </button>
            <button
              onClick={incrementResistance}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
            >
              + Add Win
            </button>
          </div>
          <button
            onClick={toggleSocialComplete}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              socialData.completed 
                ? 'bg-white/30 hover:bg-white/40 text-white' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {socialData.completed ? '✅ Completed' : '⭕ Mark Complete'}
          </button>
        </div>

        <button
          onClick={() => setPage('home')}
          className="w-full mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          ← Back to Home
        </button>
      </div>

      {/* Usage Tracking */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">⏱️</span>
          Usage Tracking
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Usage Time (minutes)
            </label>
            <input
              type="number"
              value={socialData.totalUsageTime}
              onChange={(e) => updateField('totalUsageTime', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Streak (days)
            </label>
            <input
              type="number"
              value={socialData.streakDays}
              onChange={(e) => updateField('streakDays', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Mood Tracking */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-2">🌡️</span>
          Mood Impact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mood Before Usage: <span className={`font-bold ${getMoodColor(socialData.moodBefore)}`}>{socialData.moodBefore}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={socialData.moodBefore}
              onChange={(e) => updateField('moodBefore', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Terrible</span>
              <span>Amazing</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mood After Usage: <span className={`font-bold ${getMoodColor(socialData.moodAfter)}`}>{socialData.moodAfter}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={socialData.moodAfter}
              onChange={(e) => updateField('moodAfter', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Terrible</span>
              <span>Amazing</span>
            </div>
          </div>
        </div>
        
        {/* Mood Impact Indicator */}
        {socialData.moodBefore !== 5 && socialData.moodAfter !== 5 && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <div className="text-sm font-medium text-gray-700">
              Mood Impact: 
              {socialData.moodAfter > socialData.moodBefore ? (
                <span className="text-green-600 ml-1">+{socialData.moodAfter - socialData.moodBefore} (Positive)</span>
              ) : socialData.moodAfter < socialData.moodBefore ? (
                <span className="text-red-600 ml-1">{socialData.moodAfter - socialData.moodBefore} (Negative)</span>
              ) : (
                <span className="text-gray-600 ml-1">No Change</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Triggers */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🎯</span>
          What Triggered Usage?
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TRIGGER_OPTIONS.map((trigger) => (
            <button
              key={trigger.id}
              onClick={() => toggleArrayItem('triggers', trigger.id)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                socialData.triggers.includes(trigger.id)
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">{trigger.emoji}</div>
              <div className="text-xs font-medium">{trigger.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Platforms Used */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">📱</span>
          Platforms Used
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORM_OPTIONS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => toggleArrayItem('platforms', platform.id)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                socialData.platforms.includes(platform.id)
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">{platform.emoji}</div>
              <div className="text-xs font-medium">{platform.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time of Day */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🕐</span>
          Time of Day
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TIME_OPTIONS.map((time) => (
            <button
              key={time}
              onClick={() => toggleArrayItem('timeOfDay', time)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                socialData.timeOfDay.includes(time)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium">{time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Alternative Activities */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">✅</span>
          Alternative Activities Tried
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ALTERNATIVE_OPTIONS.map((activity) => (
            <button
              key={activity.id}
              onClick={() => toggleArrayItem('alternativeActivities', activity.id)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                socialData.alternativeActivities.includes(activity.id)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">{activity.emoji}</div>
              <div className="text-xs font-medium">{activity.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Goals & Reflection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            Today's Focus Goals
          </h3>
          <textarea
            value={socialData.goals}
            onChange={(e) => updateField('goals', e.target.value)}
            placeholder="What are your goals for social media usage today? What boundaries do you want to set?"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
          />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">💭</span>
            Reflection
          </h3>
          <textarea
            value={socialData.reflection}
            onChange={(e) => updateField('reflection', e.target.value)}
            placeholder="How do you feel about your social media use today? What patterns do you notice?"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
          />
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">📝</span>
          Additional Notes & Insights
        </h3>
        <textarea
          value={socialData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Any other observations, strategies that worked, or things you want to remember?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
        />
      </div>
    </div>
  )
}