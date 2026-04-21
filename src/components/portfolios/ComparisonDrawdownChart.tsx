/**
 * ComparisonDrawdownChart - Multi-Strategy Drawdown Comparison
 * 
 * Displays overlapping area charts showing drawdown (underwater equity)
 * for multiple strategies. Includes reference lines for danger zones
 * and summary statistics for each strategy.
 * 
 * @module components/portfolios/ComparisonDrawdownChart
 */

import { memo, useMemo } from 'react'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ReferenceLine
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'
import type { ComparisonStrategy, DrawdownDataPoint } from './comparison'
import { sampleDataForPerformance } from './comparison'

// =============================================================================
// TYPES
// =============================================================================

interface ComparisonDrawdownChartProps {
    /** Drawdown data points */
    data: DrawdownDataPoint[]
    /** Strategies being compared */
    strategies: ComparisonStrategy[]
}

interface TooltipPayloadEntry {
    name: string
    value: number
    stroke: string
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Drawdown threshold for warning (yellow/orange) */
const WARNING_THRESHOLD = -10

/** Drawdown threshold for danger (red) */
const DANGER_THRESHOLD = -20

/** Maximum points to render for performance */
const MAX_CHART_POINTS = 500

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipPayloadEntry[]
    label?: string
    isDark: boolean
}

