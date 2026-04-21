import React from 'react'
import type { ProgressSectionProps } from '../types'
import type { FullOptimizerStatusResponse, OptimizationBestMetrics } from '../../../../../types/strategy'

interface ExtendedProgressSectionProps extends ProgressSectionProps {
    fullStatus?: FullOptimizerStatusResponse | null
}

// Helper component for metric comparison
const MetricCard: React.FC<{
    label: string
    currentValue: number | null
    baselineValue: number
    format: 'percent' | 'ratio'
    isNegativeBetter?: boolean
    isDark: boolean
}> = ({ label, currentValue, baselineValue, format, isNegativeBetter = false, isDark }) => {
    const formatValue = (v: number) => {
        if (format === 'percent') return `${(v * 100).toFixed(1)}%`
        return v.toFixed(2)
    }
    
    const hasValue = currentValue !== null && !isNaN(currentValue)
    const improvement = hasValue ? currentValue - baselineValue : 0
    const improvementPct = hasValue && baselineValue !== 0 
        ? ((currentValue - baselineValue) / Math.abs(baselineValue)) * 100 
        : 0
    const isImproved = isNegativeBetter ? improvement < 0 : improvement > 0
    
    return (
        <div className={`flex flex-col p-3 rounded-lg ${isDark ? 'bg-gray-800/80' : 'bg-white'}`}>
            <span className={`text-[10px] uppercase tracking-wide font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {label}
            </span>
            <div className="flex items-baseline gap-2">
                <span className={`text-lg font-bold tabular-nums transition-all duration-300 ${
                    hasValue 
                        ? isImproved
                            ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                    {hasValue ? formatValue(currentValue) : '—'}
                </span>
                {hasValue && improvement !== 0 && (
                    <span className={`text-xs font-medium tabular-nums ${
                        isImproved
                            ? isDark ? 'text-emerald-400/80' : 'text-emerald-600'
                            : isDark ? 'text-red-400/80' : 'text-red-500'
                    }`}>
                        {isImproved ? '↑' : '↓'} {Math.abs(improvementPct).toFixed(0)}%
                    </span>
                )}
            </div>
            <span className={`text-[10px] tabular-nums mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                vs baseline: {formatValue(baselineValue)}
            </span>
        </div>
    )
}

// Live metrics display during optimization
const LiveMetricsDisplay: React.FC<{
    bestMetrics: OptimizationBestMetrics
    isDark: boolean
}> = ({ bestMetrics, isDark }) => {
    const { current_best, baseline, trials_completed, total_trials, current_rule } = bestMetrics
    
    return (
        <div className={`mt-6 border rounded-xl overflow-hidden ${isDark ? 'border-gray-700/50 bg-gradient-to-br from-gray-800/30 to-gray-900/30' : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white'}`}>
            {/* Header */}
            <div className={`px-4 py-2.5 border-b flex items-center justify-between ${isDark ? 'border-gray-700/50 bg-gray-800/40' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${current_best ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Best Strategy
                    </span>
                </div>
                <span className={`text-xs tabular-nums ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Trial {trials_completed}/{total_trials}
                </span>
            </div>
            
            {/* Metrics Grid */}
            <div className="p-3">
                <div className="grid grid-cols-3 gap-2">
                    <MetricCard
                        label="Sharpe"
                        currentValue={current_best?.sharpe ?? null}
                        baselineValue={baseline.sharpe}
                        format="ratio"
                        isDark={isDark}
                    />
                    <MetricCard
                        label="CAGR"
                        currentValue={current_best?.cagr ?? null}
                        baselineValue={baseline.cagr}
                        format="percent"
                        isDark={isDark}
                    />
                    <MetricCard
                        label="Max DD"
                        currentValue={current_best?.max_dd ?? null}
                        baselineValue={baseline.max_dd}
                        format="percent"
                        isNegativeBetter={true}
                        isDark={isDark}
                    />
                </div>
                
                {/* Current Best Rule Preview */}
                {current_rule && (
                    <div className={`mt-3 px-3 py-2 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
                        <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? 'text-blue-400/70' : 'text-blue-600/70'}`}>
                            Best Rule Found
                        </span>
                        <p className={`text-xs font-mono mt-1 truncate ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            {current_rule}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export const ProgressSection: React.FC<ExtendedProgressSectionProps> = ({
    isDark,
    mode,
    allocationsStatus,
    rulesStatus,
    fullStatus,
    onCancel
}) => {
    // Determine which status to show based on mode
    let progress = 0
    let message = 'Starting...'
    let currentPhase: 'rules' | 'allocations' | 'complete' = 'rules'
    let bestMetrics: OptimizationBestMetrics | undefined

    if (mode === 'full' && fullStatus) {
        progress = fullStatus.progress?.percent ?? 0
        message = fullStatus.progress?.message ?? 'Starting...'
        currentPhase = fullStatus.progress?.phase ?? 'rules'
        bestMetrics = fullStatus.progress?.best_metrics
        
        // Debug log
        if (bestMetrics) {
            console.log('[ProgressSection] Full mode - bestMetrics received:', bestMetrics)
        }
    } else if (mode === 'allocations' && allocationsStatus) {
        progress = allocationsStatus.progress?.percent ?? 0
        message = allocationsStatus.progress?.message ?? 'Starting...'
        currentPhase = 'allocations'
    } else if (mode === 'rules' && rulesStatus) {
        progress = rulesStatus.progress?.percent ?? 0
        message = rulesStatus.progress?.message ?? 'Starting...'
        currentPhase = 'rules'
        bestMetrics = rulesStatus.progress?.best_metrics
        
        // Debug log
        if (bestMetrics) {
            console.log('[ProgressSection] Rules mode - bestMetrics received:', bestMetrics)
        }
    }

    // For full mode, show phase indicators
    const isFullMode = mode === 'full'
    const phase1Complete = isFullMode && currentPhase !== 'rules'
    const phase2Active = isFullMode && currentPhase === 'allocations'

    return (
        <div className={`border rounded-lg p-6 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="text-center">
                {/* Header */}
                <div className="mb-5">
                    <h3 className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {mode === 'allocations' ? 'Optimizing Allocations' : 
                         mode === 'rules' ? 'Discovering Rules' : 
                         'Full Strategy Optimization'}
                    </h3>
                    <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {message}
                    </p>
                </div>

                {/* Two-Phase Indicator for Full Mode */}
                {isFullMode && (
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            !phase1Complete
                                ? isDark ? 'bg-blue-500/20 border border-blue-500/40' : 'bg-blue-100 border border-blue-300'
                                : isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
                        }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                !phase1Complete
                                    ? isDark ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-200 text-blue-700'
                                    : isDark ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-200 text-emerald-700'
                            }`}>
                                {phase1Complete ? '✓' : '1'}
                            </div>
                            <span className={`text-sm font-medium ${
                                !phase1Complete
                                    ? isDark ? 'text-blue-300' : 'text-blue-700'
                                    : isDark ? 'text-emerald-300' : 'text-emerald-700'
                            }`}>
                                Rules
                            </span>
                        </div>
                        <svg className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            phase2Active
                                ? isDark ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-purple-100 border border-purple-300'
                                : isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'
                        }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                phase2Active
                                    ? isDark ? 'bg-purple-500/30 text-purple-300' : 'bg-purple-200 text-purple-700'
                                    : isDark ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-500'
                            }`}>
                                2
                            </div>
                            <span className={`text-sm font-medium ${
                                phase2Active
                                    ? isDark ? 'text-purple-300' : 'text-purple-700'
                                    : isDark ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                                Allocations
                            </span>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="max-w-md mx-auto mb-5">
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                            className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {mode === 'full' 
                                ? currentPhase === 'rules' 
                                    ? 'Testing rule combinations...'
                                    : 'Optimizing allocations...'
                                : mode === 'rules' 
                                    ? 'Testing rule combinations...' 
                                    : 'Testing weight combinations...'}
                        </span>
                        <span className={`text-sm font-medium tabular-nums ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {progress}%
                        </span>
                    </div>
                </div>

                {/* Live Metrics Display */}
                {bestMetrics && bestMetrics.baseline && (
                    <div className="max-w-lg mx-auto">
                        <LiveMetricsDisplay bestMetrics={bestMetrics} isDark={isDark} />
                    </div>
                )}

                {/* Info Box - only show if no live metrics */}
                {!bestMetrics && (
                    <div className={`max-w-sm mx-auto p-3 rounded text-xs ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                        {mode === 'rules' ? (
                            <>Testing combinations of technical indicators to find the optimal switching rule.</>
                        ) : mode === 'allocations' ? (
                            <>Searching for the best asset weights.</>
                        ) : (
                            currentPhase === 'rules' ? (
                                <>Phase 1: Discovering optimal switching rules between portfolios.</>
                            ) : (
                                <>Phase 2: Fine-tuning asset weights within each portfolio.</>
                            )
                        )}
                    </div>
                )}

                {/* Cancel Button */}
                <button
                    onClick={onCancel}
                    className={`mt-5 px-5 py-2 rounded-lg font-medium transition-colors ${isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

