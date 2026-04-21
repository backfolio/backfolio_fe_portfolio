import React, { useMemo, memo, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../../context/ThemeContext'
import { formatMetric } from '../utils/backtestFormatters'
import { BacktestResult } from '../types/backtestResults'
import { SortableTable, Column } from '../components/SortableTable'

interface ReturnsTabProps {
    result: BacktestResult
}

interface MonthlyReturn {
    year: number
    month: number
    return: number
}

interface YearlyData {
    year: number
    jan: number | null
    feb: number | null
    mar: number | null
    apr: number | null
    may: number | null
    jun: number | null
    jul: number | null
    aug: number | null
    sep: number | null
    oct: number | null
    nov: number | null
    dec: number | null
    yearTotal: number
}

interface YearlySummary {
    year: number
    totalReturn: number
    avgMonthlyReturn: number
    bestMonth: { month: string; value: number } | null
    worstMonth: { month: string; value: number } | null
    positiveMonths: number
    negativeMonths: number
    volatility: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const

const DEFAULT_YEARS_TO_SHOW = 5

const ReturnsTabComponent: React.FC<ReturnsTabProps> = ({ result }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { result: apiResult } = result
    const [isHeatmapExpanded, setIsHeatmapExpanded] = useState(false)
    const [showAllYears, setShowAllYears] = useState(false)

    // Handle Escape key to close expanded view
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && isHeatmapExpanded) {
            setIsHeatmapExpanded(false)
        }
    }, [isHeatmapExpanded])

    useEffect(() => {
        if (isHeatmapExpanded) {
            document.addEventListener('keydown', handleKeyDown)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isHeatmapExpanded, handleKeyDown])

    const monthlyReturns = apiResult.historical_analysis?.monthly_returns as MonthlyReturn[] | undefined

    // Transform monthly returns into yearly rows for the heatmap
    const yearlyData = useMemo((): YearlyData[] => {
        if (!monthlyReturns || monthlyReturns.length === 0) return []

        const yearMap = new Map<number, YearlyData>()

        monthlyReturns.forEach(({ year, month, return: ret }) => {
            if (!yearMap.has(year)) {
                yearMap.set(year, {
                    year,
                    jan: null, feb: null, mar: null, apr: null,
                    may: null, jun: null, jul: null, aug: null,
                    sep: null, oct: null, nov: null, dec: null,
                    yearTotal: 0
                })
            }

            const yearRow = yearMap.get(year)!
            const monthKey = MONTH_KEYS[month - 1]
            yearRow[monthKey] = ret * 100 // Convert to percentage

            // Calculate compound yearly return
            const monthlyReturnsForYear = monthlyReturns
                .filter(mr => mr.year === year)
                .map(mr => mr.return)

            // Compound all monthly returns: (1 + r1) * (1 + r2) * ... - 1
            yearRow.yearTotal = monthlyReturnsForYear.reduce((acc, r) => acc * (1 + r), 1) - 1
        })

        return Array.from(yearMap.values()).sort((a, b) => b.year - a.year)
    }, [monthlyReturns])

    // Calculate yearly summary statistics for the sortable table
    const yearlySummaries = useMemo((): YearlySummary[] => {
        if (!monthlyReturns || monthlyReturns.length === 0) return []

        const yearMap = new Map<number, MonthlyReturn[]>()

        monthlyReturns.forEach(mr => {
            if (!yearMap.has(mr.year)) {
                yearMap.set(mr.year, [])
            }
            yearMap.get(mr.year)!.push(mr)
        })

        return Array.from(yearMap.entries()).map(([year, returns]) => {
            const returnValues = returns.map(r => r.return * 100)
            const totalReturn = (returns.reduce((acc, r) => acc * (1 + r.return), 1) - 1) * 100
            const avgMonthlyReturn = returnValues.reduce((a, b) => a + b, 0) / returnValues.length

            // Find best and worst months
            let bestMonth: { month: string; value: number } | null = null
            let worstMonth: { month: string; value: number } | null = null

            returns.forEach(r => {
                const value = r.return * 100
                const monthName = MONTH_NAMES[r.month - 1]
                if (!bestMonth || value > bestMonth.value) {
                    bestMonth = { month: monthName, value }
                }
                if (!worstMonth || value < worstMonth.value) {
                    worstMonth = { month: monthName, value }
                }
            })

            const positiveMonths = returnValues.filter(r => r > 0).length
            const negativeMonths = returnValues.filter(r => r < 0).length

            // Calculate standard deviation
            const variance = returnValues.reduce((acc, r) => acc + Math.pow(r - avgMonthlyReturn, 2), 0) / returnValues.length
            const volatility = Math.sqrt(variance)

            return {
                year,
                totalReturn,
                avgMonthlyReturn,
                bestMonth,
                worstMonth,
                positiveMonths,
                negativeMonths,
                volatility
            }
        }).sort((a, b) => b.year - a.year)
    }, [monthlyReturns])

    // Get color for a return value (heatmap style) - more intense color = bigger magnitude
    const getReturnColor = (value: number | null): string => {
        if (value === null) {
            return isDark ? 'bg-white/[0.02]' : 'bg-gray-100'
        }

        const absValue = Math.abs(value)

        if (value > 0) {
            // Green shades for positive - more intense green for bigger returns
            if (absValue > 10) return isDark ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'
            if (absValue > 5) return isDark ? 'bg-emerald-500/70 text-emerald-100' : 'bg-emerald-500 text-white'
            if (absValue > 2) return isDark ? 'bg-emerald-500/40 text-emerald-200' : 'bg-emerald-300 text-emerald-900'
            return isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
        } else {
            // Red shades for negative - more intense red for bigger losses
            if (absValue > 10) return isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'
            if (absValue > 5) return isDark ? 'bg-red-500/70 text-red-100' : 'bg-red-500 text-white'
            if (absValue > 2) return isDark ? 'bg-red-500/40 text-red-200' : 'bg-red-300 text-red-900'
            return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
        }
    }

    // Yearly summary table columns
    const summaryColumns: Column<YearlySummary>[] = [
        {
            key: 'year',
            label: 'Year',
            align: 'left',
            render: (value) => <span className="font-semibold">{value}</span>
        },
        {
            key: 'totalReturn',
            label: 'Total Return',
            align: 'right',
            render: (value) => (
                <span className={`font-semibold ${value >= 0
                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                    {value >= 0 ? '+' : ''}{formatMetric(value, true)}
                </span>
            )
        },
        {
            key: 'avgMonthlyReturn',
            label: 'Avg Monthly',
            align: 'right',
            render: (value) => (
                <span className={value >= 0
                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }>
                    {value >= 0 ? '+' : ''}{formatMetric(value, true)}
                </span>
            )
        },
        {
            key: 'bestMonth',
            label: 'Best Month',
            align: 'right',
            sortValue: (row) => row.bestMonth?.value ?? 0,
            render: (value: { month: string; value: number } | null) => value ? (
                <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                    {value.month}: +{formatMetric(value.value, true)}
                </span>
            ) : '-'
        },
        {
            key: 'worstMonth',
            label: 'Worst Month',
            align: 'right',
            sortValue: (row) => row.worstMonth?.value ?? 0,
            render: (value: { month: string; value: number } | null) => value ? (
                <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                    {value.month}: {formatMetric(value.value, true)}
                </span>
            ) : '-'
        },
        {
            key: 'positiveMonths',
            label: 'Win/Loss',
            align: 'center',
            sortValue: (row) => row.positiveMonths - row.negativeMonths,
            render: (_, row) => (
                <span>
                    <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>{row.positiveMonths}</span>
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}> / </span>
                    <span className={isDark ? 'text-red-400' : 'text-red-600'}>{row.negativeMonths}</span>
                </span>
            )
        },
        {
            key: 'volatility',
            label: 'Volatility',
            align: 'right',
            render: (value) => formatMetric(value, true)
        }
    ]

    if (!monthlyReturns || monthlyReturns.length === 0) {
        return (
            <div className="relative">
                <div className={`backdrop-blur-xl border rounded-2xl p-12 shadow-sm text-center ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'
                    }`}>
                    <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        No Monthly Returns Data
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Monthly returns breakdown is not available for this backtest period.
                    </p>
                </div>
            </div>
        )
    }

    // Get filtered data based on showAllYears state
    const displayedYearlyData = showAllYears ? yearlyData : yearlyData.slice(0, DEFAULT_YEARS_TO_SHOW)
    const hasMoreYears = yearlyData.length > DEFAULT_YEARS_TO_SHOW
    const hiddenYearsCount = yearlyData.length - DEFAULT_YEARS_TO_SHOW

    // Reusable Heatmap Table component
    const HeatmapTable = ({ isExpanded = false, data = displayedYearlyData }: { isExpanded?: boolean; data?: YearlyData[] }) => (
        <div className={`overflow-x-auto ${isExpanded ? 'overflow-y-auto max-h-[calc(100vh-200px)]' : ''}`}>
            <table className={`min-w-full ${isExpanded ? 'text-base' : 'text-sm'}`}>
                <thead className={isExpanded ? 'sticky top-0 z-10' : ''}>
                    <tr className={`border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-200'} ${isExpanded ? (isDark ? 'bg-gray-900' : 'bg-white') : ''}`}>
                        <th className={`py-2 px-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Year
                        </th>
                        {MONTH_NAMES.map(month => (
                            <th key={month} className={`py-2 px-2 text-center font-semibold ${isExpanded ? 'min-w-[70px]' : 'min-w-[60px]'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {month}
                            </th>
                        ))}
                        <th className={`py-2 px-3 text-right font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Year Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.year} className={`border-b ${isDark ? 'border-white/[0.05]' : 'border-gray-100'}`}>
                            <td className={`py-2 px-3 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {row.year}
                            </td>
                            {MONTH_KEYS.map(monthKey => {
                                const value = row[monthKey]
                                return (
                                    <td key={monthKey} className="py-1 px-1">
                                        <div className={`rounded px-2 ${isExpanded ? 'py-2' : 'py-1.5'} text-center ${isExpanded ? 'text-sm' : 'text-xs'} font-medium ${getReturnColor(value)}`}>
                                            {value !== null ? `${value >= 0 ? '+' : ''}${value.toFixed(1)}%` : '—'}
                                        </div>
                                    </td>
                                )
                            })}
                            <td className="py-2 px-3">
                                <div className={`text-right font-bold ${row.yearTotal >= 0
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {row.yearTotal >= 0 ? '+' : ''}{(row.yearTotal * 100).toFixed(1)}%
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    // Reusable Legend component
    const HeatmapLegend = () => (
        <div className={`mt-6 pt-4 border-t flex flex-wrap items-center gap-4 text-xs ${isDark ? 'border-white/[0.1]' : 'border-gray-200'}`}>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Legend:</span>
            <div className="flex items-center gap-1">
                <div className={`w-8 h-5 rounded ${isDark ? 'bg-red-500' : 'bg-red-600'}`}></div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>&lt; -10%</span>
            </div>
            <div className="flex items-center gap-1">
                <div className={`w-8 h-5 rounded ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}></div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>-10% to 0%</span>
            </div>
            <div className="flex items-center gap-1">
                <div className={`w-8 h-5 rounded ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}></div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>0% to 10%</span>
            </div>
            <div className="flex items-center gap-1">
                <div className={`w-8 h-5 rounded ${isDark ? 'bg-emerald-500' : 'bg-emerald-600'}`}></div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>&gt; 10%</span>
            </div>
        </div>
    )

    return (
        <div className="relative space-y-6">
            {/* Expanded Heatmap Modal */}
            {isHeatmapExpanded && createPortal(
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setIsHeatmapExpanded(false)}
                >
                    <div
                        className={`relative border rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col ${isDark ? 'bg-gray-900 border-white/[0.15]' : 'bg-white border-gray-200'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                            <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Monthly Returns
                                <span className={`text-sm font-normal ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {yearlyData.length} years
                                </span>
                            </h2>
                            <button
                                onClick={() => setIsHeatmapExpanded(false)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content - Always show all years in fullscreen */}
                        <div className="flex-1 p-6 overflow-auto">
                            <HeatmapTable isExpanded={true} data={yearlyData} />
                            <HeatmapLegend />
                        </div>

                        {/* Modal Footer */}
                        <div className={`flex items-center justify-between p-4 border-t ${isDark ? 'border-white/[0.1] bg-white/[0.02]' : 'border-gray-200 bg-gray-50'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Press <kbd className={`px-2 py-0.5 rounded text-xs font-mono ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>Esc</kbd> or click outside to close
                            </p>
                            <button
                                onClick={() => setIsHeatmapExpanded(false)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Monthly Returns Heatmap */}
            <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`text-sm font-semibold uppercase tracking-wide flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Monthly Returns
                        {hasMoreYears && !showAllYears && (
                            <span className={`text-[10px] font-normal normal-case ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                Last {DEFAULT_YEARS_TO_SHOW} years
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={() => setIsHeatmapExpanded(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isDark
                            ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/50'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 hover:border-blue-300'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Fullscreen
                    </button>
                </div>

                <HeatmapTable />

                {/* Show More/Less Years Toggle */}
                {hasMoreYears && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setShowAllYears(!showAllYears)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isDark
                                ? 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 border border-white/[0.1] hover:border-white/[0.2]'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {showAllYears ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    Show Less (Last {DEFAULT_YEARS_TO_SHOW} Years)
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    Show All {yearlyData.length} Years (+{hiddenYearsCount} more)
                                </>
                            )}
                        </button>
                    </div>
                )}

                <HeatmapLegend />
            </div>

            {/* Yearly Summary Table - Sortable */}
            <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                }`}>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-5 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Annual Performance
                    <span className={`text-[10px] font-normal normal-case ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        Click headers to sort
                    </span>
                </h3>

                <SortableTable
                    data={yearlySummaries}
                    columns={summaryColumns}
                    keyExtractor={(row) => row.year}
                    emptyMessage="No yearly data available"
                />
            </div>

            {/* Overall Statistics */}
            {monthlyReturns.length > 0 && (
                <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                    }`}>
                    <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Monthly Statistics
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(() => {
                            const allReturns = monthlyReturns.map(r => r.return * 100)
                            const avgReturn = allReturns.reduce((a, b) => a + b, 0) / allReturns.length
                            const positiveMonths = allReturns.filter(r => r > 0).length
                            const maxReturn = Math.max(...allReturns)
                            const minReturn = Math.min(...allReturns)
                            const variance = allReturns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / allReturns.length
                            const stdDev = Math.sqrt(variance)

                            return (
                                <>
                                    <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Average Monthly Return
                                        </div>
                                        <div className={`text-2xl font-bold ${avgReturn >= 0
                                            ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                            : isDark ? 'text-red-400' : 'text-red-600'
                                            }`}>
                                            {avgReturn >= 0 ? '+' : ''}{formatMetric(avgReturn, true)}
                                        </div>
                                    </div>

                                    <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Win Rate (Monthly)
                                        </div>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                            {formatMetric((positiveMonths / allReturns.length) * 100, true)}
                                        </div>
                                        <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {positiveMonths} of {allReturns.length} months
                                        </div>
                                    </div>

                                    <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Best / Worst Month
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                +{formatMetric(maxReturn, true)}
                                            </span>
                                            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
                                            <span className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                                {formatMetric(minReturn, true)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Monthly Volatility
                                        </div>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {formatMetric(stdDev, true)}
                                        </div>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>
            )}
        </div>
    )
}

// Memoize with explicit comparison to prevent re-renders when switching tabs
export const ReturnsTab = memo(ReturnsTabComponent, (prevProps, nextProps) => {
    return prevProps.result === nextProps.result
})

