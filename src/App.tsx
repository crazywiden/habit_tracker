import { NavigationProvider } from './contexts/NavigationProvider'
import { HabitDataProvider } from './contexts/HabitDataContext'
import { PageRouter } from './components/PageRouter'

function App() {
  return (
    <NavigationProvider>
      <HabitDataProvider>
        <PageRouter />
      </HabitDataProvider>
    </NavigationProvider>
  )
}

export default App
