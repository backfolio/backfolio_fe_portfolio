/**
 * StrategyCompareView - Main Strategy Comparison Component
 * 
 * This component orchestrates the strategy comparison feature, allowing users to:
 * - Select strategies from saved backtests or preset templates
 * - Run parallel backtests with unified configuration
 * - View comparative charts and metrics
 * 
 * @module components/portfolios/StrategyCompareView
 */

import { useState, useCallback, useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useComparison } from '../../context/ComparisonContext'
import { useStrategies } from '../../hooks/useApi'
import { runBacktest, getEarliestCommonDate } from '../../services/api'
import { ALLOCATION_PRESETS } from '../../constants/strategy'
import { ComparisonChart } from './ComparisonChart'
import { ComparisonDrawdownChart } from './ComparisonDrawdownChart'
import { ComparisonMetricsTable } from './ComparisonMetricsTable'
import { ComparisonYearlyReturnsTable } from './ComparisonYearlyReturnsTable'
import type { SavedStrategy, BacktestConfig } from '../../types/strategy'
import {
    STRATEGY_COLORS,
    MAX_STRATEGIES,
    type TemplateStrategy,
    type RebalanceFrequency,
    type CashflowFrequency,
    preparePortfolioChartData,
    prepareDrawdownChartData,
    hasAllResults,
} from './comparison'
import type { Condition, CompositeCondition, SignalParams, AllocationWithRebalancing } from '../../types/strategy'
import { TickerSearchInput } from '../backtest/components/TickerSearchInput'

/**
 * Normalize indicator types to uppercase (SMA, EMA, RSI, HV, DD, ROC, BB, MACD).
 * The backend requires uppercase types for proper signal handling.
 */
const normalizeSignalType = (signal: SignalParams): SignalParams => {
    if (!signal || !signal.type) return signal

    const type = signal.type
    if (['sma', 'Sma', 'SMA'].includes(type)) return { ...signal, type: 'SMA' }
    if (['ema', 'Ema', 'EMA'].includes(type)) return { ...signal, type: 'EMA' }
    if (['rsi', 'Rsi', 'RSI'].includes(type)) return { ...signal, type: 'RSI' }
    if (['hv', 'Hv', 'HV'].includes(type)) return { ...signal, type: 'HV' }
    // TIER 1 indicators
    if (['dd', 'Dd', 'DD'].includes(type)) return { ...signal, type: 'DD' }
    if (['roc', 'Roc', 'ROC'].includes(type)) return { ...signal, type: 'ROC' }
    // TIER 2 indicators
    if (['bb', 'Bb', 'BB', 'bollingerb', 'BollingerB'].includes(type)) return { ...signal, type: 'BB' }
    if (['macd', 'Macd', 'MACD'].includes(type)) return { ...signal, type: 'MACD' }
    return signal
}

/**
 * Normalize condition to ensure only 'comparison' is used (not 'operator')
 * Also normalizes signal types and handles nested composite conditions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeConditionFormat = (condition: any): Condition | CompositeCondition => {
    if (!condition) return condition

    // Composite condition
    if ('op' in condition && 'conditions' in condition) {
        return {
            op: condition.op,
            conditions: condition.conditions.map((c: Condition | CompositeCondition) => normalizeConditionFormat(c))
        }
    }

    // Simple condition - ensure we use 'comparison' not 'operator' and normalize signal types
    if ('left' in condition && 'right' in condition) {
        const comparison = condition.comparison || condition.operator || '>'
        return {
            left: normalizeSignalType(condition.left),
            comparison: comparison,
            right: normalizeSignalType(condition.right)
        }
    }

    return condition
}

/** Available rebalancing frequency options with labels */
const REBALANCE_OPTIONS: { value: RebalanceFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
]

