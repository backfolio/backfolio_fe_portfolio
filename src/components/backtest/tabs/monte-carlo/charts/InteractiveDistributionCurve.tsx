import React, { useMemo, memo } from 'react'
import {
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    ReferenceLine,
    ComposedChart
} from 'recharts'
import type { InteractiveDistributionCurveProps, CurvePoint } from '../types'
import { formatPercent, formatCurrencyDetailed } from '../utils'

const InteractiveDistributionCurveComponent: React.FC<InteractiveDistributionCurveProps> = ({
    isDark,
    p10,
    median,
    p90,
    years,
    initialCapital,
    hoveredScenario,
    setHoveredScenario
}) => {
    // Generate a smooth bell curve approximation based on p10, median, p90
    const curveData = useMemo((): CurvePoint[] => {
        // Safeguard: ensure we have valid spread
        const spread = Math.abs(p90 - p10)
        if (spread < 0.001) {
            // If spread is too small, return minimal data
            return [{
                cagr: median,
                cagrPercent: median * 100,
                probability: 100,
                percentile: 50,
                totalReturn: Math.pow(1 + median, years) - 1,
                finalValue: initialCapital * Math.pow(1 + median, years),
                isP10: false,
                isMedian: true,
                isP90: false,
                isNegative: median < 0
            }]
        }

        // Estimate standard deviation from p10/p90 spread (roughly 1.28 std each way)
        const estimatedStd = Math.max(spread / 2.56, 0.01) // Ensure minimum std
        const mean = median

        // Generate points for smooth curve
        const points: CurvePoint[] = []
        const minX = Math.max(mean - 3.5 * estimatedStd, -0.99) // Prevent total loss scenario going below -99%
        const maxX = Math.min(mean + 3.5 * estimatedStd, 1.0) // Cap at 100% CAGR to prevent Infinity
        const step = Math.max((maxX - minX) / 60, 0.001) // Ensure minimum step size

        // Safety: limit iterations
        let iterations = 0
        const maxIterations = 100

        for (let x = minX; x <= maxX && iterations < maxIterations; x += step) {
            iterations++

            // Normal distribution formula
            const z = (x - mean) / estimatedStd
            const probability = Math.exp(-0.5 * z * z) / (estimatedStd * Math.sqrt(2 * Math.PI))

            // Calculate percentile (approximate CDF)
            const percentile = 50 * (1 + Math.tanh(0.7 * z))

            // Safe compound calculation - prevent Infinity
            const safeCAGR = Math.max(-0.99, Math.min(x, 1.0))
            const totalReturn = Math.pow(1 + safeCAGR, years) - 1
            const finalValue = initialCapital * Math.pow(1 + safeCAGR, years)

            // Skip if values are invalid
            if (!isFinite(probability) || !isFinite(finalValue)) continue

            points.push({
                cagr: x,
                cagrPercent: x * 100,
                probability: probability * 100,
                percentile: Math.round(percentile),
                totalReturn,
                finalValue,
                isP10: Math.abs(x - p10) < step * 1.5,
                isMedian: Math.abs(x - median) < step * 1.5,
                isP90: Math.abs(x - p90) < step * 1.5,
                isNegative: x < 0
            })
        }
        return points
    }, [p10, median, p90, years, initialCapital])

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.[0]) return null
        const data = payload[0].payload

        return (
            <div className={`px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl ${
                isDark 
                    ? 'bg-gray-900/95 border-white/[0.1]' 
                    : 'bg-white/95 border-gray-200'
            }`}>
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${data.isNegative ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        ~{data.percentile}th Percentile
                    </span>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between gap-6">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Annual Return</span>
                        <span className={`text-sm font-bold ${data.isNegative ? 'text-red-500' : 'text-emerald-500'}`}>
                            {formatPercent(data.cagr)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-6">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Return ({years}y)</span>
                        <span className={`text-sm font-semibold ${data.totalReturn < 0 ? 'text-red-500' : isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {formatPercent(data.totalReturn)}
                        </span>
                    </div>
                    <div className={`flex justify-between gap-6 pt-1.5 mt-1.5 border-t ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Final Value</span>
                        <span className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {formatCurrencyDetailed(data.finalValue)}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-2">
            <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={curveData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="bellCurveGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={isDark ? '#f87171' : '#ef4444'} stopOpacity={0.6} />
                                <stop offset="20%" stopColor={isDark ? '#fbbf24' : '#f59e0b'} stopOpacity={0.6} />
                                <stop offset="50%" stopColor={isDark ? '#818cf8' : '#6366f1'} stopOpacity={0.8} />
                                <stop offset="80%" stopColor={isDark ? '#34d399' : '#10b981'} stopOpacity={0.6} />
                                <stop offset="100%" stopColor={isDark ? '#34d399' : '#10b981'} stopOpacity={0.6} />
                            </linearGradient>
                            <linearGradient id="bellCurveFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#6366f1' : '#818cf8'} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={isDark ? '#6366f1' : '#818cf8'} stopOpacity={0.03} />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="cagrPercent"
                            tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#94a3b8' }}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                            tickLine={false}
                            tickFormatter={(v) => `${v.toFixed(0)}%`}
                            domain={['dataMin', 'dataMax']}
                        />
                        <YAxis hide domain={[0, 'dataMax']} />

                        <RechartsTooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: isDark ? '#6366f1' : '#818cf8', strokeWidth: 2, strokeDasharray: '4 4' }}
                        />

                        {/* Zero reference line */}
                        <ReferenceLine
                            x={0}
                            stroke={isDark ? 'rgba(255,255,255,0.15)' : '#94a3b8'}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                        />

                        {/* P10 reference line */}
                        <ReferenceLine
                            x={p10 * 100}
                            stroke={isDark ? '#fbbf24' : '#f59e0b'}
                            strokeWidth={hoveredScenario === 'p10' ? 3 : 2}
                            strokeOpacity={hoveredScenario === 'p10' ? 1 : 0.7}
                        />

                        {/* Median reference line */}
                        <ReferenceLine
                            x={median * 100}
                            stroke={isDark ? '#818cf8' : '#6366f1'}
                            strokeWidth={hoveredScenario === 'median' ? 3 : 2}
                            strokeOpacity={hoveredScenario === 'median' ? 1 : 0.8}
                        />

                        {/* P90 reference line */}
                        <ReferenceLine
                            x={p90 * 100}
                            stroke={isDark ? '#34d399' : '#10b981'}
                            strokeWidth={hoveredScenario === 'p90' ? 3 : 2}
                            strokeOpacity={hoveredScenario === 'p90' ? 1 : 0.7}
                        />

                        {/* Bell curve area */}
                        <Area
                            type="monotone"
                            dataKey="probability"
                            stroke="url(#bellCurveGradient)"
                            strokeWidth={2.5}
                            fill="url(#bellCurveFill)"
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Percentile Labels below chart */}
            {curveData.length > 1 && (() => {
                const minCagr = curveData[0]?.cagrPercent ?? 0
                const maxCagr = curveData[curveData.length - 1]?.cagrPercent ?? 1
                const range = maxCagr - minCagr
                const safeRange = range > 0.01 ? range : 1 // Prevent division by zero

                const getPosition = (value: number) => {
                    const pos = ((value * 100 - minCagr) / safeRange) * 100
                    return Math.max(5, Math.min(95, pos)) // Clamp to 5-95% to keep labels visible
                }

                return (
                    <div className="relative h-6 mx-5">
                        {/* P10 label */}
                        <div
                            className={`absolute -translate-x-1/2 flex flex-col items-center cursor-pointer transition-all duration-200 ${hoveredScenario === 'p10' ? 'scale-110' : ''}`}
                            style={{ left: `${getPosition(p10)}%` }}
                            onMouseEnter={() => setHoveredScenario('p10')}
                            onMouseLeave={() => setHoveredScenario(null)}
                        >
                            <div className={`w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${isDark ? 'border-b-amber-500' : 'border-b-amber-500'}`} />
                            <span className={`text-[9px] font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>P10</span>
                        </div>

                        {/* Median label */}
                        <div
                            className={`absolute -translate-x-1/2 flex flex-col items-center cursor-pointer transition-all duration-200 ${hoveredScenario === 'median' ? 'scale-110' : ''}`}
                            style={{ left: `${getPosition(median)}%` }}
                            onMouseEnter={() => setHoveredScenario('median')}
                            onMouseLeave={() => setHoveredScenario(null)}
                        >
                            <div className={`w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${isDark ? 'border-b-indigo-400' : 'border-b-indigo-600'}`} />
                            <span className={`text-[9px] font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>MEDIAN</span>
                        </div>

                        {/* P90 label */}
                        <div
                            className={`absolute -translate-x-1/2 flex flex-col items-center cursor-pointer transition-all duration-200 ${hoveredScenario === 'p90' ? 'scale-110' : ''}`}
                            style={{ left: `${getPosition(p90)}%` }}
                            onMouseEnter={() => setHoveredScenario('p90')}
                            onMouseLeave={() => setHoveredScenario(null)}
                        >
                            <div className={`w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${isDark ? 'border-b-emerald-400' : 'border-b-emerald-500'}`} />
                            <span className={`text-[9px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>P90</span>
                        </div>
                    </div>
                )
            })()}

            {/* Interactive hint */}
            <div className={`text-center text-[10px] mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Hover anywhere on the curve to explore outcomes
                </span>
            </div>
        </div>
    )
}

// Memoize to prevent re-renders when data hasn't changed
export const InteractiveDistributionCurve = memo(InteractiveDistributionCurveComponent, (prevProps, nextProps) => {
    if (prevProps.isDark !== nextProps.isDark) return false
    if (prevProps.hoveredScenario !== nextProps.hoveredScenario) return false
    if (prevProps.p10 !== nextProps.p10) return false
    if (prevProps.median !== nextProps.median) return false
    if (prevProps.p90 !== nextProps.p90) return false
    if (prevProps.years !== nextProps.years) return false
    if (prevProps.initialCapital !== nextProps.initialCapital) return false
    return true
})
