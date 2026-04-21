import React, { useState } from 'react'
import type { RulesResultsSectionProps } from '../types'
import { mergeRulesIntoStrategy, safeNum, formatPercent, formatChange } from '../utils'

// LocalStorage key for passing optimized strategy to new window
const OPTIMIZED_STRATEGY_KEY = 'backfolio_optimized_strategy_new_window'

export const RulesResultsSection: React.FC<RulesResultsSectionProps> = ({
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
                    Rules Discovery Could Not Complete
                </h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {results.diagnostics?.issues?.[0]?.description || 'Unable to find beneficial switching rules.'}
                </p>
                <button onClick={onReset} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Try Again
                </button>
            </div>
        )
    }

    // Extract metrics
    const { optimized, baselines, validation, discovered_rule } = results

    const optSharpe = safeNum(optimized?.sharpe_ratio)
    const optCagr = safeNum(optimized?.cagr)
    const optMaxDD = safeNum(optimized?.max_drawdown)

    // Get the original strategy baseline for comparison (always use original, not "best")
    const baselineEntries = Object.entries(baselines || {})
    // Prioritize: original > original_strategy > buyhold_default > first available
    const originalBaseline = (baselines as Record<string, any>)?.original
        || (baselines as Record<string, any>)?.original_strategy
        || (baselines as Record<string, any>)?.buyhold_default
        || (baselineEntries.length > 0 ? baselineEntries[0][1] : null)

    const baselineSharpe = safeNum(originalBaseline?.sharpe_ratio)
    const baselineCagr = safeNum(originalBaseline?.cagr)
    const baselineMaxDD = safeNum(originalBaseline?.max_drawdown)

    const sharpeImprovement = baselineSharpe > 0
        ? ((optSharpe - baselineSharpe) / baselineSharpe * 100)
        : 0
    const cagrImprovement = baselineCagr !== 0
        ? ((optCagr - baselineCagr) / Math.abs(baselineCagr) * 100)
        : 0

    // Check if this was an auto-optimized result
    const chosenConfig = (results as any).chosen_configuration
    const metadata = (results as any).metadata || {}

    // Determine fallback portfolio - prioritize chosen_configuration, then winning_strategy, then fallback from optimized_dsl
    const fallbackPortfolio = chosenConfig?.fallback_portfolio
        || (results as any).winning_strategy?.fallback
        || (results as any).optimized_dsl?.fallback_allocation
        || 'Unknown'

    return (
        <div className="space-y-6">
            {/* Optimized Switching Strategy - Clear flow showing rules → portfolios */}
            {chosenConfig && (
                <div className={`border rounded-lg p-5 ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-emerald-900'}`}>
                                Optimized Switching Strategy
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                Best of {metadata.configurations_tried || 'multiple'} configurations tested
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Multi-portfolio rules - show each used rule */}
                        {(results as any).discovered_rules && Object.entries((results as any).discovered_rules)
                            .filter(([, ruleData]: [string, any]) => ruleData.is_used)
                            .map(([portfolioName, ruleData]: [string, any], idx: number) => (
                                <div key={portfolioName} className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isDark ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>When this rule triggers:</span>
                                    </div>
                                    <div className={`font-mono text-sm p-3 rounded-lg mb-3 ${isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {ruleData.human_readable}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Use portfolio:</span>
                                        <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {portfolioName}
                                        </span>
                                    </div>
                                </div>
                            ))}

                        {/* Two-portfolio single rule */}
                        {!(results as any).discovered_rules && discovered_rule && chosenConfig.active_portfolios?.length > 0 && (
                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isDark ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                        1
                                    </div>
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>When this rule triggers:</span>
                                </div>
                                <div className={`font-mono text-sm p-3 rounded-lg mb-3 ${isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {discovered_rule.human_readable}
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Use portfolio:</span>
                                    <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {chosenConfig.active_portfolios[0]}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Fallback portfolio (always last) - shown in GREEN to match the optimized strategy styling */}
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isDark ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                    ∅
                                </div>
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Otherwise (no rules trigger):</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Use portfolio:</span>
                                <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {fallbackPortfolio}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                    fallback
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Discovered Rule - only show if no chosenConfig (legacy/non-auto mode) */}
            {!chosenConfig && discovered_rule && (
                <div className={`border rounded-lg p-5 ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-emerald-900'}`}>
                                Discovered Rule
                            </h4>

                            {/* Portfolio Assignment */}
                            {(results as any).portfolio_mapping && (
                                <div className={`flex items-center gap-2 mb-3 text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                    <span className={`px-2 py-1 rounded font-medium ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                        {(results as any).portfolio_mapping.active}
                                    </span>
                                    <span className={isDark ? 'text-emerald-400/60' : 'text-emerald-600/60'}>when rule triggers, otherwise</span>
                                    <span className={`px-2 py-1 rounded font-medium ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                        {(results as any).portfolio_mapping.default}
                                    </span>
                                </div>
                            )}

                            <div className={`font-mono text-sm p-3 rounded-lg ${isDark ? 'bg-black/30 text-emerald-300' : 'bg-white text-emerald-700'}`}>
                                {discovered_rule.human_readable}
                            </div>
                            <div className={`flex items-center gap-4 mt-3 text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                <span>Complexity: {discovered_rule.complexity} condition{discovered_rule.complexity > 1 ? 's' : ''}</span>
                                {discovered_rule.operators && discovered_rule.operators.length > 0 && (
                                    <span>Logic: {discovered_rule.operators.join(' → ')}</span>
                                )}
                                {discovered_rule.has_mixed_logic && (
                                    <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                                        Mixed AND/OR
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Comparison */}
            <div className={`border rounded-lg p-5 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Performance vs Original Strategy
                </h4>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}>
                                <th className={`px-4 py-2 text-left font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Metric</th>
                                <th className={`px-4 py-2 text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Original</th>
                                <th className={`px-4 py-2 text-center font-medium ${isDark ? 'text-white' : 'text-emerald-600'}`}>Optimized</th>
                                <th className={`px-4 py-2 text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Change</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-gray-200'}`}>
                            <tr>
                                <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Sharpe Ratio</td>
                                <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{baselineSharpe.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-white' : 'text-emerald-600'}`}>{optSharpe.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-center ${sharpeImprovement >= 0 ? isDark ? 'text-green-400' : 'text-emerald-500' : 'text-red-500'}`}>{formatChange(sharpeImprovement)}</td>
                            </tr>
                            <tr>
                                <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>CAGR</td>
                                <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formatPercent(baselineCagr)}</td>
                                <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-white' : 'text-emerald-600'}`}>{formatPercent(optCagr)}</td>
                                <td className={`px-4 py-3 text-center ${cagrImprovement >= 0 ? isDark ? 'text-green-400' : 'text-emerald-500' : 'text-red-500'}`}>{formatChange(cagrImprovement)}</td>
                            </tr>
                            <tr>
                                <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Max Drawdown</td>
                                <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{(baselineMaxDD * 100).toFixed(1)}%</td>
                                <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-white' : 'text-emerald-600'}`}>{(optMaxDD * 100).toFixed(1)}%</td>
                                <td className={`px-4 py-3 text-center ${Math.abs(optMaxDD) < Math.abs(baselineMaxDD) ? isDark ? 'text-green-400' : 'text-emerald-500' : 'text-red-500'}`}>
                                    {Math.abs(optMaxDD) < Math.abs(baselineMaxDD) ? 'Better' : 'Worse'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Validation Status - Combined Walk-Forward + Monte Carlo */}
            {validation && (
                <div className={`border rounded-lg p-5 ${validation.is_robust
                    ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                    : isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${validation.is_robust
                            ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                            : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {validation.is_robust ? (
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
                            <h4 className={`font-bold ${validation.is_robust
                                ? isDark ? 'text-emerald-300' : 'text-emerald-900'
                                : isDark ? 'text-amber-300' : 'text-amber-900'
                                }`}>
                                {validation.is_robust ? 'Validation Passed' : 'Overfitting Warning'}
                            </h4>
                            <p className={`text-xs ${validation.is_robust
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : isDark ? 'text-amber-400' : 'text-amber-600'
                                }`}>
                                {validation.method === 'train_holdout_mc'
                                    ? '70/30 holdout + Monte Carlo projection'
                                    : 'Monte Carlo simulation'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {/* Overfitting Score */}
                        {validation.overfitting_score != null && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Overfitting Score
                                </div>
                                <div className={`text-lg font-bold ${(validation.overfitting_score ?? 0) < 0.3
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : (validation.overfitting_score ?? 0) < 0.5
                                        ? isDark ? 'text-amber-400' : 'text-amber-600'
                                        : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {((validation.overfitting_score ?? 0) * 100).toFixed(0)}%
                                </div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {(validation.overfitting_score ?? 0) < 0.3 ? 'Low risk' : (validation.overfitting_score ?? 0) < 0.5 ? 'Moderate' : 'High risk'}
                                </div>
                            </div>
                        )}

                        {/* Holdout Status */}
                        {validation.holdout_is_robust !== undefined && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Holdout (30%)
                                </div>
                                <div className={`text-lg font-bold ${validation.holdout_is_robust
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {validation.holdout_is_robust ? '✓ Pass' : '✗ Fail'}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Pristine test data
                                </div>
                            </div>
                        )}

                        {/* Monte Carlo Status */}
                        {validation.mc_is_robust !== undefined && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Monte Carlo
                                </div>
                                <div className={`text-lg font-bold ${validation.mc_is_robust
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {validation.mc_is_robust ? '✓ Pass' : '✗ Fail'}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Future projection
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Holdout Score */}
                    {validation.holdout_score != null && (
                        <div className={`p-2 rounded text-xs ${isDark ? 'bg-black/20 text-gray-300' : 'bg-white/60 text-gray-600'}`}>
                            Holdout Score: <span className="font-semibold">{(validation.holdout_score ?? 0).toFixed(2)}</span>
                            {validation.overfitting_score != null && validation.overfitting_score > 0.2 && (
                                <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>
                                    {' '}• {((validation.overfitting_score ?? 0) * 100).toFixed(0)}% decay
                                </span>
                            )}
                        </div>
                    )}

                    {/* Monte Carlo Details */}
                    {(results as any).monte_carlo_validation?.optimized && (
                        <div className={`mt-2 p-2 rounded text-xs ${isDark ? 'bg-black/20 text-gray-400' : 'bg-white/60 text-gray-500'}`}>
                            MC Median: CAGR {formatPercent(safeNum((results as any).monte_carlo_validation.optimized.cagr_median))} •
                            Sharpe {safeNum((results as any).monte_carlo_validation.optimized.sharpe_median).toFixed(2)} •
                            Loss Prob {(safeNum((results as any).monte_carlo_validation.optimized.loss_probability) * 100).toFixed(1)}%
                        </div>
                    )}
                </div>
            )}

            {/* Metadata */}
            <div className={`flex items-center justify-center gap-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/30 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {results.metadata?.n_trials ?? '?'} trials completed in {results.metadata?.elapsed_seconds ?? '?'}s
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

