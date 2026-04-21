import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { formatMetric } from '../utils/backtestFormatters'
import type { StrategyDSL } from '../../../types/strategy'

interface AllocationDistributionProps {
    allocationPercentages: Record<string, number>
    allocationPerformance?: Record<string, { total_return: number; avg_daily_return: number; volatility: number }>
    currentAllocation?: string | null
    strategy?: StrategyDSL
}

export const AllocationDistribution: React.FC<AllocationDistributionProps> = ({
    allocationPercentages,
    allocationPerformance,
    currentAllocation,
    strategy
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Helper to get allocation details from strategy
    const getAllocationDetails = (allocName: string) => {
        if (!strategy?.allocations?.[allocName]) return null

        const alloc = strategy.allocations[allocName]
        const weights = alloc.allocation
        const entryCondition = alloc.entry_condition

        return {
            stocks: weights,
            entryCondition,
            rebalancing: alloc.rebalancing_frequency
        }
    }

    // Format condition for display
    const formatCondition = (condition: any): string => {
        if (!condition) return 'No entry condition (static)'

        // Handle composite conditions (AND/OR)
        if (condition.op) {
            const subConditions = condition.conditions.map(formatCondition).join(` ${condition.op} `)
            return `(${subConditions})`
        }

        // Handle simple conditions
        const left = formatSignalParam(condition.left)
        const right = formatSignalParam(condition.right)
        return `${left} ${condition.comparison} ${right}`
    }

    const formatSignalParam = (param: any): string => {
        if (param.type === 'constant') return String(param.value)
        if (param.type === 'Price') return `Price(${param.symbol})`

        const window = param.window ? `(${param.window})` : ''
        return `${param.type}${window}[${param.symbol}]`
    }

    return (
        <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-sm font-semibold uppercase tracking-wide mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Allocation Distribution
            </h3>

            <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3">
                    {Object.entries(allocationPercentages)
                        .sort(([, a], [, b]) => b - a)
                        .map(([allocName, pct], idx, arr) => {
                            const details = getAllocationDetails(allocName)
                            const perf = allocationPerformance?.[allocName]

                            return (
                                <div key={allocName} className="flex items-center gap-3">
                                    {/* Allocation Node */}
                                    <div className="relative group">
                                        <div className={`backdrop-blur-xl border rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDark ? 'bg-white/[0.05] border-white/[0.15] hover:bg-white/[0.08]' : 'bg-white border-gray-200 hover:border-purple-300'}`}>
                                            <div className="flex items-center gap-3">
                                                {/* Icon */}
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${isDark ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' : 'bg-gradient-to-br from-purple-100 to-blue-100'}`}>
                                                    <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                </div>

                                                {/* Content */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                            {allocName}
                                                        </div>
                                                        {currentAllocation === allocName && (
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'}`}>
                                                                CURRENT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`text-xl font-bold ${pct > 50 ? (isDark ? 'text-purple-400' : 'text-purple-600') : pct > 25 ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                                                            {formatMetric(pct, true, 1)}
                                                        </div>
                                                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                            active
                                                        </span>
                                                    </div>
                                                    {perf && (
                                                        <div className={`text-xs mt-1 ${perf.total_return >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                                                            Return: {formatMetric(perf.total_return * 100, true, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className={`mt-3 w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-white/[0.1]' : 'bg-gray-200'}`}>
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${pct > 50 ? 'bg-gradient-to-r from-purple-500 to-purple-400' : pct > 25 ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-gray-500 to-gray-400'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Rank Badge */}
                                        {idx === 0 && (
                                            <div className={`absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isDark ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white'}`}>
                                                1
                                            </div>
                                        )}

                                        {/* Hover Tooltip - Shows stocks, weights, and rules */}
                                        {details && (
                                            <div className={`absolute left-0 top-full mt-2 w-80 rounded-lg shadow-2xl border p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${isDark ? 'bg-gray-900 border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                                                {/* Asset Weights */}
                                                <div className="mb-3">
                                                    <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Asset Allocation
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {Object.entries(details.stocks)
                                                            .sort(([, a], [, b]) => b - a)
                                                            .map(([ticker, weight]) => (
                                                                <div key={ticker} className="flex items-center justify-between">
                                                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                        {ticker}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500`} style={{ width: `${weight * 60}px` }} />
                                                                        <span className={`text-xs font-semibold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                            {formatMetric(weight * 100, false, 1)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>

                                                {/* Rebalancing */}
                                                <div className="mb-3">
                                                    <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Rebalancing
                                                    </div>
                                                    <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {!details.rebalancing || details.rebalancing === 'none' ? 'Buy & Hold' : details.rebalancing.charAt(0).toUpperCase() + details.rebalancing.slice(1)}
                                                    </div>
                                                </div>

                                                {/* Entry Condition */}
                                                <div>
                                                    <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Entry Rule
                                                    </div>
                                                    <div className={`text-xs font-mono leading-relaxed p-2 rounded ${isDark ? 'bg-white/[0.05] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                                                        {formatCondition(details.entryCondition)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow Connector */}
                                    {idx < arr.length - 1 && (
                                        <svg className={`w-6 h-6 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    )}
                                </div>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}
