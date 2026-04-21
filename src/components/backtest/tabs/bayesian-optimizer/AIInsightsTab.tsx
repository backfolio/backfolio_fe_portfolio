import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useTheme } from '../../../../context/ThemeContext'
import { startOptimizerRun, streamOptimizerProgress } from '../../../../services/api'
import type { OptimizerStatusResponse } from '../../../../types/strategy'
import type { AIInsightsTabProps, ViewState, OptimizationObjective } from './types'
import { getOptimizationTime } from './constants'
import { ConfigSection, ProgressSection, ResultsSection } from './sections'
import { ErrorSection } from './components'

const AIInsightsTabComponent: React.FC<AIInsightsTabProps> = ({
    result,
    strategyId: _strategyId,
    strategyName: _strategyName = 'Current Strategy',
    strategyDsl,
    originalStrategy,
    canvasState,
    onLoadStrategy,
    persistedState,
    onStateChange
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Local state (initialized from persisted state if available)
    const [view, setViewLocal] = useState<ViewState>(persistedState?.view ?? 'config')
    const [jobId, setJobId] = useState<string | null>(null)
    const [status, setStatusLocal] = useState<OptimizerStatusResponse | null>(persistedState?.status ?? null)
    const [error, setErrorLocal] = useState<string | null>(persistedState?.error ?? null)

    // Ref to always have latest onStateChange callback (avoids stale closures in SSE handlers)
    const onStateChangeRef = useRef(onStateChange)
    onStateChangeRef.current = onStateChange

    // Sync to parent when state changes to results/error (the states we want to persist)
    useEffect(() => {
        if (onStateChangeRef.current && (view === 'results' || view === 'error' || view === 'config')) {
            onStateChangeRef.current({ view, status, error })
        }
    }, [view, status, error])

    // Wrapped setters for convenience
    const setView = setViewLocal
    const setStatus = setStatusLocal
    const setError = setErrorLocal

    // Optimizer config
    const [optimizationTrials, setOptimizationTrials] = useState(50)
    const [optimizationObjective, setOptimizationObjective] = useState<OptimizationObjective>('sortino')

    // SSE stream cleanup ref
    const closeStreamRef = useRef<(() => void) | null>(null)

    // Stream optimization progress via SSE (replaces polling)
    useEffect(() => {
        if (!jobId || view !== 'progress') return

        let isCancelled = false

        const startStream = async () => {
            try {
                const closeStream = await streamOptimizerProgress(
                    jobId,
                    // onProgress
                    (progressStatus) => {
                        if (!isCancelled) {
                            setStatus(progressStatus)
                        }
                    },
                    // onComplete
                    (completeStatus) => {
                        if (!isCancelled) {
                            setStatus(completeStatus)
                            setView('results')
                        }
                    },
                    // onError
                    (errorMessage) => {
                        if (!isCancelled) {
                            setError(errorMessage)
                            setView('error')
                        }
                    }
                )
                closeStreamRef.current = closeStream
            } catch (err: any) {
                if (!isCancelled) {
                    setError(err.message || 'Failed to connect to server')
                    setView('error')
                }
            }
        }

        startStream()

        return () => {
            isCancelled = true
            if (closeStreamRef.current) {
                closeStreamRef.current()
                closeStreamRef.current = null
            }
        }
    }, [jobId, view])

    // Start the optimization job using standalone endpoint
    const handleStart = useCallback(async () => {
        setError(null)

        // Validate we have strategy DSL with allocations
        if (!strategyDsl || !strategyDsl.allocations || Object.keys(strategyDsl.allocations).length === 0) {
            setError('Strategy definition is required for optimization. Please ensure your strategy has at least one allocation defined.')
            setView('error')
            return
        }

        setView('progress')

        try {
            // Use standalone optimizer endpoint - works with any strategy (saved or not)
            const response = await startOptimizerRun({
                strategy_dsl: strategyDsl,
                backtest_result: result,
                optimization_trials: optimizationTrials,
                optimization_objective: optimizationObjective
            })

            setJobId(response.job_id)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start optimization')
            setView('error')
        }
    }, [strategyDsl, optimizationTrials, optimizationObjective, result])

    // Cancel the job - close SSE stream and reset state
    const handleCancel = useCallback(async () => {
        // Close the SSE stream if it's open
        if (closeStreamRef.current) {
            closeStreamRef.current()
            closeStreamRef.current = null
        }
        setJobId(null)
        setStatus(null)
        setError(null)
        setView('config')
    }, [])

    // Reset to config
    const handleReset = useCallback(() => {
        setJobId(null)
        setStatus(null)
        setError(null)
        setView('config')
    }, [])

    const estimatedTime = getOptimizationTime(optimizationTrials)

    return (
        <div className="relative space-y-6">
            {/* Config View */}
            {view === 'config' && (
                <ConfigSection
                    isDark={isDark}
                    optimizationTrials={optimizationTrials}
                    onOptimizationTrialsChange={setOptimizationTrials}
                    optimizationObjective={optimizationObjective}
                    onOptimizationObjectiveChange={setOptimizationObjective}
                    estimatedTime={estimatedTime}
                    onStart={handleStart}
                />
            )}

            {/* Progress View */}
            {view === 'progress' && (
                <ProgressSection
                    isDark={isDark}
                    status={status}
                    onCancel={handleCancel}
                />
            )}

            {/* Results View */}
            {view === 'results' && status?.results && (
                <ResultsSection
                    isDark={isDark}
                    results={status.results}
                    originalStrategy={originalStrategy}
                    canvasState={canvasState}
                    onReset={handleReset}
                    onLoadStrategy={onLoadStrategy}
                />
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

export const AIInsightsTab = memo(AIInsightsTabComponent, (prevProps, nextProps) => {
    if (prevProps.result !== nextProps.result) return false
    if (prevProps.strategyId !== nextProps.strategyId) return false
    if (prevProps.strategyName !== nextProps.strategyName) return false
    if (prevProps.strategyDsl !== nextProps.strategyDsl) return false
    return true
})

