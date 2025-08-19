import { Calendar } from './components/Calendar'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Daily Habit Tracker
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Build better habits, one day at a time ✨
          </p>
        </div>
        
        <Calendar />
        
        <div className="mt-12 max-w-3xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎯 Your Habit Goals
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg"></div>
              <div>
                <span className="font-semibold text-blue-800">📝 Daily Diary</span>
                <p className="text-sm text-blue-600">Reflect on your day</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg"></div>
              <div>
                <span className="font-semibold text-emerald-800">💪 Workout</span>
                <p className="text-sm text-emerald-600">Stay active and strong</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg"></div>
              <div>
                <span className="font-semibold text-purple-800">📚 Reading</span>
                <p className="text-sm text-purple-600">Expand your knowledge</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg flex items-center justify-center text-white text-xs font-bold">
                #
              </div>
              <div>
                <span className="font-semibold text-red-800">🚫 Social Media Resistance</span>
                <p className="text-sm text-red-600">Count times you avoided distractions</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
            <p className="text-amber-800 font-medium text-center">
              💡 <strong>How to use:</strong> Click on each habit square to mark as complete. 
              Click the counter to track your social media resistance wins!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
