import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react'
import { useTheme } from '../../../../context/ThemeContext'
import { useAuth } from '../../../../context/AuthContext'
import {
    startOptimizerRun,
    streamOptimizerProgress,
    startRulesOptimizerRun,
    streamRulesOptimizerProgress,
    startFullOptimizerRun,
    streamFullOptimizerProgress
} from '../../../../services/api'
import type { OptimizerStatusResponse, RulesOptimizerStatusResponse, FullOptimizerStatusResponse, OptimizationObjective } from '../../../../types/strategy'
import type { StrategyOptimizerTabProps, ViewState, OptimizerMode } from './types'
import { getAllocationsOptimizationTime, getRulesOptimizationTime, getFullOptimizationTime } from './constants'
import { analyzeStrategy } from './utils'
import { ModeSelector, ErrorSection } from './components'
import {
    AllocationsConfigSection,
    AllocationsResultsSection,
    RulesConfigSection,
    RulesResultsSection,
    FullConfigSection,
    FullResultsSection,
    ProgressSection
} from './sections'

const StrategyOptimizerTabComponent: React.FC<StrategyOptimizerTabProps> = ({
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
    const { isAuthenticated, login } = useAuth()

    // Analyze strategy to determine available modes
    const strategyInfo = useMemo(() => analyzeStrategy(strategyDsl), [strategyDsl])

    // State
    const [view, setViewLocal] = useState<ViewState>(persistedState?.view ?? 'config')
    const [mode, setMode] = useState<OptimizerMode>(persistedState?.mode ?? strategyInfo.recommendedMode)
    const [allocationsJobId, setAllocationsJobId] = useState<string | null>(null)
    const [rulesJobId, setRulesJobId] = useState<string | null>(null)
    const [fullJobId, setFullJobId] = useState<string | null>(null)
    const [allocationsStatus, setAllocationsStatus] = useState<OptimizerStatusResponse | null>(persistedState?.allocationsStatus ?? null)
    const [rulesStatus, setRulesStatus] = useState<RulesOptimizerStatusResponse | null>(persistedState?.rulesStatus ?? null)
    const [fullStatus, setFullStatus] = useState<FullOptimizerStatusResponse | null>(null)
    const [error, setErrorLocal] = useState<string | null>(persistedState?.error ?? null)

    // Allocations optimizer config
    const [allocationsTrials, setAllocationsTrials] = useState(50)
    const [allocationsObjective, setAllocationsObjective] = useState<OptimizationObjective>('sortino')

    // Rules optimizer config (simplified - auto mode)
    const [maxConditions, setMaxConditions] = useState<1 | 2 | 3 | 4 | 5>(3)
    const [complexityPenalty, setComplexityPenalty] = useState(2) // 2% per condition (default)
    const [rulesTrials, setRulesTrials] = useState(100)
    const [rulesObjective, setRulesObjective] = useState<OptimizationObjective>('sortino')

    // Full optimizer config (uses same settings as individual modes)
    const [fullObjective, setFullObjective] = useState<OptimizationObjective>('sortino')

    // Ref for state change callback
    const onStateChangeRef = useRef(onStateChange)
    onStateChangeRef.current = onStateChange

    // SSE stream cleanup refs
    const closeAllocationsStreamRef = useRef<(() => void) | null>(null)
    const closeRulesStreamRef = useRef<(() => void) | null>(null)
    const closeFullStreamRef = useRef<(() => void) | null>(null)

    // Sync state to parent for persistence
    useEffect(() => {
        if (onStateChangeRef.current && (view === 'results' || view === 'error' || view === 'config')) {
            onStateChangeRef.current({ view, mode, allocationsStatus, rulesStatus, error })
        }
    }, [view, mode, allocationsStatus, rulesStatus, error])

    // Stream allocations optimizer progress
    useEffect(() => {
        if (!allocationsJobId || view !== 'progress') return

        let isCancelled = false

        // Close any existing stream before starting a new one (prevents race condition)
        if (closeAllocationsStreamRef.current) {
            closeAllocationsStreamRef.current()
            closeAllocationsStreamRef.current = null
        }

        const startStream = async () => {
            try {
                const closeStream = await streamOptimizerProgress(
                    allocationsJobId,
                    (status) => { if (!isCancelled) setAllocationsStatus(status) },
                    (status) => { if (!isCancelled) { setAllocationsStatus(status); setView('results') } },
                    (errorMsg) => { if (!isCancelled) { setErrorLocal(errorMsg); setView('error') } }
                )
                // Check if cancelled after async operation (effect may have re-run)
                if (isCancelled) {
                    closeStream()
                    return
                }
                closeAllocationsStreamRef.current = closeStream
            } catch (err: any) {
                if (!isCancelled) {
                    setErrorLocal(err.message || 'Failed to connect to server')
                    setView('error')
                }
            }
        }

        startStream()

        return () => {
            isCancelled = true
            if (closeAllocationsStreamRef.current) {
                closeAllocationsStreamRef.current()
                closeAllocationsStreamRef.current = null
            }
        }
    }, [allocationsJobId, view])

    // Stream rules optimizer progress
    useEffect(() => {
        if (!rulesJobId || view !== 'progress') return

        let isCancelled = false

        // Close any existing stream before starting a new one (prevents race condition)
        if (closeRulesStreamRef.current) {
            closeRulesStreamRef.current()
            closeRulesStreamRef.current = null
        }

        const startStream = async () => {
            try {
                const closeStream = await streamRulesOptimizerProgress(
                    rulesJobId,
                    (status) => { if (!isCancelled) setRulesStatus(status) },
                    (status) => { if (!isCancelled) { setRulesStatus(status); setView('results') } },
                    (errorMsg) => { if (!isCancelled) { setErrorLocal(errorMsg); setView('error') } }
                )
                // Check if cancelled after async operation (effect may have re-run)
                if (isCancelled) {
                    closeStream()
                    return
                }
                closeRulesStreamRef.current = closeStream
            } catch (err: any) {
                if (!isCancelled) {
                    setErrorLocal(err.message || 'Failed to connect to server')
                    setView('error')
                }
            }
        }

        startStream()

        return () => {
            isCancelled = true
            if (closeRulesStreamRef.current) {
                closeRulesStreamRef.current()
                closeRulesStreamRef.current = null
            }
        }
    }, [rulesJobId, view])

    // Stream full optimizer progress
    useEffect(() => {
        if (!fullJobId || view !== 'progress') return

        let isCancelled = false

        // Close any existing stream before starting a new one (prevents race condition)
        if (closeFullStreamRef.current) {
            closeFullStreamRef.current()
            closeFullStreamRef.current = null
        }

        const startStream = async () => {
            try {
                const closeStream = await streamFullOptimizerProgress(
                    fullJobId,
                    (status) => { if (!isCancelled) setFullStatus(status) },
                    (status) => { if (!isCancelled) { setFullStatus(status); setView('results') } },
                    (errorMsg) => { if (!isCancelled) { setErrorLocal(errorMsg); setView('error') } }
                )
                // Check if cancelled after async operation (effect may have re-run)
                if (isCancelled) {
                    closeStream()
                    return
                }
                closeFullStreamRef.current = closeStream
            } catch (err: any) {
                if (!isCancelled) {
                    setErrorLocal(err.message || 'Failed to connect to server')
                    setView('error')
                }
            }
        }

        startStream()

        return () => {
            isCancelled = true
            if (closeFullStreamRef.current) {
                closeFullStreamRef.current()
                closeFullStreamRef.current = null
            }
        }
    }, [fullJobId, view])

    // Helper to set view
    const setView = setViewLocal
    const setError = setErrorLocal

    // Start allocations optimization
    const handleStartAllocations = useCallback(async () => {
        setError(null)

        if (!strategyDsl || !strategyDsl.allocations || Object.keys(strategyDsl.allocations).length === 0) {
            setError('Strategy definition is required. Please ensure your strategy has at least one allocation defined.')
            setView('error')
            return
        }

        setView('progress')

        try {
            const response = await startOptimizerRun({
                strategy_dsl: strategyDsl,
                backtest_result: result,
                optimization_trials: allocationsTrials,
                optimization_objective: allocationsObjective
            })

            setAllocationsJobId(response.job_id)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start optimization')
            setView('error')
        }
    }, [strategyDsl, allocationsTrials, allocationsObjective, result])

    // Start rules optimization (auto mode)
    const handleStartRules = useCallback(async () => {
        setError(null)

        if (!strategyDsl || !strategyDsl.allocations || Object.keys(strategyDsl.allocations).length < 2) {
            setError('At least 2 portfolios are required for rules optimization.')
            setView('error')
            return
        }

        setView('progress')

        try {
            // Use auto mode - optimizer will try all configurations
            const response = await startRulesOptimizerRun({
                strategy_dsl: strategyDsl,
                backtest_result: result,
                optimization_mode: 'auto',
                n_trials: rulesTrials,
                max_conditions: maxConditions,
                complexity_penalty: complexityPenalty / 100, // Convert % to decimal
                objective: rulesObjective
            })

            setRulesJobId(response.job_id)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start rules optimization')
            setView('error')
        }
    }, [strategyDsl, result, rulesTrials, maxConditions, rulesObjective])

    // Start full optimization (rules + allocations)
    const handleStartFull = useCallback(async () => {
        setError(null)

        if (!strategyDsl || !strategyDsl.allocations || Object.keys(strategyDsl.allocations).length < 2) {
            setError('At least 2 portfolios are required for full optimization.')
            setView('error')
            return
        }

        setView('progress')

        try {
            const response = await startFullOptimizerRun({
                strategy_dsl: strategyDsl,
                backtest_result: result,
                n_rules_trials: rulesTrials,
                n_allocations_trials: allocationsTrials,
                max_conditions: maxConditions,
                complexity_penalty: complexityPenalty / 100,
                objective: fullObjective
            })

            setFullJobId(response.job_id)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start full optimization')
            setView('error')
        }
    }, [strategyDsl, result, rulesTrials, allocationsTrials, maxConditions, complexityPenalty, fullObjective])

    // Cancel
    const handleCancel = useCallback(() => {
        if (closeAllocationsStreamRef.current) {
            closeAllocationsStreamRef.current()
            closeAllocationsStreamRef.current = null
        }
        if (closeRulesStreamRef.current) {
            closeRulesStreamRef.current()
            closeRulesStreamRef.current = null
        }
        if (closeFullStreamRef.current) {
            closeFullStreamRef.current()
            closeFullStreamRef.current = null
        }
        setAllocationsJobId(null)
        setRulesJobId(null)
        setFullJobId(null)
        setAllocationsStatus(null)
        setRulesStatus(null)
        setFullStatus(null)
        setError(null)
        setView('config')
    }, [])

    // Reset
    const handleReset = useCallback(() => {
        setAllocationsJobId(null)
        setRulesJobId(null)
        setFullJobId(null)
        setAllocationsStatus(null)
        setRulesStatus(null)
        setFullStatus(null)
        setError(null)
        setView('config')
    }, [])

    const allocationsEstimatedTime = getAllocationsOptimizationTime(allocationsTrials)
    const rulesEstimatedTime = getRulesOptimizationTime(rulesTrials, strategyInfo.numPortfolios)
    const fullEstimatedTime = getFullOptimizationTime(rulesTrials, allocationsTrials)

    return (
        <div className="relative space-y-6">
            {/* Config View */}
            {view === 'config' && (
                <>
                    {/* Mode Selector */}
                    <div className={`border rounded-lg p-5 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <ModeSelector
                            isDark={isDark}
                            selectedMode={mode}
                            onModeChange={setMode}
                            strategyInfo={strategyInfo}
                        />
                    </div>

                    {/* Mode-specific Configuration */}
                    {mode === 'allocations' && (
                        <AllocationsConfigSection
                            isDark={isDark}
                            optimizationTrials={allocationsTrials}
                            onOptimizationTrialsChange={setAllocationsTrials}
                            optimizationObjective={allocationsObjective}
                            onOptimizationObjectiveChange={setAllocationsObjective}
                            estimatedTime={allocationsEstimatedTime}
                            onStart={handleStartAllocations}
                            isAuthenticated={isAuthenticated}
                            onLogin={login}
                        />
                    )}

                    {mode === 'rules' && (
                        <RulesConfigSection
                            isDark={isDark}
                            strategyInfo={strategyInfo}
                            maxConditions={maxConditions}
                            onMaxConditionsChange={setMaxConditions}
                            complexityPenalty={complexityPenalty}
                            onComplexityPenaltyChange={setComplexityPenalty}
                            nTrials={rulesTrials}
                            onNTrialsChange={setRulesTrials}
                            objective={rulesObjective}
                            onObjectiveChange={setRulesObjective}
                            estimatedTime={rulesEstimatedTime}
                            onStart={handleStartRules}
                            isAuthenticated={isAuthenticated}
                            onLogin={login}
                        />
                    )}

                    {mode === 'full' && (
                        <FullConfigSection
                            isDark={isDark}
                            strategyInfo={strategyInfo}
                            maxConditions={maxConditions}
                            onMaxConditionsChange={setMaxConditions}
                            complexityPenalty={complexityPenalty}
                            onComplexityPenaltyChange={setComplexityPenalty}
                            rulesTrials={rulesTrials}
                            onRulesTrialsChange={setRulesTrials}
                            allocationsTrials={allocationsTrials}
                            onAllocationsTrialsChange={setAllocationsTrials}
                            objective={fullObjective}
                            onObjectiveChange={setFullObjective}
                            estimatedTime={fullEstimatedTime}
                            onStart={handleStartFull}
                            isAuthenticated={isAuthenticated}
                            onLogin={login}
                        />
                    )}
                </>
            )}

            {/* Progress View */}
            {view === 'progress' && (
                <ProgressSection
                    isDark={isDark}
                    mode={mode}
                    allocationsStatus={allocationsStatus}
                    rulesStatus={rulesStatus}
                    fullStatus={fullStatus}
                    onCancel={handleCancel}
                />
            )}

            {/* Results View */}
            {view === 'results' && (
                <>
                    {mode === 'allocations' && allocationsStatus?.results && (
                        <AllocationsResultsSection
                            isDark={isDark}
                            results={allocationsStatus.results}
                            originalStrategy={originalStrategy}
                            canvasState={canvasState}
                            onReset={handleReset}
                            onLoadStrategy={onLoadStrategy}
                        />
                    )}
                    {mode === 'rules' && rulesStatus?.results && (
                        <RulesResultsSection
                            isDark={isDark}
                            results={rulesStatus.results}
                            originalStrategy={originalStrategy}
                            canvasState={canvasState}
                            onReset={handleReset}
                            onLoadStrategy={onLoadStrategy}
                        />
                    )}
                    {mode === 'full' && fullStatus?.results && (
                        <FullResultsSection
                            isDark={isDark}
                            results={fullStatus.results}
                            originalStrategy={originalStrategy}
                            canvasState={canvasState}
                            onReset={handleReset}
                            onLoadStrategy={onLoadStrategy}
                        />
                    )}
                </>
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

export const StrategyOptimizerTab = memo(StrategyOptimizerTabComponent, (prevProps, nextProps) => {
    if (prevProps.result !== nextProps.result) return false
    if (prevProps.strategyId !== nextProps.strategyId) return false
    if (prevProps.strategyName !== nextProps.strategyName) return false
    if (prevProps.strategyDsl !== nextProps.strategyDsl) return false
    return true
})

