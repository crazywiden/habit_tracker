export type Page = 'home' | 'workout' | 'reading' | 'diary' | 'social'

export interface NavigationState {
  currentPage: Page
  selectedDate: Date
}

export interface NavigationContextType extends NavigationState {
  setPage: (page: Page) => void
  setDate: (date: Date) => void
  navigateToHabitDetail: (habitId: string, date?: Date) => void
}