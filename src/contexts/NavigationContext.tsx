import { createContext } from 'react'
import type { NavigationContextType } from '../types/navigation'

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined)