import React, { useMemo, useState, memo } from 'react'
import {
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    ReferenceLine,
    Line,
    ComposedChart
} from 'recharts'
import type { PortfolioFanChartProps } from '../types'
import { formatCurrency } from '../utils'

const PortfolioFanChartComponent: React.FC<PortfolioFanChartProps> = ({ isDark, pathData, years }) => {
    const [isLogScale, setIsLogScale] = useState(false)

    // Transform data for recharts
    const chartData = useMemo(() => {
        if (!pathData?.percentiles?.p50) return []

        const { percentiles, time_labels } = pathData
        const data = []

        for (let i = 0; i < percentiles.p50.length; i++) {
            data.push({
                time: time_labels[i] || `M${i}`,
                // For area chart we need the actual values for each percentile
                p5: percentiles.p5[i],
                p10: percentiles.p10[i],
                p25: percentiles.p25[i],
                p50: percentiles.p50[i],
                p75: percentiles.p75[i],
                p90: percentiles.p90[i],
                p95: percentiles.p95[i],
                // For the bands (difference from lower to upper)
                band_5_95: percentiles.p95[i] - percentiles.p5[i],
                band_10_90: percentiles.p90[i] - percentiles.p10[i],
                band_25_75: percentiles.p75[i] - percentiles.p25[i]
            })
        }
        return data
    }, [pathData])

    if (chartData.length === 0) return null

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.[0]) return null
        const data = payload[0].payload
        return (
            <div className={`px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl ${isDark
                ? 'bg-gray-900/95 border-white/[0.1] text-white'
                : 'bg-white/95 border-gray-200 text-gray-900'
                }`}>
                <p className={`text-xs font-semibold mb-2 pb-2 border-b ${isDark ? 'text-gray-300 border-white/[0.08]' : 'text-gray-600 border-gray-200'
                    }`}>
                    {label}
                </p>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                        <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>95th %ile</span>
                        <span className="font-semibold">{formatCurrency(data.p95)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className={isDark ? 'text-emerald-300' : 'text-emerald-500'}>90th %ile</span>
                        <span className="font-medium">{formatCurrency(data.p90)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>75th %ile</span>
                        <span className="font-medium">{formatCurrency(data.p75)}</span>
                    </div>
                    <div className={`flex justify-between gap-4 py-1.5 px-2 -mx-2 rounded-lg ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'
                        }`}>
                        <span className={`font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>Median</span>
                        <span className="font-bold">{formatCurrency(data.p50)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>25th %ile</span>
                        <span className="font-medium">{formatCurrency(data.p25)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className={isDark ? 'text-amber-300' : 'text-amber-500'}>10th %ile</span>
                        <span className="font-medium">{formatCurrency(data.p10)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className={isDark ? 'text-red-400' : 'text-red-600'}>5th %ile</span>
                        <span className="font-semibold">{formatCurrency(data.p5)}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark
            ? 'bg-white/[0.02] border-white/[0.08]'
            : 'bg-white border-gray-200'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl border ${isDark
                        ? 'bg-blue-500/15 border-blue-500/20'
                        : 'bg-blue-50 border-blue-200'
                        }`}>
                        <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Portfolio Growth Projection
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Range of possible outcomes over {years} years
                        </p>
                    </div>
                </div>

                {/* Log Scale Toggle */}
                <button
                    onClick={() => setIsLogScale(!isLogScale)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isLogScale
                        ? isDark
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : isDark
                            ? 'bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {isLogScale ? 'Log' : 'Linear'}
                </button>
            </div>

            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fanGradient5_95" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#6366f1' : '#818cf8'} stopOpacity={0.08} />
                                <stop offset="100%" stopColor={isDark ? '#6366f1' : '#818cf8'} stopOpacity={0.03} />
                            </linearGradient>
                            <linearGradient id="fanGradient10_90" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#6366f1' : '#6366f1'} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={isDark ? '#6366f1' : '#6366f1'} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fanGradient25_75" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#818cf8' : '#6366f1'} stopOpacity={0.35} />
                                <stop offset="100%" stopColor={isDark ? '#818cf8' : '#6366f1'} stopOpacity={0.25} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#64748b' }}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatCurrency}
                            scale={isLogScale ? 'log' : 'auto'}
                            domain={isLogScale ? ['auto', 'auto'] : ['auto', 'auto']}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />

                        {/* 5th-95th percentile band (widest, lightest) */}
                        <Area
                            type="monotone"
                            dataKey="p95"
                            stroke="none"
                            fill="url(#fanGradient5_95)"
                            isAnimationActive={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="p5"
                            stroke="none"
                            fill={isDark ? '#0f172a' : '#f8fafc'}
                            isAnimationActive={false}
                        />

                        {/* 10th-90th percentile band */}
                        <Area
                            type="monotone"
                            dataKey="p90"
                            stroke="none"
                            fill="url(#fanGradient10_90)"
                            isAnimationActive={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="p10"
                            stroke="none"
                            fill={isDark ? '#0f172a' : '#f8fafc'}
                            isAnimationActive={false}
                        />

                        {/* 25th-75th percentile band (narrowest, darkest) */}
                        <Area
                            type="monotone"
                            dataKey="p75"
                            stroke="none"
                            fill="url(#fanGradient25_75)"
                            isAnimationActive={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="p25"
                            stroke="none"
                            fill={isDark ? '#0f172a' : '#f8fafc'}
                            isAnimationActive={false}
                        />

                        {/* Median line (most prominent) */}
                        <Line
                            type="monotone"
                            dataKey="p50"
                            stroke={isDark ? '#a5b4fc' : '#6366f1'}
                            strokeWidth={2.5}
                            dot={false}
                            isAnimationActive={false}
                        />

                        {/* Initial capital reference line */}
                        <ReferenceLine
                            y={pathData.initial_capital}
                            stroke={isDark ? 'rgba(255,255,255,0.15)' : '#94a3b8'}
                            strokeDasharray="4 4"
                            strokeWidth={1}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Footer Legend */}
            <div className={`flex items-center justify-center gap-6 mt-4 pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Outcome Range</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-0.5 rounded ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Median Path</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-0.5 border-t-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-400'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Initial Capital</span>
                </div>
            </div>
        </div>
    )
}

// Memoize to prevent re-renders when data hasn't changed
export const PortfolioFanChart = memo(PortfolioFanChartComponent, (prevProps, nextProps) => {
    if (prevProps.isDark !== nextProps.isDark) return false
    if (prevProps.years !== nextProps.years) return false
    // Compare path data by checking percentile array lengths and key values
    const prevP50 = prevProps.pathData?.percentiles?.p50
    const nextP50 = nextProps.pathData?.percentiles?.p50
    if (!prevP50 || !nextP50) return prevP50 === nextP50
    if (prevP50.length !== nextP50.length) return false
    return prevP50[0] === nextP50[0] && prevP50[prevP50.length - 1] === nextP50[nextP50.length - 1]
})
