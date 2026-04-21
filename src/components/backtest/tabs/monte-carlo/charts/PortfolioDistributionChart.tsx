import React, { useMemo, memo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts'
import type { PortfolioDistributionChartProps } from '../types'
import { formatCurrency } from '../utils'

const PortfolioDistributionChartComponent: React.FC<PortfolioDistributionChartProps> = ({
    isDark,
    distribution,
    initialCapital,
    medianValue,
    p10Value,
    p90Value,
    totalSimulations
}) => {
    // Use granular distribution directly from backend (P2-P98 focused)
    const chartData = useMemo(() => {
        if (!distribution?.bins || !distribution?.bin_edges) return []

        const bins = distribution.bins
        const edges = distribution.bin_edges
        const total = bins.reduce((a, b) => a + b, 0)

        if (total === 0) return []

        return bins
            .map((count, i) => {
                const leftEdge = edges[i]
                const rightEdge = edges[i + 1]
                if (leftEdge === undefined || rightEdge === undefined) return null

                const midpoint = (leftEdge + rightEdge) / 2
                const probability = (count / total) * 100

                return {
                    value: midpoint,
                    leftEdge,
                    rightEdge,
                    count,
                    probability,
                    isLoss: midpoint < initialCapital,
                    isMedian: medianValue >= leftEdge && medianValue < rightEdge
                }
            })
            .filter((d): d is NonNullable<typeof d> => d !== null && d.count > 0)
    }, [distribution, initialCapital, medianValue])

    if (chartData.length === 0) return null

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.[0]) return null
        const data = payload[0].payload
        const returnPct = ((data.value - initialCapital) / initialCapital) * 100

        return (
            <div className={`px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl ${
                isDark 
                    ? 'bg-gray-900/95 border-white/[0.1]' 
                    : 'bg-white/95 border-gray-200'
            }`}>
                <p className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                    Portfolio Value Range
                </p>
                <p className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(data.leftEdge)} — {formatCurrency(data.rightEdge)}
                </p>
                <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                        <span className={`font-semibold ${returnPct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(0)}%
                        </span>
                        return
                    </span>
                    <span>•</span>
                    <span><span className="font-semibold">{data.count}</span> simulations</span>
                    <span>•</span>
                    <span><span className="font-semibold">{data.probability.toFixed(1)}%</span> chance</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${
            isDark 
                ? 'bg-white/[0.02] border-white/[0.08]' 
                : 'bg-white border-gray-200'
        }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl border ${
                        isDark 
                            ? 'bg-purple-500/15 border-purple-500/20' 
                            : 'bg-purple-50 border-purple-200'
                    }`}>
                        <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Outcome Distribution</h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Probability of final portfolio values
                        </p>
                    </div>
                </div>
                <div className={`text-xs px-3 py-1.5 rounded-lg border ${
                    isDark 
                        ? 'bg-white/[0.03] text-gray-400 border-white/[0.08]' 
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                    {totalSimulations} simulations
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className={`grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl border ${
                isDark 
                    ? 'bg-white/[0.02] border-white/[0.06]' 
                    : 'bg-gray-50/70 border-gray-200'
            }`}>
                <div className="text-center">
                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${
                        isDark ? 'text-amber-400' : 'text-amber-600'
                    }`}>Pessimistic (10%)</p>
                    <p className={`text-lg font-bold ${p10Value < initialCapital ? 'text-red-500' : 'text-emerald-500'}`}>
                        {formatCurrency(p10Value)}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {((p10Value - initialCapital) / initialCapital * 100).toFixed(0)}% return
                    </p>
                </div>
                <div className="text-center">
                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${
                        isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>Median (50%)</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {formatCurrency(medianValue)}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        +{((medianValue - initialCapital) / initialCapital * 100).toFixed(0)}% return
                    </p>
                </div>
                <div className="text-center">
                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>Optimistic (90%)</p>
                    <p className={`text-lg font-bold text-emerald-500`}>
                        {formatCurrency(p90Value)}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        +{((p90Value - initialCapital) / initialCapital * 100).toFixed(0)}% return
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 35 }}>
                        <defs>
                            <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#f87171' : '#ef4444'} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={isDark ? '#f87171' : '#ef4444'} stopOpacity={0.5} />
                            </linearGradient>
                            <linearGradient id="gainGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#a78bfa' : '#8b5cf6'} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={isDark ? '#a78bfa' : '#8b5cf6'} stopOpacity={0.5} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="value"
                            stroke={isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8'}
                            style={{ fontSize: '10px', fontWeight: 500 }}
                            tickFormatter={formatCurrency}
                            tickLine={false}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                            interval="preserveStartEnd"
                            label={{
                                value: 'Final Portfolio Value',
                                position: 'insideBottom',
                                offset: -10,
                                style: { fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }
                            }}
                        />
                        <YAxis
                            stroke={isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8'}
                            style={{ fontSize: '10px', fontWeight: 500 }}
                            tickFormatter={(v) => `${v.toFixed(0)}%`}
                            tickLine={false}
                            axisLine={false}
                            width={45}
                            label={{
                                value: 'Probability',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: '10px', fill: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }
                            }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />

                        {/* Initial capital reference line */}
                        <ReferenceLine
                            x={initialCapital}
                            stroke={isDark ? '#fbbf24' : '#f59e0b'}
                            strokeWidth={2}
                            strokeDasharray="6 4"
                            label={{
                                value: 'Start',
                                position: 'top',
                                style: { fontSize: '10px', fill: isDark ? '#fbbf24' : '#f59e0b', fontWeight: 600 }
                            }}
                        />

                        {/* Median reference line */}
                        <ReferenceLine
                            x={medianValue}
                            stroke={isDark ? '#a78bfa' : '#8b5cf6'}
                            strokeWidth={2}
                            strokeDasharray="6 4"
                        />

                        <Bar
                            dataKey="probability"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                            isAnimationActive={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isLoss ? 'url(#lossGradient)' : 'url(#gainGradient)'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Footer Legend */}
            <div className={`flex items-center justify-center gap-6 mt-4 pt-4 border-t ${
                isDark ? 'border-white/[0.06]' : 'border-gray-100'
            }`}>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-red-400' : 'bg-red-500'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Below Starting Value</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-purple-400' : 'bg-purple-500'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Above Starting Value</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-0.5 border-t-2 border-dashed ${isDark ? 'border-amber-400' : 'border-amber-500'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Initial Capital</span>
                </div>
            </div>
        </div>
    )
}

// Memoize to prevent re-renders when data hasn't changed
export const PortfolioDistributionChart = memo(PortfolioDistributionChartComponent, (prevProps, nextProps) => {
    // Compare key props that affect chart rendering
    if (prevProps.isDark !== nextProps.isDark) return false
    if (prevProps.initialCapital !== nextProps.initialCapital) return false
    if (prevProps.medianValue !== nextProps.medianValue) return false
    if (prevProps.totalSimulations !== nextProps.totalSimulations) return false
    // Compare distribution by checking bins length and key values
    const prevBins = prevProps.distribution?.bins
    const nextBins = nextProps.distribution?.bins
    if (!prevBins || !nextBins) return prevBins === nextBins
    if (prevBins.length !== nextBins.length) return false
    return prevBins[0] === nextBins[0] && prevBins[prevBins.length - 1] === nextBins[nextBins.length - 1]
})
