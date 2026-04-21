import React, { useState } from 'react'
import type { FullOptimizerResults } from '../../../../../types/strategy'
import type { CanvasState } from '../types'
import { mergeRulesIntoStrategy, safeNum, formatPercent, formatChange } from '../utils'

// LocalStorage key for passing optimized strategy to new window
const OPTIMIZED_STRATEGY_KEY = 'backfolio_optimized_strategy_new_window'

export interface FullResultsSectionProps {
    isDark: boolean
    results: FullOptimizerResults
    originalStrategy?: Record<string, any>
    canvasState?: CanvasState
    onReset: () => void
    onLoadStrategy?: (dsl: Record<string, any>) => void
}

export const FullResultsSection: React.FC<FullResultsSectionProps> = ({
    isDark,
    results,
    originalStrategy,
    canvasState,
    onReset,
    onLoadStrategy
}) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (!results.optimized_dsl) return
        try {
            const jsonToCopy = mergeRulesIntoStrategy(originalStrategy, results.optimized_dsl as Record<string, any>, canvasState)
            const textToCopy = JSON.stringify(jsonToCopy, null, 2)

            try {
                await navigator.clipboard.writeText(textToCopy)
            } catch {
                const textArea = document.createElement('textarea')
                textArea.value = textToCopy
                textArea.style.position = 'fixed'
                textArea.style.left = '-9999px'
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleOpenInNewWindow = () => {
        if (!results.optimized_dsl) return
        try {
            const strategyToOpen = mergeRulesIntoStrategy(originalStrategy, results.optimized_dsl as Record<string, any>, canvasState)
            localStorage.setItem(OPTIMIZED_STRATEGY_KEY, JSON.stringify(strategyToOpen))
            const baseUrl = window.location.origin
            window.open(`${baseUrl}/backtest?loadOptimized=1`, '_blank')
        } catch (err) {
            console.error('Failed to open in new window:', err)
        }
    }

    if (!results.success) {
        return (
            <div className={`border rounded-lg p-6 text-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`w-10 h-10 mx-auto rounded flex items-center justify-center mb-3 ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    Optimization Could Not Complete
                </h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Unable to find improvements for your strategy.
                </p>
                <button onClick={onReset} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Try Again
                </button>
            </div>
        )
    }

    const { summary, phase1_rules, phase2_allocations, metadata } = results

    return (
        <div className="space-y-6">
            {/* Summary Banner */}
            <div className={`border rounded-lg p-5 ${summary.total_improvement === 'significant'
                ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                : summary.total_improvement === 'moderate'
                    ? isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                    : isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                }`}>
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${summary.total_improvement === 'significant'
                        ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                        : summary.total_improvement === 'moderate'
                            ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                            : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                        }`}>
                        {summary.total_improvement === 'significant' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        ) : summary.total_improvement === 'moderate' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {summary.total_improvement === 'significant' ? 'Significant Improvement!' :
                                summary.total_improvement === 'moderate' ? 'Improvement Found' :
                                    'Original Strategy Optimal'}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {summary.recommendation}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {summary.rules_discovered && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                    ✓ Rules Discovered
                                </span>
                            )}
                            {summary.rules_improved && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                    ✓ Rules Improved
                                </span>
                            )}
                            {summary.allocations_improved && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                                    ✓ Allocations Improved
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase 1: Rules Discovery Results */}
            {phase1_rules && phase1_rules.success && (
                <div className={`border rounded-lg p-5 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                            1
                        </div>
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Rules Discovery
                            {phase1_rules.improved ? (
                                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-600'}`}>
                                    Improved
                                </span>
                            ) : (
                                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                    No improvement
                                </span>
                            )}
                        </h4>
                    </div>

                    {/* Show discovered rule if there's an improvement */}
                    {phase1_rules.improved && (phase1_rules.discovered_rule || phase1_rules.discovered_rules) && (
                        <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                            <h5 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Discovered Rules:</h5>

                            {/* Multi-portfolio rules */}
                            {phase1_rules.discovered_rules && Object.entries(phase1_rules.discovered_rules)
                                .filter(([, ruleData]: [string, any]) => ruleData.is_used)
                                .map(([portfolioName, ruleData]: [string, any]) => (
                                    <div key={portfolioName} className={`mb-3 last:mb-0`}>
                                        <div className={`font-mono text-sm p-2 rounded ${isDark ? 'bg-black/30 text-blue-300' : 'bg-white text-blue-700'}`}>
                                            {ruleData.human_readable}
                                        </div>
                                        <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            → Use portfolio: <strong>{portfolioName}</strong>
                                        </div>
                                    </div>
                                ))}

                            {/* Single rule */}
                            {phase1_rules.discovered_rule && !phase1_rules.discovered_rules && (
                                <div className={`font-mono text-sm p-2 rounded ${isDark ? 'bg-black/30 text-blue-300' : 'bg-white text-blue-700'}`}>
                                    {phase1_rules.discovered_rule.human_readable}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Performance comparison */}
                    {phase1_rules.optimized && phase1_rules.baselines && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                                <div className={`text-xs uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sharpe</div>
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {safeNum(phase1_rules.optimized.sharpe_ratio).toFixed(2)}
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                                <div className={`text-xs uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>CAGR</div>
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatPercent(safeNum(phase1_rules.optimized.cagr))}
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                                <div className={`text-xs uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Max DD</div>
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {(safeNum(phase1_rules.optimized.max_drawdown) * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Phase 2: Allocation Optimization Results */}
            {phase2_allocations && (
                <div className={`border rounded-lg p-5 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                            2
                        </div>
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Allocation Optimization
                            {phase2_allocations.skipped ? (
                                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                    Skipped
                                </span>
                            ) : phase2_allocations.improved ? (
                                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-600'}`}>
                                    Improved
                                </span>
                            ) : (
                                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                    No improvement
                                </span>
                            )}
                        </h4>
                    </div>

                    {phase2_allocations.skipped ? (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {phase2_allocations.reason || 'Single-asset portfolios don\'t require weight optimization.'}
                        </p>
                    ) : phase2_allocations.parameter_changes && phase2_allocations.parameter_changes.length > 0 ? (
                        <div className="space-y-3">
                            <h5 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Weight Changes:</h5>
                            <div className="space-y-2">
                                {phase2_allocations.parameter_changes.map((change, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                                        <div>
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{change.name}</span>
                                            {change.allocation && (
                                                <span className={`ml-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({change.allocation})</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{change.original}</span>
                                            <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{change.optimized}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${change.percent_change >= 0 ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-600' : isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'}`}>
                                                {formatChange(change.percent_change)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            No weight changes needed - current allocations are already optimal.
                        </p>
                    )}

                    {/* Monte Carlo Validation */}
                    {phase2_allocations.monte_carlo_validation && !phase2_allocations.skipped && (
                        <div className={`mt-4 p-3 rounded-lg ${phase2_allocations.monte_carlo_validation.is_robust
                            ? isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                            : isDark ? 'bg-amber-500/10' : 'bg-amber-50'
                            }`}>
                            <div className="flex items-center gap-2">
                                {phase2_allocations.monte_carlo_validation.is_robust ? (
                                    <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Monte Carlo: {phase2_allocations.monte_carlo_validation.is_robust ? 'Robust' : 'Caution'}
                                </span>
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Validated across {phase2_allocations.monte_carlo_validation.simulations} scenarios ({phase2_allocations.monte_carlo_validation.projection_years} years)
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Combined Validation Status */}
            {(phase1_rules?.validation || phase2_allocations?.validation) && (
                <div className={`border rounded-lg p-5 ${(phase1_rules?.validation?.is_robust !== false && phase2_allocations?.validation?.is_robust !== false)
                    ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                    : isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${(phase1_rules?.validation?.is_robust !== false && phase2_allocations?.validation?.is_robust !== false)
                            ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                            : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {(phase1_rules?.validation?.is_robust !== false && phase2_allocations?.validation?.is_robust !== false) ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className={`font-bold ${(phase1_rules?.validation?.is_robust !== false && phase2_allocations?.validation?.is_robust !== false)
                                ? isDark ? 'text-emerald-300' : 'text-emerald-900'
                                : isDark ? 'text-amber-300' : 'text-amber-900'
                                }`}>
                                {(phase1_rules?.validation?.is_robust !== false && phase2_allocations?.validation?.is_robust !== false)
                                    ? 'Validation Passed'
                                    : 'Overfitting Warning'}
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                70/30 holdout + Monte Carlo validation
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Rules Holdout */}
                        {phase1_rules?.validation && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Rules Holdout
                                </div>
                                <div className={`text-lg font-bold ${phase1_rules.validation.holdout_is_robust !== false
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {phase1_rules.validation.holdout_is_robust !== false ? '✓ Pass' : '✗ Fail'}
                                </div>
                            </div>
                        )}

                        {/* Rules Overfitting */}
                        {phase1_rules?.validation?.overfitting_score !== undefined && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Rules Overfitting
                                </div>
                                <div className={`text-lg font-bold ${phase1_rules.validation.overfitting_score < 0.3
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : phase1_rules.validation.overfitting_score < 0.5
                                        ? isDark ? 'text-amber-400' : 'text-amber-600'
                                        : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {(phase1_rules.validation.overfitting_score * 100).toFixed(0)}%
                                </div>
                            </div>
                        )}

                        {/* Allocations Holdout */}
                        {phase2_allocations?.validation && !phase2_allocations.skipped && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Alloc Holdout
                                </div>
                                <div className={`text-lg font-bold ${phase2_allocations.validation.holdout_is_robust !== false
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {phase2_allocations.validation.holdout_is_robust !== false ? '✓ Pass' : '✗ Fail'}
                                </div>
                            </div>
                        )}

                        {/* Allocations Overfitting */}
                        {phase2_allocations?.validation?.overfitting_score !== undefined && !phase2_allocations.skipped && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Alloc Overfitting
                                </div>
                                <div className={`text-lg font-bold ${phase2_allocations.validation.overfitting_score < 0.3
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : phase2_allocations.validation.overfitting_score < 0.5
                                        ? isDark ? 'text-amber-400' : 'text-amber-600'
                                        : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {(phase2_allocations.validation.overfitting_score * 100).toFixed(0)}%
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Metadata */}
            <div className={`flex flex-wrap items-center justify-center gap-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/30 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Rules: {metadata.n_rules_trials} trials
                </span>
                {metadata.has_multi_asset_portfolio && (
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Allocations: {metadata.n_allocations_trials} trials
                    </span>
                )}
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Completed in {metadata.elapsed_seconds}s
                </span>
            </div>

            {/* Action Buttons */}
            {results.optimized_dsl && (
                <div className="space-y-2">
                    {onLoadStrategy && (
                        <button
                            onClick={() => {
                                const strategyToLoad = mergeRulesIntoStrategy(originalStrategy, results.optimized_dsl as Record<string, any>, canvasState)
                                onLoadStrategy(strategyToLoad)
                            }}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isDark
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            Load Optimized Strategy
                        </button>
                    )}
                    <button
                        onClick={handleOpenInNewWindow}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isDark
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Window
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border ${copied
                            ? isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-700'
                            : isDark ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {copied ? 'Copied!' : 'Copy JSON'}
                    </button>
                </div>
            )}

            <button
                onClick={onReset}
                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
            >
                Run New Optimization
            </button>
        </div>
    )
}

