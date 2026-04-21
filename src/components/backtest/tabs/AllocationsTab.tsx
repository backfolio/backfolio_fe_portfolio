import React, { memo } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { AllocationDistribution } from '../components/AllocationDistribution'
import { formatMetric, formatCurrency } from '../utils/backtestFormatters'
import { BacktestResult } from '../types/backtestResults'
import { SortableTable, Column } from '../components/SortableTable'
import type { StrategyDSL } from '../../../types/strategy'

interface AllocationsTabProps {
    result: BacktestResult
    allocationData: any[]
    strategy?: StrategyDSL
}

const AllocationsTabComponent: React.FC<AllocationsTabProps> = ({ result, allocationData, strategy }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { result: apiResult } = result
    const { allocation_efficiency } = apiResult

    // Get the last (current/final) allocation from allocation_log
    const currentAllocation = React.useMemo(() => {
        if (!apiResult.allocation_log) return null
        const dates = Object.keys(apiResult.allocation_log).sort()
        return dates.length > 0 ? apiResult.allocation_log[dates[dates.length - 1]] : null
    }, [apiResult.allocation_log])

    // Use backend's pre-computed allocation_summary which correctly handles date gaps (weekends, holidays)
    // The backend uses pandas shift() to group consecutive trading days with the same allocation
    const allocationPeriods = React.useMemo(() => {
        // Prefer backend's pre-computed allocation_summary
        if (apiResult.allocation_summary && apiResult.allocation_summary.length > 0) {
            return apiResult.allocation_summary.map(period => ({
                allocation: period.allocation,
                startDate: period.start_date,
                endDate: period.end_date,
                startValue: period.start_balance,
                endValue: period.end_balance,
                change: period.end_balance - period.start_balance,
                changePercent: period.pct_return * 100,
                duration: period.days // This is trading days, not calendar days
            }))
        }

        // Fallback: compute from allocationData if allocation_summary is not available
        if (!allocationData || allocationData.length === 0) return []

        const portfolioLog = apiResult.portfolio_log
        const portfolioValues: { [date: string]: number } = {}

        // Convert portfolio log to date-keyed object if needed
        if (typeof portfolioLog === 'object' && !Array.isArray(portfolioLog)) {
            Object.assign(portfolioValues, portfolioLog)
        } else if (Array.isArray(portfolioLog)) {
            portfolioLog.forEach(entry => {
                portfolioValues[entry.date] = entry.value
            })
        }

        // Create periods for each continuous allocation run
        const periods: Array<{
            allocation: string
            startDate: string
            endDate: string
            startValue: number
            endValue: number
            change: number
            changePercent: number
            duration: number
        }> = []

        // Normalize allocation names (trim whitespace) to avoid comparison issues
        let currentAllocation = (allocationData[0].allocation || '').trim()
        let periodStart = allocationData[0].date

        for (let i = 1; i < allocationData.length; i++) {
            const thisAllocation = (allocationData[i].allocation || '').trim()
            if (thisAllocation !== currentAllocation) {
                // Period ends on the day before the change
                const periodEnd = allocationData[i - 1].date
                const startValue = portfolioValues[periodStart] || 0
                const endValue = portfolioValues[periodEnd] || 0
                const change = endValue - startValue
                const changePercent = startValue > 0 ? (change / startValue) * 100 : 0
                const durationDays = Math.round(
                    (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24)
                )

                // Only add period if duration is at least 1 day
                if (durationDays >= 1) {
                    periods.push({
                        allocation: currentAllocation,
                        startDate: periodStart,
                        endDate: periodEnd,
                        startValue,
                        endValue,
                        change,
                        changePercent,
                        duration: durationDays
                    })
                }

                // Start new period
                currentAllocation = thisAllocation
                periodStart = allocationData[i].date
            }
        }

        // Add the final period
        const periodEnd = allocationData[allocationData.length - 1].date
        const startValue = portfolioValues[periodStart] || 0
        const endValue = portfolioValues[periodEnd] || 0
        const change = endValue - startValue
        const changePercent = startValue > 0 ? (change / startValue) * 100 : 0
        const durationDays = Math.round(
            (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24)
        )

        if (durationDays >= 1) {
            periods.push({
                allocation: currentAllocation,
                startDate: periodStart,
                endDate: periodEnd,
                startValue,
                endValue,
                change,
                changePercent,
                duration: durationDays
            })
        }

        return periods
    }, [allocationData, apiResult.portfolio_log, apiResult.allocation_summary])

    if (!allocation_efficiency) return null

    return (
        <div className="relative space-y-6">
            {/* Strategy Flow Visualization - using allocation_efficiency.allocation_percentages */}
            {allocation_efficiency.allocation_percentages && (
                <AllocationDistribution
                    allocationPercentages={allocation_efficiency.allocation_percentages as Record<string, number>}
                    allocationPerformance={allocation_efficiency.allocation_performance as Record<string, { total_return: number; avg_daily_return: number; volatility: number }> | undefined}
                    currentAllocation={currentAllocation}
                    strategy={strategy}
                />
            )}

            {/* Allocation Efficiency Metrics */}
            <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                }`}>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Switching Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-blue-700 mb-1">Total Allocation Changes</div>
                        <div className="text-2xl font-bold text-blue-600">{allocation_efficiency.allocation_changes}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-blue-700 mb-1">Switching Frequency</div>
                        <div className="text-2xl font-bold text-blue-600">{formatMetric(allocation_efficiency.switching_frequency * 100, true)}</div>
                    </div>
                </div>
            </div>

            {/* Allocation Timeline - Aggregated Periods */}
            {allocationPeriods.length > 0 && (
                <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                    }`}>
                    <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Allocation Periods
                        <span className={`text-[10px] font-normal normal-case ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            Click headers to sort
                        </span>
                    </h3>
                    <SortableTable
                        data={allocationPeriods}
                        keyExtractor={(_, idx) => idx}
                        columns={[
                            {
                                key: 'allocation',
                                label: 'Allocation',
                                render: (value) => (
                                    <span className={`inline-block px-3 py-1 rounded-full font-medium text-xs ${isDark
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : 'bg-purple-100 text-purple-700 border border-purple-300'
                                        }`}>
                                        {value}
                                    </span>
                                )
                            },
                            {
                                key: 'startDate',
                                label: 'Start Date',
                                sortValue: (row) => new Date(row.startDate).getTime(),
                                render: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            },
                            {
                                key: 'endDate',
                                label: 'End Date',
                                sortValue: (row) => new Date(row.endDate).getTime(),
                                render: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            },
                            {
                                key: 'startValue',
                                label: 'Start Value',
                                align: 'right',
                                render: (value) => <span className="font-mono">{formatCurrency(value)}</span>
                            },
                            {
                                key: 'endValue',
                                label: 'End Value',
                                align: 'right',
                                render: (value) => <span className="font-mono">{formatCurrency(value)}</span>
                            },
                            {
                                key: 'changePercent',
                                label: 'Change',
                                align: 'right',
                                render: (value, row) => (
                                    <div className={`flex flex-col items-end font-semibold ${row.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <span>{row.change >= 0 ? '+$' : '-$'}{Math.abs(row.change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        <span className="text-xs">
                                            ({value >= 0 ? '+' : ''}{formatMetric(value, true, 2)})
                                        </span>
                                    </div>
                                )
                            },
                            {
                                key: 'duration',
                                label: 'Duration',
                                align: 'right',
                                render: (value) => `${value} trading days`
                            }
                        ] as Column<typeof allocationPeriods[0]>[]}
                        maxHeight="400px"
                    />

                    {allocationPeriods.length > 10 && (
                        <div className={`mt-4 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Showing all {allocationPeriods.length} allocation periods
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Memoize with explicit comparison to prevent re-renders when switching tabs
export const AllocationsTab = memo(AllocationsTabComponent, (prevProps, nextProps) => {
    return prevProps.result === nextProps.result &&
        prevProps.allocationData === nextProps.allocationData &&
        prevProps.strategy === nextProps.strategy
})
