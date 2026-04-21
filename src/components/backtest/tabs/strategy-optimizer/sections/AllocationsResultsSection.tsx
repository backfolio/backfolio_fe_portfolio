import React, { useState } from 'react'
import type { AllocationsResultsSectionProps } from '../types'
import { mergeOptimizedWeights, safeNum, formatPercent, formatChange } from '../utils'

// LocalStorage key for passing optimized strategy to new window
const OPTIMIZED_STRATEGY_KEY = 'backfolio_optimized_strategy_new_window'

export const AllocationsResultsSection: React.FC<AllocationsResultsSectionProps> = ({
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
            const jsonToCopy = mergeOptimizedWeights(originalStrategy, results.optimized_dsl, canvasState)
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
            const strategyToOpen = mergeOptimizedWeights(originalStrategy, results.optimized_dsl, canvasState)
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
                    {results.error || 'Need at least 2 assets in a portfolio to optimize allocation weights.'}
                </p>
                <button onClick={onReset} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Try Again
                </button>
            </div>
        )
    }

    const { original, optimized, parameter_changes, metadata } = results

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
                                <td className={`px-4 py-3 text-center ${Math.abs(optMaxDD) < Math.abs(origMaxDD) ? isDark ? 'text-green-400' : 'text-emerald-500' : 'text-red-500'}`}>
                                    {Math.abs(optMaxDD) < Math.abs(origMaxDD) ? 'Better' : 'Worse'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Parameter Changes */}
            {parameter_changes && parameter_changes.length > 0 && (
                <div className={`border rounded-lg p-5 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
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

            {/* Validation Status */}
            {results.validation && (
                <div className={`border rounded-lg p-5 ${results.validation.is_robust
                    ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                    : isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${results.validation.is_robust
                            ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                            : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {results.validation.is_robust ? (
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
                            <h4 className={`font-bold ${results.validation.is_robust
                                ? isDark ? 'text-emerald-300' : 'text-emerald-900'
                                : isDark ? 'text-amber-300' : 'text-amber-900'
                                }`}>
                                {results.validation.is_robust ? 'Validation Passed' : 'Overfitting Warning'}
                            </h4>
                            <p className={`text-xs ${results.validation.is_robust
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : isDark ? 'text-amber-400' : 'text-amber-600'
                                }`}>
                                {results.validation.method === 'train_holdout_mc'
                                    ? '70/30 holdout + Monte Carlo projection'
                                    : 'Monte Carlo simulation'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Overfitting Score */}
                        {results.validation.overfitting_score !== undefined && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Overfitting Score
                                </div>
                                <div className={`text-lg font-bold ${results.validation.overfitting_score < 0.3
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : results.validation.overfitting_score < 0.5
                                        ? isDark ? 'text-amber-400' : 'text-amber-600'
                                        : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {(results.validation.overfitting_score * 100).toFixed(0)}%
                                </div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {results.validation.overfitting_score < 0.3 ? 'Low risk' : results.validation.overfitting_score < 0.5 ? 'Moderate' : 'High risk'}
                                </div>
                            </div>
                        )}

                        {/* Holdout Performance */}
                        {(results as any).holdout_validation?.holdout_score !== undefined && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Holdout Score (30%)
                                </div>
                                <div className={`text-lg font-bold ${(results as any).holdout_validation.holdout_score > 0
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {(results as any).holdout_validation.holdout_score.toFixed(2)}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {(results as any).holdout_validation.holdout_period || 'Pristine test data'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Decay indicator */}
                    {typeof results.oos_validation?.decay === 'number' && results.oos_validation.decay > 0.2 && (
                        <div className={`mt-3 p-2 rounded text-xs ${isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                            ⚠️ {(results.oos_validation.decay * 100).toFixed(0)}% performance decay in holdout period
                        </div>
                    )}
                </div>
            )}

            {/* Metadata */}
            <div className={`flex items-center justify-center gap-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/30 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {metadata?.n_trials ?? '?'} trials completed in {metadata?.elapsed_seconds ?? '?'}s
                </span>
            </div>

            {/* Action Buttons */}
            {results.optimized_dsl && (
                <div className="space-y-2">
                    {onLoadStrategy && (
                        <button
                            onClick={() => {
                                const strategyToLoad = mergeOptimizedWeights(originalStrategy, results.optimized_dsl!, canvasState)
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