/** Available cashflow frequency options with labels */
const CASHFLOW_FREQUENCY_OPTIONS: { value: CashflowFrequency | ''; label: string }[] = [
    { value: '', label: 'None (disabled)' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annually', label: 'Semi-Annually' },
    { value: 'annually', label: 'Annually' },
]

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Props for strategy selection card */
interface StrategyCardProps {
    id: string
    name: string
    subtitle: string
    selected: boolean
    disabled: boolean
    colorScheme: 'purple' | 'cyan'
    isDark: boolean
    onClick: () => void
}

/** Reusable strategy selection card */
const StrategyCard: React.FC<StrategyCardProps> = ({
    name,
    subtitle,
    selected,
    disabled,
    colorScheme,
    isDark,
    onClick
}) => {
    const colorClasses = {
        purple: {
            selected: isDark
                ? 'bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-500/30'
                : 'bg-purple-50 border-purple-300 ring-2 ring-purple-200',
            checkmark: isDark ? 'bg-purple-500' : 'bg-purple-600'
        },
        cyan: {
            selected: isDark
                ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30'
                : 'bg-cyan-50 border-cyan-300 ring-2 ring-cyan-200',
            checkmark: isDark ? 'bg-cyan-500' : 'bg-cyan-600'
        }
    }

    const baseClasses = isDark
        ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15]'
        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-3.5 rounded-lg border text-left transition-colors ${selected ? colorClasses[colorScheme].selected : baseClasses
                } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {name}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {subtitle}
                    </div>
                </div>
                {selected && (
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${colorClasses[colorScheme].checkmark}`}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
        </button>
    )
}

/** Loading spinner component */
const LoadingSpinner: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const StrategyCompareView: React.FC = () => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { isAuthenticated } = useAuth()

    // Fetch all saved strategies for selection (higher limit for compare view)
    // Only fetch when authenticated to avoid 401 errors
    const { data: strategiesData, isLoading: strategiesLoading } = useStrategies(
        { limit: 100 },
        { enabled: isAuthenticated }
    )
    const savedStrategies = strategiesData?.strategies || []

    // Persistent comparison state from context (survives page navigation)
    const {
        selectedStrategies,
        setSelectedStrategies,
        config,
        setConfig,
        showSelector,
        setShowSelector,
        isRunning,
        setIsRunning,
        dateAdjustment,
        setDateAdjustment,
        resetComparison,
    } = useComparison()

    // Local UI state (doesn't need to persist)
    // Default to 'templates' tab so unauthenticated users land on a usable tab
    const [activeTab, setActiveTab] = useState<'saved' | 'templates' | 'stocks'>('templates')
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
    const [stockTickerInput, setStockTickerInput] = useState('')

    // Prepare template strategies from presets
    const templateStrategies = useMemo<TemplateStrategy[]>(() =>
        Object.entries(ALLOCATION_PRESETS).map(([name, allocation]) => ({
            id: `template-${name}`,
            name,
            allocation
        })),
        []
    )

    // ==========================================================================
    // EVENT HANDLERS
    // ==========================================================================

    /**
     * Toggle strategy selection
     * Uses functional update to avoid stale closure issues
     */
    const toggleStrategy = useCallback((
        id: string,
        name: string,
        type: 'saved' | 'template',
        strategy?: SavedStrategy,
        templateKey?: string
    ) => {
        setSelectedStrategies(prev => {
            const alreadySelected = prev.some(s => s.id === id)

            if (alreadySelected) {
                return prev.filter(s => s.id !== id)
            }

            if (prev.length >= MAX_STRATEGIES) {
                return prev
            }

            const colorIndex = prev.length % STRATEGY_COLORS.length
            return [...prev, {
                id,
                name,
                type,
                color: STRATEGY_COLORS[colorIndex],
                strategy,
                templateKey,
                // Default to yearly rebalancing for templates
                rebalanceFrequency: type === 'template' ? 'yearly' : undefined
            }]
        })
    }, [])

    /**
     * Add an individual stock to comparison
     * Creates a 100% allocation strategy for the given ticker
     */
    const addStock = useCallback((ticker: string) => {
        const normalizedTicker = ticker.trim().toUpperCase()
        if (!normalizedTicker) return

        const stockId = `stock-${normalizedTicker}`

        setSelectedStrategies(prev => {
            // Check if already selected
            if (prev.some(s => s.id === stockId)) return prev

            // Check max strategies
            if (prev.length >= MAX_STRATEGIES) return prev

            const colorIndex = prev.length % STRATEGY_COLORS.length
            return [...prev, {
                id: stockId,
                name: normalizedTicker,
                type: 'stock' as const,
                color: STRATEGY_COLORS[colorIndex],
                ticker: normalizedTicker
            }]
        })

        setStockTickerInput('')
    }, [])

    /**
     * Update rebalancing frequency for a specific template strategy
     */
    const updateRebalanceFrequency = useCallback((id: string, frequency: RebalanceFrequency) => {
        setSelectedStrategies(prev =>
            prev.map(s =>
                s.id === id ? { ...s, rebalanceFrequency: frequency } : s
            )
        )
    }, [])

    /** Remove a specific strategy from selection */
    const removeStrategy = useCallback((id: string) => {
        setSelectedStrategies(prev => prev.filter(s => s.id !== id))
    }, [])

    /** Clear all selected strategies and reset to initial state */
    const clearAll = useCallback(() => {
        resetComparison()
    }, [resetComparison])

    /**
     * Extract all tickers from selected strategies
     * CLEAN API V4.0: Traverses allocations and their entry_conditions
     */
    const extractTickersFromStrategies = useCallback((): string[] => {
        const tickers = new Set<string>()

        // Helper to extract tickers from conditions (entry_condition)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extractFromCondition = (condition: any) => {
            if (!condition) return
            if (condition.symbol && typeof condition.symbol === 'string') {
                tickers.add(condition.symbol)
            }
            if (condition.left && typeof condition.left === 'object') {
                if (condition.left.symbol && typeof condition.left.symbol === 'string') {
                    tickers.add(condition.left.symbol)
                }
            }
            if (condition.right && typeof condition.right === 'object') {
                if (condition.right.symbol && typeof condition.right.symbol === 'string') {
                    tickers.add(condition.right.symbol)
                }
            }
            if (Array.isArray(condition.conditions)) {
                for (const c of condition.conditions) {
                    extractFromCondition(c)
                }
            }
        }

        for (const strat of selectedStrategies) {
            // Extract from saved strategy DSL
            if (strat.type === 'saved' && strat.strategy?.strategy_dsl) {
                const dsl = strat.strategy.strategy_dsl

                // Get tickers from allocations and their entry_conditions
                for (const alloc of Object.values(dsl.allocations || {})) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const allocObj = alloc as any
                    // Get tickers from allocation weights
                    const allocation = allocObj.allocation
                        ? (allocObj.allocation as Record<string, number>)
                        : (alloc as unknown as Record<string, number>)
                    for (const ticker of Object.keys(allocation)) {
                        tickers.add(ticker)
                    }
                    // CLEAN API V4.0: Get tickers from entry_condition
                    if (allocObj.entry_condition) {
                        extractFromCondition(allocObj.entry_condition)
                    }
                }
            }

            // Extract from template allocation
            if (strat.type === 'template' && strat.templateKey) {
                const allocation = ALLOCATION_PRESETS[strat.templateKey as keyof typeof ALLOCATION_PRESETS]
                if (allocation) {
                    for (const ticker of Object.keys(allocation)) {
                        tickers.add(ticker)
                    }
                }
            }

            // Extract from individual stock
            if (strat.type === 'stock' && strat.ticker) {
                tickers.add(strat.ticker)
            }
        }

        return Array.from(tickers)
    }, [selectedStrategies])

    /**
     * Run backtests for all selected strategies
     * Executes in parallel and updates state with results
     * First checks for earliest common date across all tickers
     */
    const runComparison = useCallback(async () => {
        if (selectedStrategies.length === 0) return

        setIsRunning(true)
        setShowSelector(false)
        setDateAdjustment(null)

        // Extract all tickers and find earliest common date
        const allTickers = extractTickersFromStrategies()
        let effectiveStartDate = config.startDate

        try {
            const dateInfo = await getEarliestCommonDate(allTickers)

            if (dateInfo.earliest_common_date && dateInfo.earliest_common_date > config.startDate) {
                // Need to adjust the start date
                effectiveStartDate = dateInfo.earliest_common_date
                setDateAdjustment({
                    adjusted: true,
                    originalDate: config.startDate,
                    adjustedDate: effectiveStartDate,
                    reason: `Data for all tickers only available from ${effectiveStartDate}`
                })
            }

            // Warn about missing tickers
            if (dateInfo.tickers_missing.length > 0) {
                console.warn('Some tickers were not found:', dateInfo.tickers_missing)
            }
        } catch (err) {
            console.warn('Could not fetch earliest common date, using selected date:', err)
        }

        const results = await Promise.all(
            selectedStrategies.map(async (strat) => {
                try {
                    // Build strategy object following the same pattern as useBacktestBuilder
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let strategyPayload: any

                    if (strat.type === 'saved' && strat.strategy?.strategy_dsl) {
                        const dsl = strat.strategy.strategy_dsl
                        const canvasState = strat.strategy.canvas_state

                        // ================================================================
                        // CLEAN API V4.0: Convert allocations with entry_conditions
                        // ================================================================
                        const apiAllocations: Record<string, AllocationWithRebalancing> = {}

                        if (dsl.allocations) {
                            Object.entries(dsl.allocations).forEach(([name, alloc]) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const allocAny = alloc as any
                                const allocation: AllocationWithRebalancing = {
                                    allocation: allocAny.allocation || alloc as unknown as Record<string, number>,
                                    rebalancing_frequency: allocAny.rebalancing_frequency || 'none'
                                }
                                // Pass through entry_condition if present
                                if (allocAny.entry_condition) {
                                    allocation.entry_condition = normalizeConditionFormat(allocAny.entry_condition)
                                }
                                apiAllocations[name] = allocation
                            })
                        }

                        // ================================================================
                        // Build allocation_order from canvas edges
                        // ================================================================
                        const allocationNames = Object.keys(apiAllocations)
                        const edges = canvasState?.edges || []
                        let allocationOrder: string[]

                        if (edges.length > 0) {
                            // Build adjacency map
                            const outgoingEdges = new Map<string, string>()
                            const hasIncoming = new Set<string>()

                            edges.forEach(edge => {
                                outgoingEdges.set(edge.source, edge.target)
                                hasIncoming.add(edge.target)
                            })

                            // Find chain start: node with outgoing edge but no incoming edge
                            const chainStarts = allocationNames.filter(name =>
                                outgoingEdges.has(name) && !hasIncoming.has(name)
                            )

                            // Walk the chain
                            allocationOrder = []
                            const visited = new Set<string>()
                            let current = chainStarts[0] || allocationNames.find(name => outgoingEdges.has(name)) || allocationNames[0]

                            while (current && !visited.has(current)) {
                                allocationOrder.push(current)
                                visited.add(current)
                                current = outgoingEdges.get(current) || ''
                            }

                            // Add remaining allocations not in the chain
                            allocationNames.forEach(name => {
                                if (!allocationOrder.includes(name)) {
                                    allocationOrder.push(name)
                                }
                            })
                        } else {
                            // No edges - use default order
                            allocationOrder = allocationNames
                        }

                        strategyPayload = {
                            allocations: apiAllocations,
                            fallback_allocation: dsl.fallback_allocation || Object.keys(dsl.allocations || {})[0] || '',
                            allocation_order: allocationOrder
                        }
                    } else if (strat.type === 'template' && strat.templateKey) {
                        const allocation = ALLOCATION_PRESETS[strat.templateKey as keyof typeof ALLOCATION_PRESETS]
                        // Templates need proper AllocationWithRebalancing structure
                        strategyPayload = {
                            allocations: {
                                'Main': {
                                    allocation: allocation,
                                    rebalancing_frequency: strat.rebalanceFrequency || 'yearly'
                                }
                            },
                            fallback_allocation: 'Main'
                        }
                    } else if (strat.type === 'stock' && strat.ticker) {
                        // Individual stock: 100% allocation in that ticker
                        strategyPayload = {
                            allocations: {
                                'Main': {
                                    allocation: { [strat.ticker]: 1.0 },
                                    rebalancing_frequency: 'none'
                                }
                            },
                            fallback_allocation: 'Main'
                        }
                    } else {
                        throw new Error('Invalid strategy configuration')
                    }

                    // Add cashflow to STRATEGY (not config) - matching useBacktestBuilder pattern
                    if (config.cashflowAmount !== null && config.cashflowAmount !== undefined && config.cashflowFrequency) {
                        strategyPayload.cashflow_amount = config.cashflowAmount
                        strategyPayload.cashflow_frequency = config.cashflowFrequency
                    }

                    // Build config object
                    // Stocks don't need rebalancing (single asset), templates use their setting, saved strategies use monthly
                    const backtestConfig: BacktestConfig = {
                        start_date: effectiveStartDate,
                        end_date: config.endDate,
                        initial_capital: config.initialCapital,
                        rebalance_frequency: strat.type === 'stock'
                            ? 'yearly'  // Doesn't matter for single asset, but required field
                            : strat.type === 'template'
                                ? (strat.rebalanceFrequency || 'yearly')
                                : 'monthly',
                    }

                    const result = await runBacktest({ strategy: strategyPayload, config: backtestConfig })

                    return {
                        ...strat,
                        result,
                        loading: false,
                        error: undefined
                    }
                } catch (err) {
                    return {
                        ...strat,
                        loading: false,
                        error: err instanceof Error ? err.message : 'Unknown error'
                    }
                }
            })
        )

        // Reassign colors to maintain consistency
        const resultsWithColors = results.map((r, idx) => ({
            ...r,
            color: STRATEGY_COLORS[idx % STRATEGY_COLORS.length]
        }))

        setSelectedStrategies(resultsWithColors)
        setIsRunning(false)
    }, [selectedStrategies, config, extractTickersFromStrategies])

    // ==========================================================================
    // COMPUTED VALUES
    // ==========================================================================

    const resultsReady = hasAllResults(selectedStrategies) && !isRunning

    const chartData = useMemo(() =>
        resultsReady ? preparePortfolioChartData(selectedStrategies) : [],
        [resultsReady, selectedStrategies]
    )

    const drawdownData = useMemo(() =>
        resultsReady ? prepareDrawdownChartData(chartData, selectedStrategies) : [],
        [resultsReady, chartData, selectedStrategies]
    )

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
        <div className="space-y-6">
            {/* Action buttons when strategies are selected */}
            {selectedStrategies.length > 0 && !showSelector && (
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setShowSelector(true)}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isDark
                            ? 'bg-white/[0.06] text-gray-200 hover:bg-white/[0.1] border border-white/[0.12]'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                            }`}
                    >
                        Modify Selection
                    </button>
                    <button
                        onClick={resetComparison}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isDark
                            ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                    >
                        Start New
                    </button>
                </div>
            )}

            {/* Strategy Selector Panel */}
            {showSelector && (
                <div className={`border rounded-xl overflow-hidden ${isDark
                    ? 'bg-white/[0.02] border-white/[0.1]'
                    : 'bg-white border-gray-200 shadow-sm'
                    }`}>
                    {/* Configuration & Actions - Moved above selection */}
                    <div className={`p-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}>
                        <div className="flex flex-col gap-4">
                            {/* Basic Settings Row */}
                            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
                                {/* Date Range Config */}
                                <div className="flex flex-wrap gap-3">
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={config.startDate}
                                            onChange={(e) => setConfig(c => ({ ...c, startDate: e.target.value }))}
                                            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${isDark
                                                ? 'bg-white/[0.04] border-white/[0.1] text-white hover:border-white/[0.2] focus:border-purple-500/50'
                                                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-purple-500 shadow-sm'
                                                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={config.endDate}
                                            onChange={(e) => setConfig(c => ({ ...c, endDate: e.target.value }))}
                                            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${isDark
                                                ? 'bg-white/[0.04] border-white/[0.1] text-white hover:border-white/[0.2] focus:border-purple-500/50'
                                                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-purple-500 shadow-sm'
                                                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Initial Capital
                                        </label>
                                        <div className="relative">
                                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>$</span>
                                            <input
                                                type="number"
                                                value={config.initialCapital}
                                                onChange={(e) => setConfig(c => ({ ...c, initialCapital: Number(e.target.value) }))}
                                                className={`pl-7 pr-3 py-2 rounded-lg text-sm border w-36 transition-colors ${isDark
                                                    ? 'bg-white/[0.04] border-white/[0.1] text-white hover:border-white/[0.2] focus:border-purple-500/50'
                                                    : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-purple-500 shadow-sm'
                                                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle Advanced Settings */}
                                <button
                                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${isDark
                                        ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <svg
                                        className={`w-4 h-4 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    Advanced Settings
                                    {(config.cashflowAmount && config.cashflowFrequency) && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-cyan-500'}`} />
                                    )}
                                </button>

                                {/* Action Buttons - inline */}
                                <div className="flex gap-2 lg:ml-auto">
                                    {selectedStrategies.length > 0 && (
                                        <button
                                            onClick={clearAll}
                                            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                                                ? 'text-gray-400 hover:text-gray-300'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                    <button
                                        onClick={runComparison}
                                        disabled={selectedStrategies.length < 2 || isRunning}
                                        className={`py-2.5 px-6 rounded-lg text-sm font-semibold transition-colors ${selectedStrategies.length < 2 || isRunning
                                            ? 'opacity-40 cursor-not-allowed'
                                            : ''
                                            } ${isDark
                                                ? 'bg-purple-500/15 text-purple-200 hover:bg-purple-500/25 border border-purple-500/40'
                                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow'
                                            }`}
                                    >
                                        {isRunning ? (
                                            <span className="flex items-center gap-2">
                                                <LoadingSpinner />
                                                Running...
                                            </span>
                                        ) : (
                                            `Compare ${selectedStrategies.length} Strategies`
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Settings Panel - Cashflow */}
                            {showAdvancedSettings && (
                                <div className={`p-4 rounded-xl border ${isDark
                                    ? 'bg-white/[0.02] border-white/[0.08]'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <div className="space-y-3 max-w-md">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${isDark
                                                ? 'bg-cyan-500/20'
                                                : 'bg-cyan-100'
                                                }`}>
                                                <svg className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Periodic Cashflow
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex-1 min-w-[120px]">
                                                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Amount
                                                </label>
                                                <div className="relative">
                                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${(config.cashflowAmount ?? 0) < 0
                                                        ? (isDark ? 'text-red-400' : 'text-red-600')
                                                        : (isDark ? 'text-cyan-400' : 'text-cyan-600')
                                                        }`}>$</span>
                                                    <input
                                                        type="number"
                                                        value={config.cashflowAmount ?? ''}
                                                        onChange={(e) => setConfig(c => ({
                                                            ...c,
                                                            cashflowAmount: e.target.value === '' ? null : Number(e.target.value)
                                                        }))}
                                                        placeholder="0"
                                                        className={`w-full pl-7 pr-3 py-2 rounded-lg text-sm border ${isDark
                                                            ? 'bg-white/[0.05] border-white/[0.15] text-white placeholder-gray-600'
                                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-[140px]">
                                                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Frequency
                                                </label>
                                                <select
                                                    value={config.cashflowFrequency ?? ''}
                                                    onChange={(e) => setConfig(c => ({
                                                        ...c,
                                                        cashflowFrequency: e.target.value === '' ? null : e.target.value as CashflowFrequency
                                                    }))}
                                                    className={`w-full px-3 py-2 rounded-lg text-sm border ${isDark
                                                        ? 'bg-white/[0.05] border-white/[0.15] text-white'
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                        }`}
                                                >
                                                    {CASHFLOW_FREQUENCY_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value} className={isDark ? 'bg-slate-800' : ''}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {(config.cashflowAmount ?? 0) > 0
                                                ? 'Contributions added to portfolio'
                                                : (config.cashflowAmount ?? 0) < 0
                                                    ? '📤 Withdrawals from portfolio'
                                                    : 'Use negative amounts for withdrawals'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tab Header */}
                    <div className={`p-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                {/* Templates Tab */}
                                <button
                                    onClick={() => setActiveTab('templates')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'templates'
                                        ? isDark
                                            ? 'bg-purple-500/15 text-purple-200 border border-purple-500/40'
                                            : 'bg-purple-600 text-white'
                                        : isDark
                                            ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Template Portfolios
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${activeTab === 'templates'
                                        ? 'bg-white/20'
                                        : isDark ? 'bg-white/[0.06]' : 'bg-gray-200'
                                        }`}>
                                        {templateStrategies.length}
                                    </span>
                                </button>

                                {/* Individual Stocks Tab */}
                                <button
                                    onClick={() => setActiveTab('stocks')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stocks'
                                        ? isDark
                                            ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
                                            : 'bg-emerald-600 text-white'
                                        : isDark
                                            ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Individual Stocks
                                </button>

                                {/* Saved Strategies Tab (last - requires login) */}
                                <button
                                    onClick={() => setActiveTab('saved')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'saved'
                                        ? isDark
                                            ? 'bg-purple-500/15 text-purple-200 border border-purple-500/40'
                                            : 'bg-purple-600 text-white'
                                        : isDark
                                            ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Saved Strategies
                                    {isAuthenticated && (
                                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${activeTab === 'saved'
                                            ? 'bg-white/20'
                                            : isDark ? 'bg-white/[0.06]' : 'bg-gray-200'
                                            }`}>
                                            {savedStrategies.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {selectedStrategies.length}/{MAX_STRATEGIES} selected
                            </div>
                        </div>
                    </div>

                    {/* Strategy Selection Area */}
                    <div className="p-4">
                        {activeTab === 'saved' && (
                            !isAuthenticated ? (
                                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Sign in to compare your saved strategies
                                    </p>
                                    <a
                                        href="/login"
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                                            ? 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/40'
                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                            }`}
                                    >
                                        Log in or Sign up
                                    </a>
                                </div>
                            ) : strategiesLoading ? (
                                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Loading strategies...
                                </div>
                            ) : savedStrategies.length === 0 ? (
                                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No saved strategies yet. Create some backtests first!
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {savedStrategies.map((strategy) => {
                                        const strategyId = strategy.strategy_id
                                        const selected = selectedStrategies.some(s => s.id === strategyId)
                                        const isDisabled = !selected && selectedStrategies.length >= MAX_STRATEGIES

                                        return (
                                            <div key={strategyId} className="w-auto">
                                                <StrategyCard
                                                    id={strategyId}
                                                    name={strategy.name}
                                                    subtitle={`${Object.keys(strategy.strategy_dsl?.allocations || {}).length} allocations`}
                                                    selected={selected}
                                                    disabled={isDisabled}
                                                    colorScheme="purple"
                                                    isDark={isDark}
                                                    onClick={() => toggleStrategy(strategyId, strategy.name, 'saved', strategy)}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        )}

                        {activeTab === 'templates' && (
                            <div className="flex flex-wrap gap-3">
                                {templateStrategies.map((template) => {
                                    const selectedStrategy = selectedStrategies.find(s => s.id === template.id)
                                    const selected = !!selectedStrategy
                                    const isDisabled = !selected && selectedStrategies.length >= MAX_STRATEGIES

                                    return (
                                        <div key={template.id} className="flex flex-col gap-2">
                                            <StrategyCard
                                                id={template.id}
                                                name={template.name}
                                                subtitle={Object.keys(template.allocation).join(', ')}
                                                selected={selected}
                                                disabled={isDisabled}
                                                colorScheme="cyan"
                                                isDark={isDark}
                                                onClick={() => toggleStrategy(template.id, template.name, 'template', undefined, template.name)}
                                            />
                                            {/* Rebalance frequency selector when template is selected */}
                                            {selected && (
                                                <div className="flex items-center gap-2 px-3">
                                                    <label className={`text-xs whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Rebalance:
                                                    </label>
                                                    <select
                                                        value={selectedStrategy?.rebalanceFrequency || 'yearly'}
                                                        onChange={(e) => {
                                                            e.stopPropagation()
                                                            updateRebalanceFrequency(template.id, e.target.value as RebalanceFrequency)
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`flex-1 px-2 py-1 rounded text-xs border ${isDark
                                                            ? 'bg-white/[0.05] border-cyan-500/30 text-cyan-300 focus:border-cyan-500/50'
                                                            : 'bg-white border-cyan-300 text-cyan-700 focus:border-cyan-400'
                                                            } focus:outline-none`}
                                                    >
                                                        {REBALANCE_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {activeTab === 'stocks' && (
                            <div className="space-y-4">
                                {/* Ticker Input with Autocomplete */}
                                <div className="flex gap-2 max-w-lg">
                                    <div className="relative flex-1">
                                        <TickerSearchInput
                                            value={stockTickerInput}
                                            onChange={setStockTickerInput}
                                            onSubmit={(ticker) => addStock(ticker)}
                                            placeholder="Enter ticker symbol (e.g., AAPL, MSFT)"
                                            className={`w-full px-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 ${isDark
                                                ? 'focus:ring-emerald-500/30 focus:border-emerald-500/50'
                                                : 'focus:ring-emerald-200 focus:border-emerald-400'
                                                }`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => addStock(stockTickerInput)}
                                        disabled={!stockTickerInput.trim() || selectedStrategies.length >= MAX_STRATEGIES}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${!stockTickerInput.trim() || selectedStrategies.length >= MAX_STRATEGIES
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                            } ${isDark
                                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/50'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            }`}
                                    >
                                        Add Stock
                                    </button>
                                </div>

                                {/* Selected Stocks Display */}
                                {selectedStrategies.filter(s => s.type === 'stock').length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStrategies
                                            .filter(s => s.type === 'stock')
                                            .map((stock) => (
                                                <div
                                                    key={stock.id}
                                                    className={`flex items-center justify-between p-3 rounded-xl border ${isDark
                                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                                        : 'bg-emerald-50 border-emerald-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full"
                                                            style={{ backgroundColor: stock.color.stroke }}
                                                        />
                                                        <span className={`font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                                            {stock.ticker}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeStrategy(stock.id)}
                                                        className={`p-1 rounded-md transition-colors ${isDark
                                                            ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                                                            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                                                            }`}
                                                        aria-label={`Remove ${stock.ticker}`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <svg className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <p className="text-sm">Add individual stock tickers to compare their performance</p>
                                    </div>
                                )}

                                {/* Helper Text */}
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    💡 Add tickers to compare their performance. Each stock is a 100% buy-and-hold position.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Selected Preview */}
                    {selectedStrategies.length > 0 && (
                        <div className={`p-4 border-t ${isDark ? 'border-white/[0.1] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                            <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Selected for comparison:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedStrategies.map((s) => (
                                    <span
                                        key={s.id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                                        style={{
                                            backgroundColor: `${s.color.stroke}15`,
                                            borderColor: `${s.color.stroke}40`,
                                            color: s.color.stroke
                                        }}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: s.color.stroke }}
                                        />
                                        {s.name}
                                        {s.type === 'template' && s.rebalanceFrequency && (
                                            <span className="opacity-70">
                                                ({s.rebalanceFrequency})
                                            </span>
                                        )}
                                        {s.type === 'stock' && (
                                            <span className="opacity-70">
                                                (stock)
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeStrategy(s.id) }}
                                            className="ml-1 hover:opacity-70"
                                            aria-label={`Remove ${s.name}`}
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {isRunning && (
                <div className={`border rounded-xl p-12 text-center ${isDark
                    ? 'bg-white/[0.02] border-white/[0.1]'
                    : 'bg-white border-gray-200 shadow-sm'
                    }`}>
                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                            <LoadingSpinner className={`w-7 h-7 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        </div>
                        <div>
                            <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Running Backtests
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Analyzing {selectedStrategies.length} strategies
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Display */}
            {resultsReady && !showSelector && (
                <>
                    {/* Date Adjustment Notice */}
                    {dateAdjustment?.adjusted && (
                        <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}>
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm">
                                <span className="font-medium">Start date adjusted:</span>{' '}
                                The comparison period was adjusted from{' '}
                                <span className="font-mono">{dateAdjustment.originalDate}</span> to{' '}
                                <span className="font-mono font-medium">{dateAdjustment.adjustedDate}</span>{' '}
                                to ensure all tickers have available data for a fair comparison.
                            </div>
                        </div>
                    )}

                    {/* Strategy Legend */}
                    <div className={`backdrop-blur-xl border rounded-xl p-4 ${isDark
                        ? 'bg-white/[0.02] border-white/[0.15]'
                        : 'bg-white border-gray-200'
                        }`}>
                        <div className="flex flex-wrap items-center gap-4">
                            {selectedStrategies.map((s) => (
                                <div key={s.id} className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: s.color.stroke }}
                                    />
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {s.name}
                                    </span>
                                    {s.error && (
                                        <span className="text-xs text-red-500">(Error)</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <ComparisonMetricsTable strategies={selectedStrategies} />

                    {/* Yearly Returns Comparison */}
                    <ComparisonYearlyReturnsTable strategies={selectedStrategies} />

                    {/* Charts */}
                    <ComparisonChart data={chartData} strategies={selectedStrategies} />
                    <ComparisonDrawdownChart data={drawdownData} strategies={selectedStrategies} />
                </>
            )}

            {/* Empty State - shown when no strategies selected */}
            {!showSelector && selectedStrategies.length < 2 && !isRunning && (
                <div className={`border rounded-xl p-12 text-center ${isDark
                    ? 'bg-white/[0.02] border-white/[0.1]'
                    : 'bg-white border-gray-200 shadow-sm'
                    }`}>
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                        <svg className={`w-7 h-7 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Add Strategies to Compare
                    </h3>
                    <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Select at least 2 strategies to compare their performance side-by-side
                    </p>
                    <button
                        onClick={() => setShowSelector(true)}
                        className={`py-2.5 px-6 rounded-lg text-sm font-semibold transition-colors ${isDark
                            ? 'bg-purple-500/15 text-purple-200 hover:bg-purple-500/25 border border-purple-500/40'
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow'
                            }`}
                    >
                        Select Strategies
                    </button>
                </div>
            )}
        </div>
    )
}

// Re-export types for convenience
export type { ComparisonStrategy } from './comparison'
