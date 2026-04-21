/**
 * ComparisonContext - Persists strategy comparison state across page navigations
 * 
 * This context stores:
 * - Selected strategies for comparison
 * - Configuration (dates, capital, cashflow settings)
 * - Results from completed backtests
 * - UI state (whether selector is shown, running state)
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { ComparisonStrategy, ComparisonConfig } from '../components/portfolios/comparison'

interface DateAdjustment {
    adjusted: boolean
    originalDate: string
    adjustedDate: string
    reason?: string
}

interface ComparisonContextType {
    // State
    selectedStrategies: ComparisonStrategy[]
    config: ComparisonConfig
    showSelector: boolean
    isRunning: boolean
    dateAdjustment: DateAdjustment | null
    
    // Actions
    setSelectedStrategies: React.Dispatch<React.SetStateAction<ComparisonStrategy[]>>
    setConfig: React.Dispatch<React.SetStateAction<ComparisonConfig>>
    setShowSelector: (show: boolean) => void
    setIsRunning: (running: boolean) => void
    setDateAdjustment: (adjustment: DateAdjustment | null) => void
    
    // Convenience actions
    resetComparison: () => void
    hasResults: boolean
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

// Start with empty selection - users can add any strategies they want
const INITIAL_STRATEGIES: ComparisonStrategy[] = []

const INITIAL_CONFIG: ComparisonConfig = {
    startDate: '',
    endDate: '',
    initialCapital: 10000,
    cashflowAmount: null,
    cashflowFrequency: null
}

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
    const [selectedStrategies, setSelectedStrategies] = useState<ComparisonStrategy[]>(INITIAL_STRATEGIES)
    const [config, setConfig] = useState<ComparisonConfig>(INITIAL_CONFIG)
    const [showSelector, setShowSelector] = useState(true)
    const [isRunning, setIsRunning] = useState(false)
    const [dateAdjustment, setDateAdjustment] = useState<DateAdjustment | null>(null)

    // Check if we have results (at least one strategy has completed)
    const hasResults = selectedStrategies.some(s => s.result || s.error) && !isRunning

    // Reset to initial state
    const resetComparison = useCallback(() => {
        setSelectedStrategies(INITIAL_STRATEGIES)
        setConfig(INITIAL_CONFIG)
        setShowSelector(true)
        setIsRunning(false)
        setDateAdjustment(null)
    }, [])

    return (
        <ComparisonContext.Provider
            value={{
                selectedStrategies,
                config,
                showSelector,
                isRunning,
                dateAdjustment,
                setSelectedStrategies,
                setConfig,
                setShowSelector,
                setIsRunning,
                setDateAdjustment,
                resetComparison,
                hasResults,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    )
}

export const useComparison = () => {
    const context = useContext(ComparisonContext)
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider')
    }
    return context
}

