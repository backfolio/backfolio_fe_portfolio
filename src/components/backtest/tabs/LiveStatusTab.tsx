import React, { useState, useCallback, memo, useMemo } from 'react'
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { API_BASE_URL } from '../../../api/client'
import { useTheme } from '../../../context/ThemeContext'
import type { StrategyDSL } from '../../../types/strategy'

// Register Chart.js components
ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
)

interface LiveStatusTabProps {
    strategy?: StrategyDSL
}

interface Comparison {
    description: string
    left_name: string
    left_value: number | null
    comparison: string
    right_name: string
    right_value: number | null
    triggered: boolean
    distance_pct: number | null
}

interface RuleEvaluation {
    allocation: string
    rule: string
    triggered: boolean | null
    comparisons: Comparison[]
}

interface SignalValue {
    name: string
    symbol: string
    value: number
}

interface LiveStatusResponse {
    success: boolean
    evaluation_date: string
    evaluation_time: string
    target_allocation: string
    allocation_order: string[]
    fallback_allocation: string
    rule_evaluations: RuleEvaluation[]
    signal_values: SignalValue[]
    alpaca_configured: boolean
    error?: string
}

interface ChartSeries {
    name: string
    symbol: string
    values: (number | null)[]
    isConstant?: boolean
}

interface ConditionChart {
    id: string
    allocation: string
    title: string
    comparison: string
    dates: string[]
    series: ChartSeries[]
}

interface HistoryResponse {
    success: boolean
    charts: ConditionChart[]
    days: number
    error?: string
}

// Chart color palette - vibrant colors that work on both light and dark
const CHART_COLORS = [
    { line: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.15)' },  // Purple
    { line: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)' },  // Amber
    { line: '#10b981', fill: 'rgba(16, 185, 129, 0.15)' },  // Emerald
    { line: '#ef4444', fill: 'rgba(239, 68, 68, 0.15)' },   // Red
    { line: '#3b82f6', fill: 'rgba(59, 130, 246, 0.15)' },  // Blue
    { line: '#ec4899', fill: 'rgba(236, 72, 153, 0.15)' },  // Pink
]

interface ConditionChartProps {
    chart: ConditionChart
    isDark: boolean
    isTriggered: boolean
}

const ConditionChartComponent: React.FC<ConditionChartProps> = memo(({ chart, isDark, isTriggered }) => {
    // Build chart data
    const chartData = useMemo(() => {
        const datasets = chart.series.map((series, idx) => {
            const colorIdx = idx % CHART_COLORS.length
            
            // Convert to {x, y} format for time scale
            const points = chart.dates.map((date, i) => ({
                x: new Date(date).getTime(),
                y: series.values[i]
            })).filter(p => p.y !== null)

            return {
                label: series.symbol ? `${series.name} (${series.symbol})` : series.name,
                data: points,
                fill: idx === 0 && !series.isConstant,
                borderColor: CHART_COLORS[colorIdx].line,
                backgroundColor: CHART_COLORS[colorIdx].fill,
                borderWidth: series.isConstant ? 1.5 : 2.5,
                borderDash: series.isConstant ? [6, 4] : undefined,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: CHART_COLORS[colorIdx].line,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                tension: 0.3,
            }
        })

        return { datasets }
    }, [chart])

    const options: any = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
                    font: { size: 11, weight: '500' },
                    boxWidth: 12,
                    boxHeight: 2,
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'line',
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleColor: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b',
                titleFont: { weight: '600', size: 11 },
                bodyColor: isDark ? '#fff' : '#1e293b',
                bodyFont: { weight: '600', size: 12 },
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4,
                callbacks: {
                    title: (items: any) => {
                        if (items.length > 0) {
                            const date = new Date(items[0].parsed.x)
                            return date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })
                        }
                        return ''
                    },
                    label: (item: any) => {
                        const value = item.parsed.y
                        const label = item.dataset.label
                        // Format based on value magnitude
                        if (value >= 100) {
                            return ` ${label}: ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        }
                        return ` ${label}: ${value.toFixed(2)}`
                    }
                }
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    displayFormats: {
                        day: 'MMM d'
                    },
                },
                grid: {
                    display: false,
                },
                border: {
                    color: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                },
                ticks: {
                    color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                    font: { size: 10, weight: '500' },
                    maxTicksLimit: 8,
                    autoSkip: true,
                },
            },
            y: {
                grid: {
                    color: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    lineWidth: 1,
                },
                border: {
                    color: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                },
                ticks: {
                    color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                    font: { size: 10, weight: '500' },
                    callback: (value: number) => {
                        if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
                        if (value >= 100) return value.toFixed(0)
                        return value.toFixed(1)
                    },
                },
            },
        },
    }), [isDark])

    // Get comparison symbol for display
    const comparisonSymbol = chart.comparison === '>' ? '>' : 
                            chart.comparison === '<' ? '<' :
                            chart.comparison === '>=' ? '≥' :
                            chart.comparison === '<=' ? '≤' : chart.comparison

    return (
        <div className={`border rounded-xl p-4 transition-all ${
            isTriggered
                ? isDark
                    ? 'bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'bg-emerald-50/50 border-emerald-200 ring-1 ring-emerald-200'
                : isDark 
                    ? 'bg-white/[0.02] border-white/[0.08]' 
                    : 'bg-white border-gray-200'
        }`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold ${
                        isTriggered
                            ? isDark
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-emerald-100 text-emerald-700'
                            : isDark 
                                ? 'bg-gray-800 text-gray-400' 
                                : 'bg-gray-100 text-gray-600'
                    }`}>
                        {chart.allocation}
                    </span>
                    {isTriggered && (
                        <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            MET
                        </span>
                    )}
                </div>
                <span className={`text-lg font-mono font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {comparisonSymbol}
                </span>
            </div>
            <h4 className={`text-sm font-mono mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {chart.title}
            </h4>
            <div className="h-[200px] w-full">
                <Line data={chartData} options={options} />
            </div>
        </div>
    )
})

