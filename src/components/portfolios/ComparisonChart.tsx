/**
 * ComparisonChart - Multi-Strategy Portfolio Value Chart
 * 
 * Displays overlapping line charts showing portfolio value over time
 * for multiple strategies. Supports normalized (%) and absolute ($) views,
 * as well as linear and logarithmic scales.
 * 
 * @module components/portfolios/ComparisonChart
 */

import { memo, useState, useMemo } from 'react'
import {
    Chart as ChartJS,
    LinearScale,
    LogarithmicScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { useTheme } from '../../context/ThemeContext'
import type { ComparisonStrategy, PortfolioDataPoint } from './comparison'
import { formatCurrency } from './comparison'

// Register Chart.js components
ChartJS.register(
    TimeScale,
    LinearScale,
    LogarithmicScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
)

// =============================================================================
// TYPES
// =============================================================================

interface ComparisonChartProps {
    /** Portfolio value data points */
    data: PortfolioDataPoint[]
    /** Strategies being compared */
    strategies: ComparisonStrategy[]
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ToggleButtonProps {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
    title: string
    activeColor: 'emerald' | 'purple'
    isDark: boolean
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
    active,
    onClick,
    icon,
    label,
    title,
    activeColor,
    isDark
}) => {
    const colorClasses = {
        emerald: active
            ? isDark
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
            : isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        purple: active
            ? isDark
                ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40'
                : 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
            : isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${colorClasses[activeColor]}`}
            title={title}
        >
            {icon}
            {label}
        </button>
    )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ComparisonChartComponent: React.FC<ComparisonChartProps> = ({ data, strategies }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Chart options state
    const [useLogScale, setUseLogScale] = useState(false)
    const [normalizeValues, setNormalizeValues] = useState(false)

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <ChartHeader isDark={isDark} subtitle="Compare performance across strategies" />
                <div className={`h-[400px] w-full flex items-center justify-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    No portfolio data available
                </div>
            </div>
        )
    }

    // Process data: normalize to percentage growth if enabled
    const processedData = useMemo(() => {
        if (!normalizeValues) return data

        return data.map(point => {
            const normalized: PortfolioDataPoint = { date: point.date }
            strategies.forEach((_, idx) => {
                const value = point[`value_${idx}`]
                const firstValue = data[0][`value_${idx}`]
                if (value !== null && value !== undefined && firstValue) {
                    normalized[`value_${idx}`] = ((value / firstValue) - 1) * 100
                }
            })
            return normalized
        })
    }, [data, strategies, normalizeValues])

    // Build Chart.js datasets
    const datasets = useMemo(() =>
        strategies
            .filter(s => !s.error)
            .map((strategy, idx) => {
                const points = processedData
                    .filter(d => d[`value_${idx}`] !== null && d[`value_${idx}`] !== undefined)
                    .map(d => ({
                        x: new Date(d.date).getTime(),
                        y: d[`value_${idx}`] as number
                    }))

                return {
                    label: strategy.name,
                    data: points,
                    fill: false,
                    borderColor: strategy.color.stroke,
                    backgroundColor: strategy.color.fill,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: strategy.color.stroke,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    tension: 0.3,
                }
            }),
        [strategies, processedData]
    )

    // Chart.js options - using 'any' type to avoid complex Chart.js type issues
    // The options are validated at runtime by Chart.js
    const options: any = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 500,
            easing: 'easeOutQuart'
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                padding: 14,
                cornerRadius: 12,
                titleColor: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                titleFont: { weight: '600', size: 11 },
                bodyColor: isDark ? '#fff' : '#111',
                bodyFont: { weight: '500', size: 13 },
                bodySpacing: 8,
                usePointStyle: true,
                boxPadding: 6,
                callbacks: {
                    title: (items: any[]) => {
                        if (items.length > 0 && items[0].parsed.x !== null) {
                            const date = new Date(items[0].parsed.x)
                            return date.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })
                        }
                        return ''
                    },
                    label: (item: any) => {
                        const value = item.parsed.y
                        if (value === null) return ''
                        if (normalizeValues) {
                            return `${item.dataset.label}: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
                        }
                        return `${item.dataset.label}: ${formatCurrency(value)}`
                    }
                }
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                    displayFormats: { month: 'MMM yy' },
                },
                grid: { display: false },
                border: { color: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' },
                ticks: {
                    color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                    font: { size: 11, weight: '500' },
                    maxTicksLimit: 10,
                    autoSkip: true,
                },
            },
            y: {
                type: useLogScale ? 'logarithmic' : 'linear',
                grid: {
                    color: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                    lineWidth: 0.5,
                },
                border: { color: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' },
                ticks: {
                    color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                    font: { size: 11, weight: '500' },
                    callback: normalizeValues
                        ? (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`
                        : (value: number) => formatCurrency(value),
                },
            },
        },
    }), [isDark, normalizeValues, useLogScale])

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
                <ChartHeader
                    isDark={isDark}
                    subtitle={normalizeValues ? 'Percentage growth from start' : 'Absolute portfolio values'}
                />

                {/* Chart Controls */}
                <div className="flex items-center gap-2">
                    <ToggleButton
                        active={normalizeValues}
                        onClick={() => setNormalizeValues(!normalizeValues)}
                        icon={
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        }
                        label={normalizeValues ? '%' : '$'}
                        title={normalizeValues ? 'Show Absolute Values' : 'Show Percentage Growth'}
                        activeColor="emerald"
                        isDark={isDark}
                    />

                    <ToggleButton
                        active={useLogScale}
                        onClick={() => setUseLogScale(!useLogScale)}
                        icon={
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        }
                        label={useLogScale ? 'Log' : 'Linear'}
                        title={useLogScale ? 'Switch to Linear Scale' : 'Switch to Logarithmic Scale'}
                        activeColor="purple"
                        isDark={isDark}
                    />
                </div>
            </div>

            <div className="h-[400px] w-full">
                <Line data={{ datasets }} options={options} />
            </div>
        </div>
    )
}

/** Chart header with icon and title */
const ChartHeader: React.FC<{ isDark: boolean; subtitle: string }> = ({ isDark, subtitle }) => (
    <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-11 h-11 border rounded-xl ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
            <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
        </div>
        <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Portfolio Value Over Time
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {subtitle}
            </p>
        </div>
    </div>
)

// Memoize to prevent unnecessary re-renders
export const ComparisonChart = memo(ComparisonChartComponent, (prevProps, nextProps) => {
    if (prevProps.data.length !== nextProps.data.length) return false
    if (prevProps.strategies.length !== nextProps.strategies.length) return false
    // Check if strategy colors have changed (happens after backtest completes)
    if (prevProps.strategies.some((s, i) => s.color.stroke !== nextProps.strategies[i]?.color.stroke)) return false
    return true
})
