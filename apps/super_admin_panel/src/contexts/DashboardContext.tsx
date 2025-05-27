'use client'

import { createContext, useContext } from 'react'

// Create context for sharing the active tab state across components
interface DashboardContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const DashboardContext = createContext<DashboardContextType>({
  activeTab: 'dashboard',
  setActiveTab: () => {},
})

// Export hook for using the dashboard context in any component
export const useDashboardContext = () => useContext(DashboardContext)