ConditionChartComponent.displayName = 'ConditionChart'

const LiveStatusTabComponent: React.FC<LiveStatusTabProps> = ({ strategy }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<LiveStatusResponse | null>(null)
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
    
    // History state
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyError, setHistoryError] = useState<string | null>(null)
    const [charts, setCharts] = useState<ConditionChart[] | null>(null)
    const [historyDays, setHistoryDays] = useState(30)

    const fetchLiveStatus = useCallback(async () => {
        if (!strategy) {
            setError('No strategy available')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/live-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ strategy })
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                setError(data.error || 'Failed to fetch live status')
                setStatus(null)
            } else {
                setStatus(data)
                setLastRefresh(new Date())
            }
        } catch (err: any) {
            setError(err.message || 'Network error')
            setStatus(null)
        } finally {
            setLoading(false)
        }
    }, [strategy])

    const fetchHistory = useCallback(async () => {
        if (!strategy) {
            setHistoryError('No strategy available')
            return
        }

        setHistoryLoading(true)
        setHistoryError(null)

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/live-status/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ strategy, days: historyDays })
            })

            const data: HistoryResponse = await response.json()

            if (!response.ok || !data.success) {
                setHistoryError(data.error || 'Failed to fetch signal history')
                setCharts(null)
            } else {
                setCharts(data.charts)
            }
        } catch (err: any) {
            setHistoryError(err.message || 'Network error')
            setCharts(null)
        } finally {
            setHistoryLoading(false)
        }
    }, [strategy, historyDays])

    // Fetch both status and history together
    const fetchAll = useCallback(async () => {
        await Promise.all([fetchLiveStatus(), fetchHistory()])
    }, [fetchLiveStatus, fetchHistory])

    // Format value for display
    const formatValue = (value: number | null): string => {
        if (value === null) return 'N/A'
        if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        if (Math.abs(value) < 0.01) return value.toFixed(4)
        return value.toFixed(2)
    }

    // Get progress bar color based on distance
    const getProgressColor = (distance: number | null, triggered: boolean): string => {
        if (triggered) {
            return isDark ? 'bg-emerald-500' : 'bg-emerald-500'
        }
        if (distance === null) return isDark ? 'bg-gray-600' : 'bg-gray-300'
        if (distance < 5) return isDark ? 'bg-amber-500' : 'bg-amber-500' // Very close
        if (distance < 15) return isDark ? 'bg-blue-500' : 'bg-blue-500' // Moderately close
        return isDark ? 'bg-gray-500' : 'bg-gray-400' // Far away
    }

    // Calculate progress percentage (capped at 100%)
    const getProgressWidth = (distance: number | null, triggered: boolean): number => {
        if (triggered) return 100
        if (distance === null) return 0
        // Invert: smaller distance = more progress toward triggering
        // Cap at 50% distance (anything beyond is just "far")
        const normalizedDistance = Math.min(Math.abs(distance), 50)
        return Math.max(0, 100 - (normalizedDistance * 2))
    }

    // No strategy state
    if (!strategy) {
        return (
            <div className={`border rounded-xl p-8 text-center ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <svg className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Strategy Required
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    A strategy with entry conditions is required to evaluate live signals.
                </p>
            </div>
        )
    }

    // Initial state - not loaded yet
    if (!status && !loading && !error) {
        return (
            <div className="space-y-6">
                <div className={`border rounded-xl p-8 text-center ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                        <svg className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Live Signal Evaluation
                    </h3>
                    <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Evaluate your strategy rules using real-time market data from Alpaca.
                        <br />
                        See which rules are triggered and how close values are to switching.
                    </p>
                    <button
                        onClick={fetchAll}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            isDark
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        Fetch Live Status
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Live Signal Status
                    </h3>
                    {lastRefresh && (
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchAll}
                    disabled={loading || historyLoading}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        loading || historyLoading
                            ? isDark
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isDark
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {loading || historyLoading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </>
                    )}
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className={`border rounded-xl p-5 ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className={`font-semibold ${isDark ? 'text-red-300' : 'text-red-900'}`}>
                                Error Fetching Live Status
                            </h4>
                            <p className={`text-sm mt-1 ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                                {error}
                            </p>
                            {error.includes('Alpaca') && (
                                <p className={`text-xs mt-2 ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
                                    Live status requires Alpaca API credentials to be configured on the server.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && !status && (
                <div className={`border rounded-xl p-8 text-center ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
                    <div className="animate-spin w-10 h-10 mx-auto mb-4">
                        <svg className={`w-10 h-10 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Fetching live market data...
                    </p>
                </div>
            )}

            {/* Status Display */}
            {status && (
                <>
                    {/* Target Allocation Banner */}
                    <div className={`border rounded-xl p-6 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-xs uppercase tracking-wide font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Current Target Allocation
                                </p>
                                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {status.target_allocation}
                                </h2>
                            </div>
                            <div className={`text-right`}>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {status.evaluation_date}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {status.evaluation_time}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Signal History Charts - One per condition */}
                    {(charts || historyLoading || historyError) && (
                        <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Condition History
                                </h4>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={historyDays}
                                        onChange={(e) => setHistoryDays(Number(e.target.value))}
                                        className={`text-xs px-2 py-1 rounded-lg border ${
                                            isDark
                                                ? 'bg-gray-800 border-gray-700 text-gray-300'
                                                : 'bg-white border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <option value={7}>7 days</option>
                                        <option value={14}>14 days</option>
                                        <option value={30}>30 days</option>
                                        <option value={60}>60 days</option>
                                        <option value={90}>90 days</option>
                                    </select>
                                    <button
                                        onClick={fetchHistory}
                                        disabled={historyLoading}
                                        className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                                            historyLoading
                                                ? isDark
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : isDark
                                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {historyLoading ? 'Loading...' : 'Update'}
                                    </button>
                                </div>
                            </div>

                            {historyError && (
                                <div className={`text-sm p-3 rounded-lg ${isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-700'}`}>
                                    {historyError}
                                </div>
                            )}

                            {historyLoading && !charts && (
                                <div className="flex items-center justify-center py-12">
                                    <svg className={`w-8 h-8 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}

                            {charts && charts.length > 0 && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {charts.map((chart) => {
                                        // Find the rule evaluation for this chart's allocation
                                        const ruleEval = status.rule_evaluations.find(r => r.allocation === chart.allocation)
                                        // Find the specific comparison within that rule (by index from chart.id)
                                        const compIndex = parseInt(chart.id.split('_').pop() || '0', 10)
                                        const comparison = ruleEval?.comparisons?.[compIndex]
                                        // Only show as "triggered" if this specific comparison is met
                                        const isTriggered = comparison?.triggered === true
                                        
                                        return (
                                            <ConditionChartComponent
                                                key={chart.id}
                                                chart={chart}
                                                isDark={isDark}
                                                isTriggered={isTriggered}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {charts && charts.length === 0 && (
                                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-sm">No condition history available for this strategy.</p>
                                    <p className="text-xs mt-1">Entry conditions with comparisons are required to display charts.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rule Evaluations */}
                    <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Rule Evaluations
                        </h4>
                        <div className="space-y-4">
                            {status.rule_evaluations.map((rule, idx) => (
                                <div
                                    key={idx}
                                    className={`border rounded-lg p-4 ${
                                        rule.triggered === true
                                            ? isDark
                                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                                : 'bg-emerald-50 border-emerald-200'
                                            : rule.triggered === false
                                                ? isDark
                                                    ? 'bg-white/[0.02] border-white/[0.08]'
                                                    : 'bg-gray-50 border-gray-200'
                                                : isDark
                                                    ? 'bg-blue-500/10 border-blue-500/30'
                                                    : 'bg-blue-50 border-blue-200'
                                    }`}
                                >
                                    {/* Rule Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-block px-3 py-1 rounded-full font-medium text-xs ${
                                                status.target_allocation === rule.allocation
                                                    ? isDark
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                    : isDark
                                                        ? 'bg-gray-800 text-gray-300 border border-gray-700'
                                                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                                            }`}>
                                                {rule.allocation}
                                            </span>
                                            {status.target_allocation === rule.allocation && (
                                                <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>
                                        {rule.triggered !== null && (
                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                rule.triggered
                                                    ? isDark
                                                        ? 'bg-emerald-500/20 text-emerald-300'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                    : isDark
                                                        ? 'bg-gray-700 text-gray-400'
                                                        : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {rule.triggered ? 'TRIGGERED' : 'NOT TRIGGERED'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Rule Expression */}
                                    {rule.rule !== '(fallback)' && (
                                        <p className={`text-sm font-mono mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {rule.rule}
                                        </p>
                                    )}

                                    {/* Comparisons */}
                                    {rule.comparisons.length > 0 && (
                                        <div className="space-y-3">
                                            {rule.comparisons.map((comp, compIdx) => (
                                                <div key={compIdx} className={`rounded-lg p-3 ${isDark ? 'bg-black/20' : 'bg-white'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                            {comp.left_name}
                                                        </span>
                                                        <span className={`text-sm ${
                                                            comp.triggered
                                                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                                                : isDark ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            <span className="font-mono font-bold">{formatValue(comp.left_value)}</span>
                                                            <span className="mx-2">{comp.comparison}</span>
                                                            <span className="font-mono">{formatValue(comp.right_value)}</span>
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(comp.distance_pct, comp.triggered)}`}
                                                            style={{ width: `${getProgressWidth(comp.distance_pct, comp.triggered)}%` }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Distance Indicator */}
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                            {comp.triggered
                                                                ? 'Condition met'
                                                                : comp.distance_pct !== null
                                                                    ? `${Math.abs(comp.distance_pct).toFixed(1)}% from threshold`
                                                                    : 'Distance unknown'
                                                            }
                                                        </span>
                                                        {!comp.triggered && comp.distance_pct !== null && comp.distance_pct < 10 && (
                                                            <span className={`text-xs font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                                                Close to switching!
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Fallback indicator */}
                                    {rule.rule === '(fallback)' && (
                                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            This is the fallback allocation (no entry condition required)
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Signal Values */}
                    {status.signal_values.length > 0 && (
                        <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
                            <h4 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Current Indicator Values
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {status.signal_values.map((signal, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-lg p-3 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}
                                    >
                                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {signal.name} ({signal.symbol})
                                        </p>
                                        <p className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {signal.name === 'Price' ? `$${formatValue(signal.value)}` : formatValue(signal.value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export const LiveStatusTab = memo(LiveStatusTabComponent)
