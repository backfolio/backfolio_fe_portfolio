import React, { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useTheme } from '../../../../context/ThemeContext'
import { useAuth } from '../../../../context/AuthContext'
import {
    startMonteCarloRun,
    API_BASE_URL,
    getAuthToken
} from '../../../../services/api'
import type { MonteCarloStatusResponse } from '../../../../types/strategy'
import type { MonteCarloTabProps, ViewState, CashflowConfig } from './types'
import { getEstimatedTime } from './constants'
import { ConfigSection, ProgressSection, ResultsSection } from './sections'
import { ErrorSection } from './components'

// Persisted state interface (lifted to parent for tab switch persistence)
interface MonteCarloPersistedState {
    view: ViewState
    status: MonteCarloStatusResponse | null
    error: string | null
}

interface ExtendedMonteCarloTabProps extends MonteCarloTabProps {
    persistedState?: MonteCarloPersistedState
    onStateChange?: (state: MonteCarloPersistedState) => void
    // Auto-start simulation with default parameters (75 sims × 10 years)
    autoStart?: boolean
}

const MonteCarloTabComponent: React.FC<ExtendedMonteCarloTabProps> = ({
    result,
    strategyName: _strategyName = 'Current Strategy',
    strategyDsl,
    persistedState,
    onStateChange,
    autoStart = false
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { isAuthenticated, login } = useAuth()

    // Local state (initialized from persisted state if available)
    const [view, setViewLocal] = useState<ViewState>(persistedState?.view ?? 'config')
    const [jobId, setJobId] = useState<string | null>(null)
    const [mcStatus, setMcStatusLocal] = useState<MonteCarloStatusResponse | null>(persistedState?.status ?? null)
    const [error, setErrorLocal] = useState<string | null>(persistedState?.error ?? null)

    // Ref to always have latest onStateChange callback (avoids stale closures in SSE handlers)
    const onStateChangeRef = useRef(onStateChange)
    onStateChangeRef.current = onStateChange

    // Sync to parent when state changes to results/error (the states we want to persist)
    useEffect(() => {
        if (onStateChangeRef.current && (view === 'results' || view === 'error' || view === 'config')) {
            onStateChangeRef.current({ view, status: mcStatus, error })
        }
    }, [view, mcStatus, error])

    // Wrapped setters for convenience
    const setView = setViewLocal
    const setMcStatus = setMcStatusLocal
    const setError = setErrorLocal

    // Monte Carlo config
    // Default to 75 sims - with smart sampling, this provides equivalent accuracy to 100+ random sims
    const [simulations, setSimulations] = useState(75)
    const [projectionYears, setProjectionYears] = useState(10)

    // Initial capital - default from backtest result or 100k
    const defaultInitialCapital = result.result?.metrics?.initial_capital ?? 100000
    const [initialCapital, setInitialCapital] = useState(defaultInitialCapital)

    // Cashflow configuration (optional)
    const [cashflowConfig, setCashflowConfig] = useState<CashflowConfig>({
        enabled: false,
        amount: 500,
        frequency: 'monthly'
    })

    // EventSource ref for SSE connection
    const eventSourceRef = useRef<EventSource | null>(null)

    // SSE streaming for real-time progress updates (always use standalone endpoint)
    useEffect(() => {
        if (!jobId || view !== 'progress') return

        let isCancelled = false

        const connectSSE = async () => {
            try {
                // Get auth token if available (optional for anonymous users)
                const token = await getAuthToken()

                // Close any existing connection
                if (eventSourceRef.current) {
                    eventSourceRef.current.close()
                }

                // Create SSE connection with token as query parameter (if available)
                const streamUrl = token
                    ? `${API_BASE_URL}/api/v1/monte-carlo/${jobId}/stream?token=${encodeURIComponent(token)}`
                    : `${API_BASE_URL}/api/v1/monte-carlo/${jobId}/stream`
                const eventSource = new EventSource(streamUrl)
                eventSourceRef.current = eventSource

                eventSource.onmessage = (event) => {
                    if (isCancelled) return

                    try {
                        const data = JSON.parse(event.data)

                        // Handle 'not_found' status (job completed/expired)
                        if (data.status === 'not_found') {
                            setError(data.error || 'Job not found')
                            setView('error')
                            eventSource.close()
                            eventSourceRef.current = null
                            return
                        }

                        setMcStatus(data as MonteCarloStatusResponse)

                        if (data.status === 'complete') {
                            setView('results')
                            eventSource.close()
                            eventSourceRef.current = null
                        } else if (data.status === 'failed') {
                            setError(data.error || 'Simulation failed')
                            setView('error')
                            eventSource.close()
                            eventSourceRef.current = null
                        }
                    } catch (parseError) {
                        console.error('Failed to parse SSE data:', parseError)
                    }
                }

                eventSource.onerror = () => {
                    if (isCancelled) return
                    console.error('SSE connection error')
                    eventSource.close()
                    eventSourceRef.current = null
                    setError('Connection lost. Please try again.')
                    setView('error')
                }
            } catch (err) {
                if (!isCancelled) {
                    setError('Failed to connect to progress stream')
                    setView('error')
                }
            }
        }

        connectSSE()

        return () => {
            isCancelled = true
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
                eventSourceRef.current = null
            }
        }
    }, [jobId, view])

    // Start the Monte Carlo simulation (always uses standalone endpoint with SSE)
    const handleStart = useCallback(async () => {
        setError(null)

        try {
            // Validate we have strategy DSL with allocations
            if (!strategyDsl || !strategyDsl.allocations || Object.keys(strategyDsl.allocations).length === 0) {
                setError('Strategy definition is required for Monte Carlo simulation. Please ensure your strategy has at least one allocation defined.')
                setView('error')
                return
            }

            setView('progress')

            // CLEAN API V4.0: Build allocation_order from canvas edges
            const allocationNames = Object.keys(strategyDsl.allocations || {})
            const edges = strategyDsl.canvas_edges || []
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

            // CLEAN API V4.0: entry_condition is embedded in allocations
            // Just clean up canvas-only fields
            const cleanedStrategyDsl = {
                ...strategyDsl,
                allocation_order: allocationOrder,
                // Remove canvas-only fields that shouldn't go to API
                canvas_edges: undefined,
                canvas_positions: undefined,
                canvas_viewport: undefined
            }

            // Always use standalone Monte Carlo endpoint (with SSE for progress)
            // Include cashflow parameters if enabled
            const requestParams: Parameters<typeof startMonteCarloRun>[0] = {
                strategy_dsl: cleanedStrategyDsl,
                initial_capital: initialCapital,
                n_simulations: simulations,
                projection_years: projectionYears,
                // Force refresh cache when cashflow is configured to ensure new timing logic is used
                force_refresh: cashflowConfig.enabled
            }

            // Add cashflow configuration if enabled
            if (cashflowConfig.enabled && cashflowConfig.frequency) {
                requestParams.cashflow_amount = cashflowConfig.amount
                requestParams.cashflow_frequency = cashflowConfig.frequency
            }

            const response = await startMonteCarloRun(requestParams)

            // Check if we got a cached result (instant response)
            if (response.cached && response.results) {
                console.log('Monte Carlo cache hit - using cached results')

                // Fast transition for cached results - instant display
                setMcStatus({
                    job_id: response.job_id,
                    status: 'complete',
                    progress: { percent: 100, message: 'Loaded from cache' },
                    results: response.results
                })

                // Minimal delay for visual feedback (150ms feels instant but acknowledged)
                await new Promise(resolve => setTimeout(resolve, 150))
                setView('results')
                return
            }

            // SSE will handle progress streaming for non-cached runs
            setJobId(response.job_id)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start simulation')
            setView('error')
        }
    }, [simulations, projectionYears, initialCapital, strategyDsl, cashflowConfig])

    // Cancel the job
    const handleCancel = useCallback(() => {
        // Close SSE connection if active
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }

        setJobId(null)
        setMcStatus(null)
        setError(null)
        setView('config')
    }, [])

    // Reset to config
    const handleReset = useCallback(() => {
        // Close SSE connection if active
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }
        setJobId(null)
        setMcStatus(null)
        setError(null)
        setView('config')
    }, [])

    // Track if we've already auto-started to prevent double starts
    const hasAutoStarted = useRef(false)

    // Auto-start simulation when autoStart prop is true (triggered from toolbar button)
    useEffect(() => {
        if (autoStart && !hasAutoStarted.current && view === 'config' && !persistedState?.status) {
            hasAutoStarted.current = true
            // Small delay to ensure component is fully mounted
            const timeoutId = setTimeout(() => {
                handleStart()
            }, 100)
            return () => clearTimeout(timeoutId)
        }
    }, [autoStart, view, persistedState?.status, handleStart])

    const estimatedTime = getEstimatedTime(simulations, projectionYears)

    return (
        <div className="relative space-y-6">
            {/* Config View */}
            {view === 'config' && (
                <ConfigSection
                    isDark={isDark}
                    simulations={simulations}
                    onSimulationsChange={setSimulations}
                    projectionYears={projectionYears}
                    onProjectionYearsChange={setProjectionYears}
                    estimatedTime={estimatedTime}
                    onStart={handleStart}
                    isAuthenticated={isAuthenticated}
                    onLogin={login}
                    initialCapital={initialCapital}
                    onInitialCapitalChange={setInitialCapital}
                    defaultInitialCapital={defaultInitialCapital}
                    cashflowConfig={cashflowConfig}
                    onCashflowConfigChange={setCashflowConfig}
                />
            )}

            {/* Progress View */}
            {view === 'progress' && (
                <ProgressSection
                    isDark={isDark}
                    progress={{
                        step: mcStatus?.status ?? 'pending',
                        percent: mcStatus?.progress?.percent ?? 0,
                        message: mcStatus?.progress?.message ?? 'Starting simulation...'
                    }}
                    onCancel={handleCancel}
                />
            )}

            {/* Results View */}
            {view === 'results' && (
                (() => {
                    const mcResults = mcStatus?.results
                    if (!mcResults) return null
                    return (
                        <ResultsSection
                            isDark={isDark}
                            results={mcResults}
                            onReset={handleReset}
                        />
                    )
                })()
            )}

            {/* Error View */}
            {view === 'error' && (
                <ErrorSection
                    isDark={isDark}
                    error={error || 'Unknown error'}
                    onRetry={handleReset}
                />
            )}
        </div>
    )
}

export const MonteCarloTab = memo(MonteCarloTabComponent, (prevProps, nextProps) => {
    if (prevProps.result !== nextProps.result) return false
    if (prevProps.strategyName !== nextProps.strategyName) return false
    if (prevProps.strategyDsl !== nextProps.strategyDsl) return false
    return true
})
