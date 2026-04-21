import React, { memo } from 'react'
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
    DecimationOptions,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { formatCurrency } from '../utils/backtestFormatters'
import { useTheme } from '../../../context/ThemeContext'

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

interface PortfolioDataPoint {
    date: string
    value: number
    allocation?: string
}

interface PortfolioChartProps {
    data: PortfolioDataPoint[]
}

const PortfolioChartComponent: React.FC<PortfolioChartProps> = ({ data }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [useLogScale, setUseLogScale] = React.useState(false)

    // Create a lookup map for allocation by timestamp for fast tooltip lookups
    const allocationLookup = React.useMemo(() => {
        const lookup = new Map<number, string>()
        data.forEach(d => {
            if (d.allocation) {
                lookup.set(new Date(d.date).getTime(), d.allocation)
            }
        })
        return lookup
    }, [data])

    // Helper to find closest allocation for a given timestamp
    const findAllocationForTimestamp = React.useCallback((timestamp: number): string | undefined => {
        // Try exact match first
        if (allocationLookup.has(timestamp)) {
            return allocationLookup.get(timestamp)
        }
        // Find closest earlier timestamp with allocation
        const sortedTimestamps = Array.from(allocationLookup.keys()).sort((a, b) => a - b)
        let closestAllocation: string | undefined
        for (const ts of sortedTimestamps) {
            if (ts <= timestamp) {
                closestAllocation = allocationLookup.get(ts)
            } else {
                break
            }
        }
        return closestAllocation
    }, [allocationLookup])

    if (!data || data.length === 0) {
        return (
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-11 h-11 border rounded-xl ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                            <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Portfolio Value Over Time</h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Historical performance</p>
                        </div>
                    </div>
                </div>
                <div className={`h-[400px] w-full flex items-center justify-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    No portfolio data available
                </div>
            </div>
        )
    }

    // Convert to {x, y} format with timestamps for decimation to work
    const points = data.map(d => ({
        x: new Date(d.date).getTime(),
        y: d.value
    }))

    const chartData = {
        datasets: [
            {
                label: 'Portfolio Value',
                data: points,
                fill: true,
                borderColor: '#a78bfa',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
                    gradient.addColorStop(0, 'rgba(167, 139, 250, 0.3)')
                    gradient.addColorStop(1, 'rgba(167, 139, 250, 0.02)')
                    return gradient
                },
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#8b5cf6',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                tension: 0.4, // Smooth curve
            },
        ],
    }

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            decimation: {
                enabled: true,
                algorithm: 'lttb', // Largest-Triangle-Three-Buckets - preserves visual shape
                samples: 500, // Max points to render
            } as DecimationOptions,
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                titleColor: 'rgba(255, 255, 255, 0.5)',
                titleFont: { weight: '600', size: 11 },
                bodyColor: '#fff',
                bodyFont: { weight: '700', size: 14 },
                displayColors: false,
                callbacks: {
                    title: (items: any) => {
                        if (items.length > 0) {
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
                        const lines = [`Portfolio Value: ${formatCurrency(item.parsed.y)}`]
                        // Look up allocation for this timestamp
                        const allocation = findAllocationForTimestamp(item.parsed.x)
                        if (allocation) {
                            lines.push(`Allocation: ${allocation}`)
                        }
                        return lines
                    }
                }
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                    displayFormats: {
                        month: 'MMM yy'
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
                    font: { size: 11, weight: '500' },
                    maxTicksLimit: 8,
                    autoSkip: true,
                },
            },
            y: {
                type: useLogScale ? 'logarithmic' : 'linear',
                min: useLogScale ? undefined : 0,
                grid: {
                    color: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    lineWidth: 0.5,
                },
                border: {
                    color: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                },
                ticks: {
                    color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                    font: { size: 11, weight: '500' },
                    callback: (value: number) => `$${(value / 1000).toFixed(0)}k`,
                },
            },
        },
    }

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-11 h-11 border rounded-xl ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                        <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Portfolio Value Over Time</h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Historical performance</p>
                    </div>
                </div>
                {/* Log Scale Toggle */}
                <button
                    onClick={() => setUseLogScale(!useLogScale)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${useLogScale
                        ? isDark
                            ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40'
                            : 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                        : isDark
                            ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    title={useLogScale ? 'Switch to Linear Scale' : 'Switch to Logarithmic Scale'}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    {useLogScale ? 'Log' : 'Linear'}
                </button>
            </div>
            <div className="h-[400px] w-full">
                <Line data={chartData} options={options} />
            </div>
        </div>
    )
}

// Memoize to prevent re-renders when data hasn't changed
export const PortfolioChart = memo(PortfolioChartComponent, (prevProps, nextProps) => {
    // Deep compare data arrays by checking length and first/last values
    if (prevProps.data.length !== nextProps.data.length) return false
    if (prevProps.data.length === 0) return true
    const prevFirst = prevProps.data[0]
    const nextFirst = nextProps.data[0]
    const prevLast = prevProps.data[prevProps.data.length - 1]
    const nextLast = nextProps.data[nextProps.data.length - 1]
    return prevFirst?.date === nextFirst?.date &&
        prevFirst?.value === nextFirst?.value &&
        prevLast?.date === nextLast?.date &&
        prevLast?.value === nextLast?.value
})
