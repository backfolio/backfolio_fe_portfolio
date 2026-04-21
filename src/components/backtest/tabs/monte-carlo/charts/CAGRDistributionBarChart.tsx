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
import type { CAGRDistributionBarChartProps } from '../types'

const CAGRDistributionBarChartComponent: React.FC<CAGRDistributionBarChartProps> = ({
    isDark,
    distribution,
    p10,
    median,
    p90,
    totalSimulations,
    hoveredScenario
}) => {
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

                // Determine if this bin contains a percentile
                const containsP10 = p10 >= leftEdge && p10 < rightEdge
                const containsMedian = median >= leftEdge && median < rightEdge
                const containsP90 = p90 >= leftEdge && p90 < rightEdge

                return {
                    cagr: midpoint,
                    leftEdge,
                    rightEdge,
                    count,
                    probability,
                    isNegative: midpoint < 0,
                    containsP10,
                    containsMedian,
                    containsP90
                }
            })
            .filter((d): d is NonNullable<typeof d> => d !== null && d.count > 0)
    }, [distribution, p10, median, p90])

    if (chartData.length === 0) return null

    const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.[0]) return null
        const data = payload[0].payload

        return (
            <div className={`px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl ${
                isDark 
                    ? 'bg-gray-900/95 border-white/[0.1]' 
                    : 'bg-white/95 border-gray-200'
            }`}>
                <p className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                    Annual Return Range
                </p>
                <p className={`text-base font-bold mb-1 ${data.isNegative ? 'text-red-500' : 'text-emerald-500'}`}>
                    {formatPercent(data.leftEdge)} to {formatPercent(data.rightEdge)}
                </p>
                <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span><span className="font-semibold">{data.count}</span> simulations</span>
                    <span>•</span>
                    <span><span className="font-semibold">{data.probability.toFixed(1)}%</span> chance</span>
                </div>
                {(data.containsP10 || data.containsMedian || data.containsP90) && (
                    <div className={`mt-2 pt-2 border-t flex items-center gap-2 ${
                        isDark ? 'border-white/[0.08]' : 'border-gray-200'
                    }`}>
                        {data.containsP10 && <span className="text-xs text-amber-500 font-medium">P10</span>}
                        {data.containsMedian && <span className="text-xs text-indigo-500 font-medium">Median</span>}
                        {data.containsP90 && <span className="text-xs text-emerald-500 font-medium">P90</span>}
                    </div>
                )}
            </div>
        )
    }

    // Find the bar that contains each percentile for highlighting
    const getBarColor = (data: typeof chartData[0]) => {
        if (hoveredScenario === 'p10' && data.containsP10) {
            return isDark ? '#fbbf24' : '#f59e0b' // amber
        }
        if (hoveredScenario === 'median' && data.containsMedian) {
            return isDark ? '#818cf8' : '#6366f1' // indigo
        }
        if (hoveredScenario === 'p90' && data.containsP90) {
            return isDark ? '#34d399' : '#10b981' // emerald
        }

        // Default colors based on positive/negative
        if (data.isNegative) {
            return isDark ? '#f87171' : '#ef4444'
        }
        return isDark ? '#34d399' : '#10b981'
    }

    return (
        <div className={`mt-6 pt-5 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Distribution of Annual Returns
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {totalSimulations} simulations
                </p>
            </div>
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 15, left: 15, bottom: 35 }}>
                        <defs>
                            <linearGradient id="cagrNegativeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#f87171' : '#ef4444'} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={isDark ? '#f87171' : '#ef4444'} stopOpacity={0.5} />
                            </linearGradient>
                            <linearGradient id="cagrPositiveGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#34d399' : '#10b981'} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={isDark ? '#34d399' : '#10b981'} stopOpacity={0.5} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="cagr"
                            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                            tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#64748b' }}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                            tickLine={false}
                            interval="preserveStartEnd"
                            label={{
                                value: 'Annual Return (CAGR)',
                                position: 'insideBottom',
                                offset: -10,
                                style: { fontSize: 10, fill: isDark ? '#6b7280' : '#94a3b8' }
                            }}
                        />
                        <YAxis
                            tickFormatter={(val) => `${val.toFixed(0)}%`}
                            tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#64748b' }}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                            tickLine={false}
                            width={50}
                            domain={[0, 'auto']}
                            label={{
                                value: 'Probability',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 5,
                                style: { fontSize: 10, fill: isDark ? '#6b7280' : '#94a3b8', textAnchor: 'middle' }
                            }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                        <ReferenceLine x={0} stroke={isDark ? 'rgba(255,255,255,0.15)' : '#94a3b8'} strokeDasharray="3 3" />
                        <Bar
                            dataKey="probability"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={20}
                            isAnimationActive={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry)}
                                    opacity={
                                        hoveredScenario
                                            ? (hoveredScenario === 'p10' && entry.containsP10) ||
                                                (hoveredScenario === 'median' && entry.containsMedian) ||
                                                (hoveredScenario === 'p90' && entry.containsP90)
                                                ? 1
                                                : 0.3
                                            : 0.85
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className={`flex items-center justify-center gap-6 mt-4 text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-red-400' : 'bg-red-500'}`} />
                    <span>Negative Return</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                    <span>Positive Return</span>
                </div>
            </div>
        </div>
    )
}

// Memoize to prevent re-renders when data hasn't changed
export const CAGRDistributionBarChart = memo(CAGRDistributionBarChartComponent, (prevProps, nextProps) => {
    if (prevProps.isDark !== nextProps.isDark) return false
    if (prevProps.hoveredScenario !== nextProps.hoveredScenario) return false
    if (prevProps.p10 !== nextProps.p10) return false
    if (prevProps.median !== nextProps.median) return false
    if (prevProps.p90 !== nextProps.p90) return false
    // Compare distribution by checking bins
    const prevBins = prevProps.distribution?.bins
    const nextBins = nextProps.distribution?.bins
    if (!prevBins || !nextBins) return prevBins === nextBins
    if (prevBins.length !== nextBins.length) return false
    return prevBins[0] === nextBins[0] && prevBins[prevBins.length - 1] === nextBins[nextBins.length - 1]
})
