import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigation } from '../hooks/useNavigation'

interface WorkoutPageProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

interface WorkoutData {
  completed: boolean
  exercises: Record<string, string | number | boolean>
  notes: string
  startTime?: string
  duration?: number
}

interface Exercise {
  name: string
  sets?: number
  reps?: string
  duration?: string
  rounds?: string
  type: string
  note?: string
  exercises?: string[]
  fields?: string[]
}

interface DayWorkout {
  name: string
  emoji: string
  gradient: string
  exercises: Exercise[]
}

const WEEKDAY_WORKOUTS: Record<number, DayWorkout> = {
  0: { // Sunday
    name: "Recovery + Long Walk",
    emoji: "🚶‍♂️",
    gradient: "from-green-400 to-green-600",
    exercises: [
      {
        name: "Easy walk/hike or light cycle",
        duration: "45-60 min",
        type: "cardio",
        fields: ["time", "distance"]
      },
      {
        name: "Mobility + diaphragmatic breathing", 
        duration: "10 min",
        type: "mobility",
        fields: ["hips", "hamstrings", "thoracic", "breathing"]
      }
    ]
  },
  1: { // Monday  
    name: "Push + Core (Arms)",
    emoji: "💪",
    gradient: "from-emerald-400 to-emerald-600",
    exercises: [
      {
        name: "Push-ups",
        sets: 4,
        type: "strength",
        note: "RIR 2",
        fields: ["reps"]
      },
      {
        name: "Pike or elevated push-ups",
        sets: 3,
        reps: "8-12",
        type: "strength",
        fields: ["reps"]
      },
      {
        name: "Diamond/close-grip push-ups", 
        sets: 3,
        reps: "AMRAP (leave 1-2)",
        type: "strength",
        fields: ["reps"]
      },
      {
        name: "Forearm plank",
        sets: 3,
        duration: "40-60s",
        type: "core",
        fields: ["duration"]
      },
      {
        name: "Hollow hold",
        sets: 3,
        duration: "20-40s", 
        type: "core",
        fields: ["duration"]
      }
    ]
  },
  2: { // Tuesday
    name: "Easy Cardio + Core",
    emoji: "🏃‍♂️",
    gradient: "from-blue-400 to-blue-600",
    exercises: [
      {
        name: "Zone-2 run",
        duration: "25-30 min",
        note: "conversational pace",
        type: "cardio",
        fields: ["time", "distance", "effort"]
      },
      {
        name: "Core circuit",
        rounds: "2-3",
        type: "core",
        exercises: ["Dead bug 10/side", "Side plank 30-45s/side", "Reverse crunch 10-15"],
        fields: ["rounds"]
      }
    ]
  },
  3: { // Wednesday
    name: "Legs + Pull + Core", 
    emoji: "🦵",
    gradient: "from-purple-400 to-purple-600",
    exercises: [
      {
        name: "Bodyweight squat",
        sets: 4,
        reps: "10-15",
        type: "strength",
        fields: ["reps"]
      },
      {
        name: "Split squat",
        sets: 3,
        reps: "8-12/leg",
        type: "strength", 
        fields: ["left_reps", "right_reps"]
      },
      {
        name: "Hip bridge / hip thrust",
        sets: 3,
        reps: "12-20",
        type: "strength",
        fields: ["reps"]
      },
      {
        name: "Row (inverted or backpack/band)",
        sets: 4,
        reps: "8-15",
        type: "strength",
        fields: ["reps"]
      },
      {
        name: "Side plank",
        sets: 3,
        duration: "30-60s/side",
        type: "core",
        fields: ["left_duration", "right_duration"]
      }
    ]
  },
  4: { // Thursday
    name: "Intervals + Mobility",
    emoji: "⚡",
    gradient: "from-orange-400 to-orange-600", 
    exercises: [
      {
        name: "Run intervals",
        sets: 10,
        note: "1 min hard @ 7-8/10 / 1 min easy",
        type: "cardio",
        fields: ["completed_intervals"]
      },
      {
        name: "Mobility",
        duration: "8-10 min",
        type: "mobility",
        exercises: ["Hip-flexor stretch", "90/90 hips", "Thoracic openers"],
        fields: ["completed"]
      }
    ]
  },
  5: { // Friday
    name: "Pull/Push + Arms + Abs",
    emoji: "🔥",
    gradient: "from-red-400 to-red-600",
    exercises: [
      {
        name: "Row variation",
        sets: 4,
        reps: "8-12",
        type: "strength",
        fields: ["reps"]
      },
      {
        name: "Tempo push-ups (3s down / 1s up)",
        sets: 3,
        reps: "8-12",
        type: "strength",
        fields: ["reps"]
      },
      {
        name: "Arms superset (curls + triceps extensions/dips)",
        rounds: "3-4",
        type: "strength",
        fields: ["rounds"]
      },
      {
        name: "Hanging knee raise or lying leg raise",
        sets: 4,
        reps: "10-15", 
        type: "core",
        fields: ["reps"]
      }
    ]
  },
  6: { // Saturday
    name: "HIIT + Core",
    emoji: "🔥",
    gradient: "from-pink-400 to-pink-600",
    exercises: [
      {
        name: "HIIT",
        rounds: "6-8", 
        note: "20s fast + 100s easy",
        type: "cardio",
        fields: ["completed_rounds"]
      },
      {
        name: "Core circuit",
        rounds: "2-3",
        type: "core",
        exercises: ["Bird dog 8/side", "Forearm plank 40-60s", "Hollow rocks 8-12"],
        fields: ["rounds"]
      }
    ]
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const WorkoutPage: React.FC<WorkoutPageProps> = ({ currentDate, onDateChange }) => {
  const { setPage } = useNavigation()
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    completed: false,
    exercises: {},
    notes: '',
    startTime: '',
    duration: undefined
  })

  const dayOfWeek = currentDate.getDay()
  const todaysWorkout = WEEKDAY_WORKOUTS[dayOfWeek as keyof typeof WEEKDAY_WORKOUTS]
  const isToday = new Date().toDateString() === currentDate.toDateString()

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const loadWorkoutData = useCallback(async () => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('workout_entries')
          .select('*')
          .eq('date', dateStr)
        
        if (error) {
          console.error('Error loading workout:', error)
          return
        }

        if (data && data.length > 0) {
          const entry = data[0]
          setWorkoutData({
            completed: entry.completed || false,
            exercises: entry.exercises || {},
            notes: entry.notes || '',
            startTime: entry.start_time || '',
            duration: entry.duration || undefined
          })
        } else {
          setWorkoutData({
            completed: false,
            exercises: {},
            notes: '',
            startTime: '',
            duration: undefined
          })
        }
      } catch (error) {
        console.error('Error loading workout:', error)
      }
    } else {
      try {
        const stored = localStorage.getItem(`workout-${dateStr}`)
        if (stored) {
          setWorkoutData(JSON.parse(stored))
        } else {
          setWorkoutData({
            completed: false,
            exercises: {},
            notes: '',
            startTime: '',
            duration: undefined
          })
        }
      } catch (error) {
        console.error('Error loading workout from localStorage:', error)
      }
    }
  }, [currentDate])

  useEffect(() => {
    loadWorkoutData()
  }, [loadWorkoutData])

  const saveWorkoutData = async (newData: WorkoutData) => {
    const dateStr = formatDate(currentDate)
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('workout_entries')
          .upsert(
            {
              date: dateStr,
              completed: newData.completed,
              exercises: newData.exercises,
              notes: newData.notes,
              start_time: newData.startTime,
              duration: newData.duration,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'date' }
          )
        
        if (error) {
          console.error('Error saving workout:', error)
        }
      } catch (error) {
        console.error('Error saving workout:', error)
        // Fallback to localStorage
        localStorage.setItem(`workout-${dateStr}`, JSON.stringify(newData))
      }
    } else {
      try {
        localStorage.setItem(`workout-${dateStr}`, JSON.stringify(newData))
      } catch (error) {
        console.error('Error saving workout to localStorage:', error)
      }
    }
  }

  const updateExerciseData = (exerciseIndex: number, field: string, value: string | number | boolean) => {
    const newData = {
      ...workoutData,
      exercises: {
        ...workoutData.exercises,
        [`${exerciseIndex}_${field}`]: value
      }
    }
    setWorkoutData(newData)
    saveWorkoutData(newData)
  }

  const toggleWorkoutComplete = () => {
    const newData = {
      ...workoutData,
      completed: !workoutData.completed
    }
    setWorkoutData(newData)
    saveWorkoutData(newData)
  }

  const updateNotes = (notes: string) => {
    const newData = {
      ...workoutData,
      notes
    }
    setWorkoutData(newData)
    saveWorkoutData(newData)
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
  const dayName = WEEKDAYS[dayOfWeek]

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

        {/* Workout Header */}
        <div className={`p-6 rounded-2xl bg-gradient-to-r ${todaysWorkout.gradient} text-white text-center mb-6`}>
          <div className="text-4xl mb-2">{todaysWorkout.emoji}</div>
          <h2 className="text-2xl font-bold mb-2">{todaysWorkout.name}</h2>
          <button
            onClick={toggleWorkoutComplete}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              workoutData.completed 
                ? 'bg-white/30 hover:bg-white/40 text-white' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {workoutData.completed ? '✅ Completed' : '⭕ Mark Complete'}
          </button>
        </div>

        <button
          onClick={() => setPage('home')}
          className="w-full mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          ← Back to Home
        </button>
      </div>

      {/* Warm-up Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🔥</span>
          Warm-up (5 min)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Brisk walk/jog 1-2 min',
            '10 hip hinges', 
            '10 bodyweight squats',
            '10 arm circles each way',
            '10 scapular push-ups'
          ].map((exercise, i) => (
            <label key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={Boolean(workoutData.exercises[`warmup_${i}`] || false)}
                onChange={(e) => updateExerciseData(-1, `warmup_${i}`, e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-gray-700">{exercise}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pelvic-floor & Breathing Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🫁</span>
          Pelvic-floor & Breathing (3-4 min)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Kegels 10× (5s/5s)',
            '10 quick pulses',
            'Reverse Kegels 5× (5-8s)',
            '4-6 breathing 1-2 min'
          ].map((exercise, i) => (
            <label key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={Boolean(workoutData.exercises[`breathing_${i}`] || false)}
                onChange={(e) => updateExerciseData(-1, `breathing_${i}`, e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">{exercise}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Exercises */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-2">💪</span>
          Main Work
        </h3>
        
        <div className="space-y-6">
          {todaysWorkout.exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="p-4 border border-gray-200 rounded-xl">
              <h4 className="font-semibold text-lg text-gray-800 mb-2">
                {exercise.name}
                {exercise.sets && <span className="text-gray-600"> — {exercise.sets} sets</span>}
                {exercise.reps && <span className="text-gray-600"> ({exercise.reps})</span>}
                {exercise.duration && <span className="text-gray-600"> ({exercise.duration})</span>}
                {exercise.rounds && <span className="text-gray-600"> — {exercise.rounds} rounds</span>}
                {exercise.note && <span className="text-sm text-gray-500"> • {exercise.note}</span>}
              </h4>
              
              {exercise.exercises && (
                <div className="mb-3 text-sm text-gray-600">
                  {exercise.exercises.join(' • ')}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {exercise.fields?.map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                      {field.replace('_', ' ')}
                    </label>
                    <input
                      type="text"
                      value={String(workoutData.exercises[`${exerciseIndex}_${field}`] || '')}
                      onChange={(e) => updateExerciseData(exerciseIndex, field, e.target.value)}
                      placeholder={field === 'effort' ? '1-10' : field.includes('time') ? 'mins' : field.includes('distance') ? 'km' : '#'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Habits Checklist */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">✅</span>
          Daily Habits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            '7-9h sleep',
            'Hydrated', 
            'Protein target hit',
            'Alcohol ≤1',
            '5-min de-stress'
          ].map((habit, i) => (
            <label key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={Boolean(workoutData.exercises[`daily_${i}`] || false)}
                onChange={(e) => updateExerciseData(-1, `daily_${i}`, e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-gray-700">{habit}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">📝</span>
          Notes & Reflections
        </h3>
        <textarea
          value={workoutData.notes}
          onChange={(e) => updateNotes(e.target.value)}
          placeholder="How did the workout feel? Any observations or adjustments for next time?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
        />
      </div>
    </div>
  )
}