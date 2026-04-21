import React, { memo, useMemo } from 'react'
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    TimeScale,
    DecimationOptions,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { useTheme } from '../../../context/ThemeContext'

// Register Chart.js components
ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip
)

interface DrawdownChartProps {
    data: any[]
}

const DrawdownChartComponent: React.FC<DrawdownChartProps> = ({ data }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Calculate max drawdown and its date for display
    const { maxDrawdown, maxDrawdownDate } = useMemo(() => {
        if (!data || data.length === 0) return { maxDrawdown: 0, maxDrawdownDate: '' }
        
        let worst = data[0]
        for (const d of data) {
            if (d.drawdown < worst.drawdown) {
                worst = d
            }
        }
        
        return { 
            maxDrawdown: worst.drawdown, 
            maxDrawdownDate: new Date(worst.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
    }, [data])

    if (!data || data.length === 0) {
        return (
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`flex items-center justify-center w-11 h-11 border rounded-xl ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                        <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Drawdown Analysis</h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Underwater equity curve</p>
                    </div>
                </div>
                <div className={`h-[350px] w-full flex items-center justify-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    No drawdown data available
                </div>
            </div>
        )
    }

    // Convert to {x, y} format with timestamps for decimation to work
    const points = data.map(d => ({
        x: new Date(d.date).getTime(),
        y: d.drawdown
    }))

    const chartData = {
        datasets: [
            {
                label: 'Drawdown',
                data: points,
                fill: true,
                borderColor: '#f87171',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx
                    const gradient = ctx.createLinearGradient(0, 0, 0, 350)
                    gradient.addColorStop(0, 'rgba(248, 113, 113, 0.1)')
                    gradient.addColorStop(1, 'rgba(248, 113, 113, 0.3)')
                    return gradient
                },
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#ef4444',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                tension: 0.4,
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
                algorithm: 'lttb',
                samples: 500,
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
                        return `Drawdown: ${item.parsed.y.toFixed(2)}%`
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
                    callback: (value: number) => `${value.toFixed(0)}%`,
                },
            },
        },
    }

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-11 h-11 border rounded-xl ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                        <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Drawdown Analysis</h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Underwater equity curve</p>
                    </div>
                </div>
                {/* Max Drawdown Badge */}
                <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex flex-col items-end">
                        <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Max Drawdown</span>
                        <span className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{maxDrawdown.toFixed(2)}%</span>
                    </div>
                    <div className={`w-px h-8 ${isDark ? 'bg-red-500/30' : 'bg-red-200'}`}></div>
                    <div className="flex flex-col items-start">
                        <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Date</span>
                        <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{maxDrawdownDate}</span>
                    </div>
                </div>
            </div>
            <div className="h-[350px] w-full">
                <Line data={chartData} options={options} />
            </div>
        </div>
    )
}

// Memoize to prevent re-renders when data hasn't changed
export const DrawdownChart = memo(DrawdownChartComponent, (prevProps, nextProps) => {
    if (prevProps.data.length !== nextProps.data.length) return false
    if (prevProps.data.length === 0) return true
    const prevFirst = prevProps.data[0]
    const nextFirst = nextProps.data[0]
    const prevLast = prevProps.data[prevProps.data.length - 1]
    const nextLast = nextProps.data[nextProps.data.length - 1]
    return prevFirst?.date === nextFirst?.date &&
        prevFirst?.drawdown === nextFirst?.drawdown &&
        prevLast?.date === nextLast?.date &&
        prevLast?.drawdown === nextLast?.drawdown
})
