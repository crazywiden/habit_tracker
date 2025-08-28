import { NavigationProvider } from './contexts/NavigationProvider'
import { PageRouter } from './components/PageRouter'

function App() {
  return (
    <NavigationProvider>
      <PageRouter />
    </NavigationProvider>
  )
}

export default App
