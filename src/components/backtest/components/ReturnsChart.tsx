import React, { memo, useState, useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts'
import { ReturnsDataPoint } from '../types/backtestResults'
import { useTheme } from '../../../context/ThemeContext'

interface ReturnsChartProps {
    data: ReturnsDataPoint[]
}

type ViewMode = 'timeline' | 'distribution'
type TimePeriod = '1M' | '3M' | '6M' | '1Y' | '2Y' | '3Y' | '5Y' | 'ALL'

interface DistributionBucket {
    range: string
    count: number
    percentage: number
    midpoint: number
}

const ReturnsChartComponent: React.FC<ReturnsChartProps> = ({ data }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [viewMode, setViewMode] = useState<ViewMode>('timeline')
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('ALL')

    // Filter data by time period
    const filteredData = useMemo(() => {
        if (!data || data.length === 0) return []
        if (timePeriod === 'ALL') return data

        const now = new Date(data[data.length - 1].date)
        const cutoffDate = new Date(now)

        switch (timePeriod) {
            case '1M':
                cutoffDate.setMonth(cutoffDate.getMonth() - 1)
                break
            case '3M':
                cutoffDate.setMonth(cutoffDate.getMonth() - 3)
                break
            case '6M':
                cutoffDate.setMonth(cutoffDate.getMonth() - 6)
                break
            case '1Y':
                cutoffDate.setFullYear(cutoffDate.getFullYear() - 1)
                break
            case '2Y':
                cutoffDate.setFullYear(cutoffDate.getFullYear() - 2)
                break
            case '3Y':
                cutoffDate.setFullYear(cutoffDate.getFullYear() - 3)
                break
            case '5Y':
                cutoffDate.setFullYear(cutoffDate.getFullYear() - 5)
                break
        }

        return data.filter(d => new Date(d.date) >= cutoffDate)
    }, [data, timePeriod])

    // Calculate distribution buckets for histogram
    const distributionData = useMemo((): DistributionBucket[] => {
        if (!filteredData || filteredData.length === 0) return []

        const returns = filteredData.map(d => d.return)
        const min = Math.min(...returns)
        const max = Math.max(...returns)

        // Create dynamic buckets based on data range
        const range = max - min
        const bucketSize = range > 10 ? 2 : range > 5 ? 1 : 0.5
        const bucketStart = Math.floor(min / bucketSize) * bucketSize
        const bucketEnd = Math.ceil(max / bucketSize) * bucketSize

        const buckets: Map<number, number> = new Map()

        // Initialize buckets
        for (let i = bucketStart; i < bucketEnd; i += bucketSize) {
            buckets.set(i, 0)
        }

        // Count returns in each bucket
        returns.forEach(r => {
            const bucketKey = Math.floor(r / bucketSize) * bucketSize
            buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + 1)
        })

        // Convert to array format for chart
        const total = returns.length
        return Array.from(buckets.entries())
            .map(([key, count]) => ({
                range: `${key.toFixed(1)}% to ${(key + bucketSize).toFixed(1)}%`,
                count,
                percentage: (count / total) * 100,
                midpoint: key + bucketSize / 2
            }))
            .sort((a, b) => a.midpoint - b.midpoint)
    }, [filteredData])

    // Calculate summary statistics
    const stats = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return { mean: 0, median: 0, stdDev: 0, positive: 0, negative: 0, winRate: 0 }
        }

        const returns = filteredData.map(d => d.return)
        const sorted = [...returns].sort((a, b) => a - b)

        const mean = returns.reduce((a, b) => a + b, 0) / returns.length
        const median = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)]

        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
        const stdDev = Math.sqrt(variance)

        const positive = returns.filter(r => r > 0).length
        const negative = returns.filter(r => r < 0).length
        const winRate = (positive / returns.length) * 100

        return { mean, median, stdDev, positive, negative, winRate }
    }, [filteredData])

    // Smart sampling for timeline view - show all data but limit for very long periods
    const { timelineData, isSampled, sampleRatio } = useMemo(() => {
        const maxBars = 150 // Max bars for readable chart

        if (filteredData.length <= maxBars) {
            return { timelineData: filteredData, isSampled: false, sampleRatio: 1 }
        }

        // Sample data evenly for longer periods
        const step = Math.ceil(filteredData.length / maxBars)
        const sampled: ReturnsDataPoint[] = []

        for (let i = 0; i < filteredData.length; i += step) {
            // For sampled periods, aggregate returns
            const sliceEnd = Math.min(i + step, filteredData.length)
            const slice = filteredData.slice(i, sliceEnd)

            // Sum returns for the period (compounding simplified)
            const periodReturn = slice.reduce((acc, d) => acc + d.return, 0)

            sampled.push({
                date: slice[Math.floor(slice.length / 2)].date, // Use middle date
                return: periodReturn / slice.length // Average return for the period
            })
        }

        return { timelineData: sampled, isSampled: true, sampleRatio: step }
    }, [filteredData])

    if (!data || data.length === 0) {
        return (
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`flex items-center justify-center w-11 h-11 border rounded-xl ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                        <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Returns</h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Daily percentage changes</p>
                    </div>
                </div>
                <div className={`h-[350px] w-full flex items-center justify-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    No returns data available
                </div>
            </div>
        )
    }

    const timePeriods: TimePeriod[] = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', 'ALL']

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
            {/* Header with Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-11 h-11 border rounded-xl ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                        <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Returns</h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {viewMode === 'timeline' ? 'Daily percentage changes' : 'Return frequency distribution'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className={`flex items-center p-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${viewMode === 'timeline'
                                ? isDark
                                    ? 'bg-blue-500/20 text-blue-400 shadow-sm'
                                    : 'bg-white text-blue-600 shadow-sm'
                                : isDark
                                    ? 'text-gray-400 hover:text-gray-300'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                                Timeline
                            </span>
                        </button>
                        <button
                            onClick={() => setViewMode('distribution')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${viewMode === 'distribution'
                                ? isDark
                                    ? 'bg-purple-500/20 text-purple-400 shadow-sm'
                                    : 'bg-white text-purple-600 shadow-sm'
                                : isDark
                                    ? 'text-gray-400 hover:text-gray-300'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Distribution
                            </span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className={`w-px h-6 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>

                    {/* Time Period Filter */}
                    <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        {timePeriods.map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimePeriod(period)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${timePeriod === period
                                    ? isDark
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-white text-emerald-600 shadow-sm'
                                    : isDark
                                        ? 'text-gray-400 hover:text-gray-300'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Info Bar */}
            {filteredData.length > 0 && (
                <div className={`flex flex-wrap items-center justify-between gap-2 mb-4 px-3 py-2 rounded-lg text-xs ${isDark ? 'bg-white/[0.03] text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                    <div className="flex items-center gap-4">
                        <span>
                            <span className="font-semibold">{filteredData.length}</span> trading days
                        </span>
                        {filteredData.length > 0 && (
                            <span>
                                {new Date(filteredData[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                    {viewMode === 'timeline' && isSampled && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Averaged ({sampleRatio}-day periods)
                        </span>
                    )}
                </div>
            )}

            {/* Summary Statistics (shown in distribution mode) */}
            {viewMode === 'distribution' && (
                <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 p-4 rounded-xl ${isDark ? 'bg-white/[0.03] border border-white/[0.08]' : 'bg-gray-50 border border-gray-100'}`}>
                    <div className="text-center">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Win Rate</p>
                        <p className={`text-lg font-bold ${stats.winRate >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.winRate.toFixed(1)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Mean Return</p>
                        <p className={`text-lg font-bold ${stats.mean >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.mean >= 0 ? '+' : ''}{stats.mean.toFixed(3)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Median</p>
                        <p className={`text-lg font-bold ${stats.median >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.median >= 0 ? '+' : ''}{stats.median.toFixed(3)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Std Dev</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                            {stats.stdDev.toFixed(3)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Up Days</p>
                        <p className={`text-lg font-bold text-emerald-500`}>
                            {stats.positive}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Down Days</p>
                        <p className={`text-lg font-bold text-red-500`}>
                            {stats.negative}
                        </p>
                    </div>
                </div>
            )}

            {/* Chart Area */}
            <div className="h-[350px] w-full">
                {viewMode === 'timeline' ? (
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                        <BarChart data={timelineData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'} opacity={0.3} vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke={isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}
                                style={{ fontSize: '10px', fontWeight: 500, fill: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                }}
                                interval="preserveStartEnd"
                                minTickGap={50}
                                tickLine={false}
                                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
                            />
                            <YAxis
                                stroke={isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}
                                style={{ fontSize: '11px', fontWeight: 500, fill: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}
                                tickFormatter={(value) => `${value.toFixed(1)}%`}
                                tickLine={false}
                                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
                                width={50}
                            />
                            <ReferenceLine y={0} stroke={isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8'} strokeWidth={1} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                }}
                                labelStyle={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontWeight: 600,
                                    marginBottom: '4px',
                                    fontSize: '11px'
                                }}
                                itemStyle={{
                                    color: '#60a5fa',
                                    fontWeight: 700,
                                    fontSize: '14px'
                                }}
                                formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, 'Daily Return']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            />
                            <Bar
                                dataKey="return"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={8}
                                isAnimationActive={false}
                            >
                                {timelineData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.return >= 0 ? '#10b981' : '#ef4444'}
                                        fillOpacity={0.85}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                        <BarChart data={distributionData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'} opacity={0.3} vertical={false} />
                            <XAxis
                                dataKey="midpoint"
                                stroke={isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}
                                style={{ fontSize: '10px', fontWeight: 500, fill: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}
                                tickFormatter={(value) => `${value.toFixed(1)}%`}
                                tickLine={false}
                                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
                            />
                            <YAxis
                                stroke={isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}
                                style={{ fontSize: '11px', fontWeight: 500, fill: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}
                                tickFormatter={(value) => `${value.toFixed(0)}`}
                                tickLine={false}
                                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
                                width={40}
                                label={{
                                    value: 'Days',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fontSize: '10px', fill: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }
                                }}
                            />
                            <ReferenceLine x={0} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#64748b'} strokeWidth={2} strokeDasharray="4 4" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                }}
                                labelStyle={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontWeight: 600,
                                    marginBottom: '4px',
                                    fontSize: '11px'
                                }}
                                formatter={(value: number, name: string) => {
                                    if (name === 'count') {
                                        return [`${value} days`, 'Frequency']
                                    }
                                    return [value, name]
                                }}
                                labelFormatter={(label) => `Return range: ${label}%`}
                            />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                                isAnimationActive={false}
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.midpoint >= 0 ? '#8b5cf6' : '#f59e0b'}
                                        fillOpacity={0.85}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Footer Legend */}
            <div className={`flex items-center justify-center gap-6 mt-4 pt-4 border-t ${isDark ? 'border-white/[0.08]' : 'border-gray-100'}`}>
                {viewMode === 'timeline' ? (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Positive Returns</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Negative Returns</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Positive Range</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Negative Range</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-0.5 border-t-2 border-dashed ${isDark ? 'border-white/30' : 'border-gray-400'}`}></div>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Zero Line</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// Memoize to prevent re-renders when data hasn't changed
export const ReturnsChart = memo(ReturnsChartComponent, (prevProps, nextProps) => {
    if (prevProps.data.length !== nextProps.data.length) return false
    if (prevProps.data.length === 0) return true
    const prevFirst = prevProps.data[0]
    const nextFirst = nextProps.data[0]
    const prevLast = prevProps.data[prevProps.data.length - 1]
    const nextLast = nextProps.data[nextProps.data.length - 1]
    return prevFirst?.date === nextFirst?.date &&
        prevFirst?.return === nextFirst?.return &&
        prevLast?.date === nextLast?.date &&
        prevLast?.return === nextLast?.return
})