/** Custom tooltip component for drawdown chart */
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isDark }) => {
    if (!active || !payload || !payload.length) return null

    const date = new Date(label || '')
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

    return (
        <div className={`px-4 py-3 rounded-xl border shadow-xl ${isDark ? 'bg-gray-900/95 border-white/10' : 'bg-white/98 border-gray-200'
            }`}>
            <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {formattedDate}
            </div>
            <div className="space-y-1.5">
                {[...payload]
                    .sort((a, b) => a.value - b.value) // Sort by drawdown (most negative first)
                    .map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.stroke }}
                            />
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {entry.name}:
                            </span>
                            <span className={`text-xs font-bold ${getDrawdownColor(entry.value, isDark)}`}>
                                {entry.value.toFixed(2)}%
                            </span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

/** Individual strategy stat card */
interface StatCardProps {
    strategy: ComparisonStrategy
    isDark: boolean
    maxDrawdownDate?: string
}

const StatCard: React.FC<StatCardProps> = ({ strategy, isDark, maxDrawdownDate }) => {
    const maxDD = strategy.result?.result?.metrics?.max_drawdown || 0

    return (
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: strategy.color.stroke }}
                />
                <span className={`text-xs font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {strategy.name}
                </span>
            </div>
            <div className={`text-lg font-bold ${getDrawdownColor(maxDD * 100, isDark)}`}>
                {(maxDD * 100).toFixed(1)}%
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Max Drawdown
            </div>
            {maxDrawdownDate && (
                <div className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    {new Date(maxDrawdownDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            )}
        </div>
    )
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get appropriate color class for a drawdown value
 */
function getDrawdownColor(value: number, isDark: boolean): string {
    if (value < DANGER_THRESHOLD) return 'text-red-500'
    if (value < WARNING_THRESHOLD) return 'text-orange-500'
    return isDark ? 'text-emerald-400' : 'text-emerald-600'
}

/**
 * Format date for axis tick
 */
function formatAxisDate(value: string): string {
    const date = new Date(value)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ComparisonDrawdownChartComponent: React.FC<ComparisonDrawdownChartProps> = ({
    data,
    strategies
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Sample data for performance
    const sampledData = useMemo(() =>
        sampleDataForPerformance(data, MAX_CHART_POINTS),
        [data]
    )

    // Filter valid strategies (no errors, has results)
    const validStrategies = useMemo(() =>
        strategies.filter(s => !s.error && s.result),
        [strategies]
    )

    // Calculate max drawdown dates for each strategy
    const maxDrawdownDates = useMemo(() => {
        const dates: Record<string, string> = {}

        strategies.forEach((strategy, idx) => {
            if (strategy.error || !strategy.result) return

            let minDrawdown = 0
            let minDate = ''

            data.forEach(point => {
                const dd = point[`drawdown_${idx}`]
                if (dd !== undefined && dd !== null && dd < minDrawdown) {
                    minDrawdown = dd
                    minDate = point.date
                }
            })

            if (minDate) {
                dates[strategy.id] = minDate
            }
        })

        return dates
    }, [data, strategies])

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <ChartHeader isDark={isDark} />
                <div className={`h-[300px] w-full flex items-center justify-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    No drawdown data available
                </div>
            </div>
        )
    }

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
                <ChartHeader isDark={isDark} />

                {/* Help tooltip */}
                <div className={`text-xs px-3 py-1.5 rounded-lg ${isDark ? 'bg-white/[0.05] text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    💡 Shallower drawdowns = better risk management
                </div>
            </div>

            {/* Main Chart */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sampledData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        {/* Gradient definitions */}
                        <defs>
                            {strategies.map((strategy, idx) => (
                                <linearGradient key={strategy.id} id={`ddGradient_${idx}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={strategy.color.stroke} stopOpacity={0.05} />
                                    <stop offset="95%" stopColor={strategy.color.stroke} stopOpacity={0.2} />
                                </linearGradient>
                            ))}
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}
                            opacity={0.5}
                            vertical={false}
                        />

                        {/* Reference lines for context */}
                        <ReferenceLine
                            y={0}
                            stroke={isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                        />
                        <ReferenceLine
                            y={WARNING_THRESHOLD}
                            stroke={isDark ? 'rgba(251, 146, 60, 0.3)' : 'rgba(251, 146, 60, 0.4)'}
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            label={{
                                value: `${WARNING_THRESHOLD}%`,
                                position: 'right',
                                fill: isDark ? 'rgba(251, 146, 60, 0.7)' : 'rgba(251, 146, 60, 0.8)',
                                fontSize: 10
                            }}
                        />
                        <ReferenceLine
                            y={DANGER_THRESHOLD}
                            stroke={isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)'}
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            label={{
                                value: `${DANGER_THRESHOLD}%`,
                                position: 'right',
                                fill: isDark ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.8)',
                                fontSize: 10
                            }}
                        />

                        <XAxis
                            dataKey="date"
                            stroke={isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}
                            style={{ fontSize: '11px', fontWeight: 500, fill: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}
                            tickFormatter={formatAxisDate}
                            interval="preserveStartEnd"
                            minTickGap={80}
                            tickLine={false}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
                        />

                        <YAxis
                            stroke={isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}
                            style={{ fontSize: '11px', fontWeight: 500, fill: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}
                            tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                            domain={['dataMin - 5', 5]}
                            tickLine={false}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
                        />

                        <Tooltip content={<CustomTooltip isDark={isDark} />} />

                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value: string) => (
                                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {value}
                                </span>
                            )}
                        />

                        {/* Strategy areas */}
                        {strategies
                            .filter(s => !s.error)
                            .map((strategy, idx) => (
                                <Area
                                    key={strategy.id}
                                    type="monotone"
                                    dataKey={`drawdown_${idx}`}
                                    name={strategy.name}
                                    stroke={strategy.color.stroke}
                                    strokeWidth={2}
                                    fill={`url(#ddGradient_${idx})`}
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 2 }}
                                    isAnimationActive={false}
                                />
                            ))
                        }
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            {validStrategies.length > 0 && (
                <div className={`mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 gap-3 ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}
                    style={{
                        gridTemplateColumns: `repeat(${Math.min(validStrategies.length, 6)}, minmax(0, 1fr))`
                    }}
                >
                    {validStrategies.map((strategy) => (
                        <StatCard
                            key={strategy.id}
                            strategy={strategy}
                            isDark={isDark}
                            maxDrawdownDate={maxDrawdownDates[strategy.id]}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/** Chart header with icon and title */
const ChartHeader: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-11 h-11 border rounded-xl ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
            <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
        </div>
        <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Drawdown Comparison
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Underwater equity curves - lower is worse
            </p>
        </div>
    </div>
)

// Memoize to prevent unnecessary re-renders
export const ComparisonDrawdownChart = memo(ComparisonDrawdownChartComponent, (prevProps, nextProps) => {
    if (prevProps.data.length !== nextProps.data.length) return false
    if (prevProps.strategies.length !== nextProps.strategies.length) return false
    return true
})
