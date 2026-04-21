// Custom hook for backtest state management - API v3.0
import { useState, useEffect } from 'react'
import type { BacktestRequest, BacktestResult } from '../types/strategy'
import {
    runBacktest as apiRunBacktest,
    getBacktestExamples,
    createStrategy,
} from '../services/api'

// UI state for strategy metadata
interface StrategyUI {
    name: string
    description?: string
    risk_level?: 'defensive' | 'balanced' | 'aggressive'
    tags?: string[]
    notes?: string
}

// CLEAN API V4.0: entry_condition is embedded in allocations
const DEFAULT_REQUEST: BacktestRequest = {
    strategy: {
        allocations: {
            portfolio: {
                allocation: { SPY: 0.6, BND: 0.4 },
                rebalancing_frequency: 'none'
            },
        },
        fallback_allocation: 'portfolio',
        allocation_order: ['portfolio'],
    },
    config: {
        start_date: '2020-01-01',
        end_date: '2023-12-31',
        initial_capital: 10000,
        rebalance_frequency: 'monthly',
    },
}

const DEFAULT_ALLOCATIONS = [
    { symbol: 'SPY', allocation: 60 },
    { symbol: 'BND', allocation: 40 },
]

export const useBacktestState = () => {
    const [showPlayground, setShowPlayground] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('backtest-playground-active')
            return saved === 'true'
        }
        return false
    })

    const [examples, setExamples] = useState<any>(null)
    const [selectedExample, setSelectedExample] = useState<string>('')
    const [backtestRequest, setBacktestRequest] = useState<BacktestRequest>(DEFAULT_REQUEST)
    const [strategyUI, setStrategyUI] = useState<StrategyUI>({
        name: 'Conservative 60/40 Portfolio',
        description: '60% stocks, 40% bonds portfolio',
        risk_level: 'balanced',
        tags: [],
        notes: '',
    })
    const [result, setResult] = useState<BacktestResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>('')
    const [saveLoading, setSaveLoading] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const [allocations, setAllocations] = useState<Array<{ symbol: string; allocation: number }>>(() => {
        if (typeof window !== 'undefined') {
            const savedAllocations = localStorage.getItem('backtest-allocations')
            if (savedAllocations) {
                try {
                    return JSON.parse(savedAllocations)
                } catch (error) {
                    console.log('Failed to load saved allocations:', error)
                }
            }
        }
        return DEFAULT_ALLOCATIONS
    })

    useEffect(() => {
        const loadExamples = async () => {
            try {
                const data = await getBacktestExamples()
                setExamples(data.examples)
            } catch (error) {
                console.log('Examples not available:', error)
            }
        }
        loadExamples()
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('backtest-playground-active', showPlayground.toString())
        }
    }, [showPlayground])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('backtest-configuration', JSON.stringify(backtestRequest))
        }
    }, [backtestRequest])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('backtest-strategy-ui', JSON.stringify(strategyUI))
        }
    }, [strategyUI])

    useEffect(() => {
        if (typeof window !== 'undefined' && allocations.length > 0) {
            localStorage.setItem('backtest-allocations', JSON.stringify(allocations))
        }
    }, [allocations])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedConfig = localStorage.getItem('backtest-configuration')
            const savedStrategyUI = localStorage.getItem('backtest-strategy-ui')

            if (savedConfig) {
                try {
                    const parsed = JSON.parse(savedConfig)
                    setBacktestRequest(parsed)
                    const firstGroup = Object.keys(parsed.strategy?.allocations || {})[0]
                    if (firstGroup) {
                        const strategyAllocations = parsed.strategy.allocations[firstGroup]
                        const allocationsArray = Object.entries(strategyAllocations).map(
                            ([symbol, allocation]: [string, any]) => ({
                                symbol,
                                allocation: allocation * 100,
                            })
                        )
                        if (allocationsArray.length > 0) {
                            setAllocations(allocationsArray)
                        }
                    }
                } catch (error) {
                    console.log('Failed to load saved configuration:', error)
                }
            }

            if (savedStrategyUI) {
                try {
                    const parsed = JSON.parse(savedStrategyUI)
                    setStrategyUI(parsed)
                } catch (error) {
                    console.log('Failed to load saved strategy UI:', error)
                }
            }
        }
    }, [])

    const clearSavedData = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('backtest-playground-active')
            localStorage.removeItem('backtest-configuration')
            localStorage.removeItem('backtest-strategy-ui')
            localStorage.removeItem('backtest-allocations')
        }
        setShowPlayground(false)
        setBacktestRequest(DEFAULT_REQUEST)
        setStrategyUI({
            name: 'Conservative 60/40 Portfolio',
            description: '60% stocks, 40% bonds portfolio',
            risk_level: 'balanced',
            tags: [],
            notes: '',
        })
        setAllocations(DEFAULT_ALLOCATIONS)
        setResult(null)
        setError('')
        setSelectedExample('')
        setSaveSuccess(false)
    }

    const loadExample = (exampleKey: string) => {
        if (!examples || !examples[exampleKey]) return
        const example = examples[exampleKey]
        setStrategyUI({
            name: example.name,
            description: example.description,
            risk_level: 'balanced',
            tags: [],
            notes: '',
        })
        setBacktestRequest({
            strategy: example.strategy,
            config: {
                ...backtestRequest.config,
                ...example.config,
            },
        })
        const firstGroup = Object.keys(example.strategy.allocations)[0]
        const strategyAllocations = example.strategy.allocations[firstGroup]
        const newAllocations = Object.entries(strategyAllocations).map(([symbol, allocation]) => ({
            symbol,
            allocation: (allocation as number) * 100,
        }))
        setAllocations(newAllocations)
        setSelectedExample(exampleKey)
    }

    const runBacktest = async () => {
        const totalAlloc = allocations.reduce((sum, { allocation }) => sum + allocation, 0)
        if (totalAlloc !== 100 || !allocations.every(({ symbol }) => symbol.trim()) || !strategyUI.name.trim()) return
        setLoading(true)
        setError('')
        setResult(null)
        setSaveSuccess(false)
        try {
            const data = await apiRunBacktest(backtestRequest)
            if (!data.success) {
                throw new Error(data.result?.errors?.[0] || 'Backtest failed')
            }
            setResult(data)
        } catch (error: any) {
            setError(error.message || 'An error occurred while running the backtest')
        } finally {
            setLoading(false)
        }
    }

    const saveStrategy = async () => {
        if (!result || !result.success) {
            setError('No backtest result to save')
            return
        }
        setSaveLoading(true)
        setError('')
        setSaveSuccess(false)
        try {
            await createStrategy({
                name: strategyUI.name,
                strategy_dsl: backtestRequest.strategy,
                risk_level: strategyUI.risk_level || 'balanced',
                tags: strategyUI.tags || [],
                notes: strategyUI.notes || '',
            })
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (error: any) {
            setError(error.message || 'Failed to save strategy')
        } finally {
            setSaveLoading(false)
        }
    }

    const updateAllocation = (index: number, field: 'symbol' | 'allocation', value: string | number) => {
        const newAllocations = [...allocations]
        newAllocations[index] = { ...newAllocations[index], [field]: value }
        setAllocations(newAllocations)
        const strategyAllocations: { [symbol: string]: number } = {}
        newAllocations.forEach(({ symbol, allocation }) => {
            if (symbol && allocation > 0) {
                strategyAllocations[symbol] = allocation / 100
            }
        })
        setBacktestRequest((prev) => ({
            ...prev,
            strategy: {
                ...prev.strategy,
                allocations: {
                    portfolio: {
                        allocation: strategyAllocations,
                        rebalancing_frequency: 'none'
                    }
                },
                fallback_allocation: 'portfolio',
            },
        }))
    }

    const addAllocation = () => {
        setAllocations([...allocations, { symbol: '', allocation: 0 }])
    }

    const removeAllocation = (index: number) => {
        if (allocations.length > 1) {
            const newAllocations = allocations.filter((_, i) => i !== index)
            setAllocations(newAllocations)
            const strategyAllocations: { [symbol: string]: number } = {}
            newAllocations.forEach(({ symbol, allocation }) => {
                if (symbol && allocation > 0) {
                    strategyAllocations[symbol] = allocation / 100
                }
            })
            setBacktestRequest((prev) => ({
                ...prev,
                strategy: {
                    ...prev.strategy,
                    allocations: {
                        portfolio: {
                            allocation: strategyAllocations,
                            rebalancing_frequency: 'none'
                        }
                    },
                    fallback_allocation: 'portfolio',
                },
            }))
        }
    }

    const totalAllocation = allocations.reduce((sum, { allocation }) => sum + allocation, 0)
    const isValidBacktest = totalAllocation === 100 && allocations.every(({ symbol }) => symbol.trim().length > 0) && strategyUI.name.trim().length > 0
    const hasRestoredData = typeof window !== 'undefined' && !!localStorage.getItem('backtest-configuration')

    return {
        showPlayground,
        setShowPlayground,
        examples,
        selectedExample,
        backtestRequest,
        setBacktestRequest,
        strategyUI,
        setStrategyUI,
        result,
        loading,
        error,
        saveLoading,
        saveSuccess,
        allocations,
        totalAllocation,
        isValidBacktest,
        hasRestoredData,
        clearSavedData,
        loadExample,
        runBacktest,
        saveStrategy,
        updateAllocation,
        addAllocation,
        removeAllocation,
    }
}
