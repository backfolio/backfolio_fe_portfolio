/**
 * ComparisonYearlyReturnsTable - Yearly Returns Comparison Heatmap
 * 
 * Displays yearly returns for each strategy in a heatmap-style table,
 * allowing easy visual comparison of annual performance across strategies.
 * Inspired by the monthly returns heatmap in ReturnsTab.
 * 
 * @module components/portfolios/ComparisonYearlyReturnsTable
 */

import React, { memo, useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { type ComparisonStrategy, getValidStrategies } from './comparison'

// =============================================================================
// TYPES
// =============================================================================

interface ComparisonYearlyReturnsTableProps {
    /** Strategies to compare */
    strategies: ComparisonStrategy[]
}

interface MonthlyReturn {
    year: number
    month: number
    return: number
}

interface YearlyReturnData {
    year: number
    returns: Map<string, number | null> // strategyId -> yearly return percentage
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Calculate compound yearly return from monthly returns
 */
const calculateYearlyReturn = (monthlyReturns: MonthlyReturn[], year: number): number | null => {
    const yearReturns = monthlyReturns.filter(mr => mr.year === year)
    if (yearReturns.length === 0) return null
    
    // Compound all monthly returns: (1 + r1) * (1 + r2) * ... - 1
    const compoundReturn = yearReturns.reduce((acc, r) => acc * (1 + r.return), 1) - 1
    return compoundReturn * 100 // Convert to percentage
}

/**
 * Get color class for a return value (heatmap style)
 */
const getReturnColor = (value: number | null, isDark: boolean): string => {
    if (value === null) {
        return isDark ? 'bg-white/[0.02]' : 'bg-gray-100'
    }

    const absValue = Math.abs(value)

    if (value > 0) {
        // Green shades for positive - more intense green for bigger returns
        if (absValue > 30) return isDark ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'
        if (absValue > 20) return isDark ? 'bg-emerald-500/80 text-emerald-50' : 'bg-emerald-500 text-white'
        if (absValue > 10) return isDark ? 'bg-emerald-500/50 text-emerald-100' : 'bg-emerald-400 text-emerald-950'
        if (absValue > 5) return isDark ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-200 text-emerald-800'
        return isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
    } else {
        // Red shades for negative - more intense red for bigger losses
        if (absValue > 30) return isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'
        if (absValue > 20) return isDark ? 'bg-red-500/80 text-red-50' : 'bg-red-500 text-white'
        if (absValue > 10) return isDark ? 'bg-red-500/50 text-red-100' : 'bg-red-400 text-red-950'
        if (absValue > 5) return isDark ? 'bg-red-500/30 text-red-200' : 'bg-red-200 text-red-800'
        return isDark ? 'bg-red-500/15 text-red-300' : 'bg-red-100 text-red-700'
    }
}

/**
 * Find the best return for a given year among all strategies
 */
const findBestReturn = (yearData: YearlyReturnData): string | null => {
    let bestId: string | null = null
    let bestValue = -Infinity
    
    yearData.returns.forEach((value, strategyId) => {
        if (value !== null && value > bestValue) {
            bestValue = value
            bestId = strategyId
        }
    })
    
    return bestId
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ComparisonYearlyReturnsTableComponent: React.FC<ComparisonYearlyReturnsTableProps> = ({ strategies }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Get valid strategies with results
    const validStrategies = useMemo(() => getValidStrategies(strategies), [strategies])

    // Extract and aggregate yearly returns from all strategies
    const yearlyData = useMemo((): YearlyReturnData[] => {
        if (validStrategies.length === 0) return []

        // Collect all unique years across all strategies
        const allYears = new Set<number>()
        
        validStrategies.forEach(strategy => {
            const monthlyReturns = strategy.result?.result?.historical_analysis?.monthly_returns as MonthlyReturn[] | undefined
            if (monthlyReturns) {
                monthlyReturns.forEach(mr => allYears.add(mr.year))
            }
        })

        // Build yearly return data for each year
        const years = Array.from(allYears).sort((a, b) => b - a) // Descending order (most recent first)
        
        return years.map(year => {
            const returns = new Map<string, number | null>()
            
            validStrategies.forEach(strategy => {
                const monthlyReturns = strategy.result?.result?.historical_analysis?.monthly_returns as MonthlyReturn[] | undefined
                const yearlyReturn = monthlyReturns ? calculateYearlyReturn(monthlyReturns, year) : null
                returns.set(strategy.id, yearlyReturn)
            })
            
            return { year, returns }
        })
    }, [validStrategies])

    // Calculate summary statistics for each strategy
    const summaryStats = useMemo(() => {
        const stats = new Map<string, {
            avgReturn: number | null
            totalReturn: number | null
            bestYear: { year: number; value: number } | null
            worstYear: { year: number; value: number } | null
            positiveYears: number
            negativeYears: number
        }>()
        
        validStrategies.forEach(strategy => {
            const returns: { year: number; value: number }[] = []
            
            yearlyData.forEach(({ year, returns: yearReturns }) => {
                const value = yearReturns.get(strategy.id)
                if (value !== null && value !== undefined) {
                    returns.push({ year, value })
                }
            })
            
            if (returns.length === 0) {
                stats.set(strategy.id, {
                    avgReturn: null,
                    totalReturn: null,
                    bestYear: null,
                    worstYear: null,
                    positiveYears: 0,
                    negativeYears: 0
                })
                return
            }
            
            const values = returns.map(r => r.value)
            const avgReturn = values.reduce((a, b) => a + b, 0) / values.length
            
            // Compound total return
            const totalReturn = (returns.reduce((acc, r) => acc * (1 + r.value / 100), 1) - 1) * 100
            
            const sorted = [...returns].sort((a, b) => b.value - a.value)
            const bestYear = sorted[0]
            const worstYear = sorted[sorted.length - 1]
            
            const positiveYears = values.filter(v => v > 0).length
            const negativeYears = values.filter(v => v < 0).length
            
            stats.set(strategy.id, {
                avgReturn,
                totalReturn,
                bestYear,
                worstYear,
                positiveYears,
                negativeYears
            })
        })
        
        return stats
    }, [validStrategies, yearlyData])

    // Empty state
    if (validStrategies.length === 0 || yearlyData.length === 0) {
        return (
            <div className={`backdrop-blur-xl border rounded-2xl p-8 text-center ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <div className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No yearly returns data available
                </div>
            </div>
        )
    }

    return (
        <div className={`backdrop-blur-xl border rounded-2xl overflow-hidden ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 border rounded-xl ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                        <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Annual Returns
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Year-over-year performance • {yearlyData.length} years
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        {/* Strategy Header Row */}
                        <tr className={isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}>
                            <th className={`sticky left-0 z-20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r ${isDark ? 'text-gray-400 bg-gray-900/90 border-white/[0.1]' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                                Year
                            </th>
                            {validStrategies.map((strategy) => (
                                <th
                                    key={strategy.id}
                                    className={`px-3 py-3 text-center min-w-[90px]`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: strategy.color.stroke }}
                                        />
                                        <span className={`text-xs font-semibold truncate max-w-[100px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`} title={strategy.name}>
                                            {strategy.name}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className={isDark ? 'divide-y divide-white/[0.05]' : 'divide-y divide-gray-100'}>
                        {yearlyData.map((yearData, idx) => {
                            const bestStrategyId = findBestReturn(yearData)
                            
                            return (
                                <tr
                                    key={yearData.year}
                                    className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'} ${idx % 2 === 0 ? (isDark ? 'bg-white/[0.01]' : 'bg-gray-50/30') : ''}`}
                                >
                                    {/* Year Label */}
                                    <td className={`sticky left-0 z-10 px-4 py-3 border-r text-sm font-semibold ${isDark ? 'bg-gray-900/90 text-white border-white/[0.1]' : 'bg-white text-gray-900 border-gray-200'}`}>
                                        {yearData.year}
                                    </td>
                                    
                                    {/* Strategy Returns */}
                                    {validStrategies.map((strategy) => {
                                        const value = yearData.returns.get(strategy.id) ?? null
                                        const isBest = strategy.id === bestStrategyId && validStrategies.length > 1
                                        
                                        return (
                                            <td key={strategy.id} className="px-2 py-2">
                                                <div className={`relative rounded-md px-2 py-1.5 text-center text-sm font-medium ${getReturnColor(value, isDark)}`}>
                                                    {value !== null ? (
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <span>{value >= 0 ? '+' : ''}{value.toFixed(1)}%</span>
                                                            {isBest && (
                                                                <svg 
                                                                    className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" 
                                                                    fill="currentColor" 
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>—</span>
                                                    )}
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>

                    {/* Summary Footer */}
                    <tfoot>
                        {/* Average Return Row */}
                        <tr className={`border-t-2 ${isDark ? 'border-white/[0.15] bg-white/[0.03]' : 'border-gray-200 bg-gray-50'}`}>
                            <td className={`sticky left-0 z-10 px-4 py-3 border-r text-xs font-semibold uppercase tracking-wider ${isDark ? 'bg-gray-900/90 text-gray-400 border-white/[0.1]' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                Avg/Year
                            </td>
                            {validStrategies.map((strategy) => {
                                const stats = summaryStats.get(strategy.id)
                                const value = stats?.avgReturn ?? null
                                
                                return (
                                    <td key={strategy.id} className="px-3 py-3">
                                        <div className={`text-center text-sm font-semibold ${value !== null 
                                            ? value >= 0 
                                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                                : isDark ? 'text-red-400' : 'text-red-600'
                                            : isDark ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                            {value !== null ? `${value >= 0 ? '+' : ''}${value.toFixed(1)}%` : '—'}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                        
                        {/* Win Rate Row */}
                        <tr className={isDark ? 'bg-white/[0.02]' : 'bg-gray-50/50'}>
                            <td className={`sticky left-0 z-10 px-4 py-3 border-r text-xs font-semibold uppercase tracking-wider ${isDark ? 'bg-gray-900/90 text-gray-400 border-white/[0.1]' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                Win Rate
                            </td>
                            {validStrategies.map((strategy) => {
                                const stats = summaryStats.get(strategy.id)
                                const positive = stats?.positiveYears ?? 0
                                const negative = stats?.negativeYears ?? 0
                                const total = positive + negative
                                const winRate = total > 0 ? (positive / total) * 100 : null
                                
                                return (
                                    <td key={strategy.id} className="px-3 py-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className={`text-sm font-medium ${winRate !== null
                                                ? winRate >= 50
                                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                                    : isDark ? 'text-amber-400' : 'text-amber-600'
                                                : isDark ? 'text-gray-600' : 'text-gray-400'
                                            }`}>
                                                {winRate !== null ? `${winRate.toFixed(0)}%` : '—'}
                                            </span>
                                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                ({positive}/{negative})
                                            </span>
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer Legend */}
            <div className={`p-4 border-t ${isDark ? 'border-white/[0.1] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Best performer for year
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>+</span>
                            Positive years
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>−</span>
                            Negative years
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Memoize to prevent unnecessary re-renders
export const ComparisonYearlyReturnsTable = memo(ComparisonYearlyReturnsTableComponent, (prevProps, nextProps) => {
    return prevProps.strategies === nextProps.strategies
})
