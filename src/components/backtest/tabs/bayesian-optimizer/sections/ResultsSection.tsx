import React, { useState } from 'react'
import type { ResultsSectionProps } from '../types'
import { mergeOptimizedWeights, safeNum, formatPercent, formatChange } from '../utils'

// LocalStorage key for passing optimized strategy to new window
const OPTIMIZED_STRATEGY_KEY = 'backfolio_optimized_strategy_new_window'

export const ResultsSection: React.FC<ResultsSectionProps> = ({
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
            // Merge optimized weights with original strategy (or convert to proper format)
            // This ensures proper nested structure with allocation + rebalancing_frequency
            // Also includes canvas state (positions, edges)
            const jsonToCopy = mergeOptimizedWeights(originalStrategy, results.optimized_dsl, canvasState)
            const textToCopy = JSON.stringify(jsonToCopy, null, 2)

            // Copy to clipboard with Safari fallback
            try {
                await navigator.clipboard.writeText(textToCopy)
            } catch (clipboardError) {
                // Fallback for Safari: use a temporary textarea
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
            // Merge optimized weights with original strategy
            const strategyToOpen = mergeOptimizedWeights(originalStrategy, results.optimized_dsl, canvasState)

            // Store in localStorage for the new window to pick up
            localStorage.setItem(OPTIMIZED_STRATEGY_KEY, JSON.stringify(strategyToOpen))

            // Open new window with parameter to load from localStorage
            const baseUrl = window.location.origin
            window.open(`${baseUrl}/backtest?loadOptimized=1`, '_blank')
        } catch (err) {
            console.error('Failed to open in new window:', err)
        }
    }

    if (!results.success) {
        return (
            <div className={`backdrop-blur-xl border rounded-2xl p-8 shadow-sm text-center ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                    <svg className={`w-8 h-8 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Optimization Could Not Complete
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {results.error || 'Need at least 2 assets in a portfolio to optimize allocation weights.'}
                </p>
                <button onClick={onReset} className={`px-6 py-2 rounded-xl font-semibold ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                    Try Again
                </button>
            </div>
        )
    }

    const { original, optimized, parameter_changes, metadata } = results

    // Safe versions of metrics for calculations and display
    const origSharpe = safeNum(original?.sharpe_ratio)
    const optSharpe = safeNum(optimized?.sharpe_ratio)
    const origCagr = safeNum(original?.cagr)
    const optCagr = safeNum(optimized?.cagr)
    const origMaxDD = safeNum(original?.max_drawdown)
    const optMaxDD = safeNum(optimized?.max_drawdown)

    const sharpeImprovement = origSharpe > 0
        ? ((optSharpe - origSharpe) / origSharpe * 100)
        : 0
    const cagrImprovement = origCagr !== 0
        ? ((optCagr - origCagr) / Math.abs(origCagr) * 100)
        : 0

    return (
        <div className="space-y-6">
            {/* Performance Comparison */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <h4 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Performance Comparison
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
                                <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{origSharpe.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-white' : 'text-emerald-600'}`}>{optSharpe.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-center ${sharpeImprovement >= 0 ? isDark ? 'text-green-400' : 'text-emerald-500' : 'text-red-500'}`}>{formatChange(sharpeImprovement)}</td>
                            </tr>
                            <tr>
                                <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>CAGR</td>
                                <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formatPercent(origCagr)}</td>
                                <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-white' : 'text-emerald-600'}`}>{formatPercent(optCagr)}</td>
                                <td className={`px-4 py-3 text-center ${cagrImprovement >= 0 ? isDark ? 'text-green-400' : 'text-emerald-500' : 'text-red-500'}`}>{formatChange(cagrImprovement)}</td>
                            </tr>
                            <tr>
                                <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Max Drawdown</td>
                                <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{(origMaxDD * 100).toFixed(1)}%</td>
                                <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-white' : 'text-emerald-600'}`}>{(optMaxDD * 100).toFixed(1)}%</td>
                                <td className={`px-4 py-3 text-center ${optMaxDD > origMaxDD ? isDark ? 'text-green-400' : 'text-emerald-500' : 'text-red-500'}`}>
                                    {optMaxDD > origMaxDD ? 'Better' : 'Worse'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Parameter Changes */}
            {parameter_changes && parameter_changes.length > 0 && (
                <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                    <h4 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        What Changed
                    </h4>
                    <div className="space-y-3">
                        {parameter_changes.map((change, i) => (
                            <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                    <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                        {change.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {change.original}
                                        </span>
                                        <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-emerald-600'}`}>
                                            {change.optimized}
                                        </span>
                                    </div>
                                </div>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {change.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadata */}
            <div className={`flex items-center justify-center gap-4 p-3 rounded-xl ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {metadata?.n_trials ?? '?'} trials completed in {metadata?.elapsed_seconds ?? '?'}s
                </span>
            </div>

            {/* Action Buttons */}
            {results.optimized_dsl && (
                <div className="space-y-3">
                    {onLoadStrategy && (
                        <button
                            onClick={() => {
                                // Merge optimized weights with original (or convert to proper format)
                                const strategyToLoad = mergeOptimizedWeights(originalStrategy, results.optimized_dsl!, canvasState)
                                onLoadStrategy(strategyToLoad)
                            }}
                            className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-lg ${isDark
                                ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 border border-purple-500/50 shadow-purple-500/20'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Load Optimized Strategy onto Canvas
                        </button>
                    )}
                    <button
                        onClick={handleOpenInNewWindow}
                        className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-lg ${isDark
                            ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/50 shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                            }`}
                        title="Open optimized strategy in a new window and run backtest"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open & Run in New Window
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border ${copied
                            ? isDark ? 'bg-white/10 border-white/30 text-white' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : isDark ? 'bg-white/[0.02] border-white/10 text-gray-300 hover:bg-white/[0.05]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy JSON
                            </>
                        )}
                    </button>
                </div>
            )}

            <button
                onClick={onReset}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Run New Optimization
            </button>
        </div>
    )
}

