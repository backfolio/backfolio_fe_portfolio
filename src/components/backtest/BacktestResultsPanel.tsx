import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Types
interface BacktestMetrics {
    total_return: number
    annual_return: number
    volatility: number
    sharpe_ratio: number
    max_drawdown: number
    calmar_ratio: number
    win_rate?: number
    profit_factor?: number
}

interface BacktestResult {
    request: any
    metrics: BacktestMetrics
    portfolio_values: Array<{
        date: string
        value: number
    }>
    benchmark_values?: Array<{
        date: string
        value: number
    }>
    warnings?: string[]
}

interface BacktestResultsPanelProps {
    result: BacktestResult | null
    error: string
    loading: boolean
    onViewDetails?: () => void
}

const BacktestResultsPanel: React.FC<BacktestResultsPanelProps> = ({
    result,
    error,
    loading,
    onViewDetails
}) => {
    const [useLogScale, setUseLogScale] = useState(false)

    const formatMetric = (value: number, isPercentage = false, decimals = 2): string => {
        if (value === undefined || value === null) return 'N/A'
        const formatted = value.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })
        return isPercentage ? `${formatted}%` : formatted
    }

    if (error) {
        return (
            <div className="group bg-white/80 backdrop-blur-sm border border-red-200/60 rounded-md p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-9 h-9 bg-red-100 rounded-md">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-900">Backtest Failed</h3>
                        <p className="text-sm text-red-600">Something went wrong during analysis</p>
                    </div>
                </div>
                <div className="bg-red-50/80 border border-red-200 rounded-md p-4">
                    <p className="text-red-800 text-sm leading-relaxed">{error}</p>
                </div>
            </div>
        )
    }

    if (result) {
        return (
            <div className="space-y-6">
                {/* Success Banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-md p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-md shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">{result.request.name || 'Strategy'}</h3>
                            <p className="text-sm text-slate-600">Analysis complete • {result.portfolio_values.length} data points</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-md border border-emerald-200">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-emerald-700">Live</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards - Dashboard Style */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Total Return Card */}
                    <div className="bg-white border border-slate-200 rounded-md p-5 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-md group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className={`w-2 h-2 rounded-full ${result.metrics.total_return >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </div>
                        <div className="text-sm text-slate-600 font-medium mb-1">Total Return</div>
                        <div className={`text-2xl font-bold ${result.metrics.total_return >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatMetric(result.metrics.total_return, true)}
                        </div>
                    </div>

                    {/* Annual Return Card */}
                    <div className="bg-white border border-slate-200 rounded-md p-5 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${result.metrics.annual_return >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                CAGR
                            </span>
                        </div>
                        <div className="text-sm text-slate-600 font-medium mb-1">Annual Return</div>
                        <div className={`text-2xl font-bold ${result.metrics.annual_return >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatMetric(result.metrics.annual_return, true)}
                        </div>
                    </div>

                    {/* Sharpe Ratio Card */}
                    <div className="bg-white border border-slate-200 rounded-md p-5 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-md group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-purple-100 text-purple-700">
                                Risk Adj.
                            </span>
                        </div>
                        <div className="text-sm text-slate-600 font-medium mb-1">Sharpe Ratio</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {formatMetric(result.metrics.sharpe_ratio)}
                        </div>
                    </div>

                    {/* Volatility Card */}
                    <div className="bg-white border border-slate-200 rounded-md p-5 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-md group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                                Ann.
                            </span>
                        </div>
                        <div className="text-sm text-slate-600 font-medium mb-1">Volatility</div>
                        <div className="text-2xl font-bold text-amber-600">
                            {formatMetric(result.metrics.volatility, true)}
                        </div>
                    </div>

                    {/* Max Drawdown Card */}
                    <div className="bg-white border border-slate-200 rounded-md p-5 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-100 to-rose-100 rounded-md group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-red-100 text-red-700">
                                Risk
                            </span>
                        </div>
                        <div className="text-sm text-slate-600 font-medium mb-1">Max Drawdown</div>
                        <div className="text-2xl font-bold text-red-600">
                            {formatMetric(result.metrics.max_drawdown, true)}
                        </div>
                    </div>

                    {/* Calmar Ratio Card */}
                    <div className="bg-white border border-slate-200 rounded-md p-5 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-100 to-sky-100 rounded-md group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-cyan-100 text-cyan-700">
                                Ratio
                            </span>
                        </div>
                        <div className="text-sm text-slate-600 font-medium mb-1">Calmar Ratio</div>
                        <div className="text-2xl font-bold text-cyan-600">
                            {formatMetric(result.metrics.calmar_ratio)}
                        </div>
                    </div>
                </div>

                {/* Full Width Performance Chart */}
                <div className="bg-white border border-slate-200 rounded-md p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-md">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Portfolio Performance</h3>
                                <p className="text-xs text-slate-500">Historical value progression</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Log Scale Toggle */}
                            <button
                                onClick={() => setUseLogScale(!useLogScale)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${useLogScale
                                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                title={useLogScale ? 'Switch to Linear Scale' : 'Switch to Logarithmic Scale'}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                {useLogScale ? 'Log' : 'Linear'}
                            </button>
                            <div className="w-px h-5 bg-slate-200"></div>
                            <div className="flex items-center gap-1">
                                <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                                    1Y
                                </button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md">
                                    All
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={result.portfolio_values.map((pv, idx) => ({
                                    date: pv.date,
                                    portfolio: pv.value,
                                    benchmark: result.benchmark_values?.[idx]?.value
                                }))}
                                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                            >
                                <defs>
                                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px', fontWeight: 500 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                                    }}
                                    interval="preserveStartEnd"
                                    minTickGap={60}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px', fontWeight: 500 }}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                    width={50}
                                    scale={useLogScale ? 'log' : 'auto'}
                                    domain={useLogScale ? ['auto', 'auto'] : [0, 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)'
                                    }}
                                    labelStyle={{
                                        color: '#0f172a',
                                        fontWeight: 700,
                                        marginBottom: '8px',
                                        fontSize: '13px'
                                    }}
                                    formatter={(value: number, name: string) => [
                                        `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                        name === 'portfolio' ? 'Portfolio' : 'Benchmark'
                                    ]}
                                    labelFormatter={(label) => {
                                        const date = new Date(label)
                                        return date.toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: '24px' }}
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span className="text-sm font-medium text-slate-700">
                                            {value === 'portfolio' ? 'Portfolio Value' : 'Benchmark'}
                                        </span>
                                    )}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="portfolio"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 7, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                    name="portfolio"
                                    fill="url(#portfolioGradient)"
                                />
                                {result.benchmark_values && result.benchmark_values.length > 0 && (
                                    <Line
                                        type="monotone"
                                        dataKey="benchmark"
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#94a3b8', strokeWidth: 2, stroke: '#fff' }}
                                        name="benchmark"
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-md p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-9 h-9 bg-amber-100 rounded-md">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L12.732 4.5c-.77-.833-2.186-.833-2.956 0L2.858 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-amber-900">Important Notes</h3>
                                <p className="text-sm text-amber-600">Please review these warnings</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {result.warnings.map((warning, index) => (
                                <div key={index} className="bg-amber-50/80 border border-amber-200 rounded-md p-3">
                                    <p className="text-amber-800 text-sm">{warning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View Full Details */}
                {onViewDetails && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md p-6 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Complete Analysis</h3>
                                    <p className="text-slate-600 text-sm">View detailed metrics, charts & analytics</p>
                                </div>
                            </div>
                            <button
                                onClick={onViewDetails}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                View Full Report
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (!loading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-md p-12 text-center hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-md mx-auto mb-6">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Ready to Analyze</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                    Configure your strategy parameters and portfolio allocation,
                    then run your backtest to see detailed performance metrics.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Real-time analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Risk metrics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Performance tracking</span>
                    </div>
                </div>
            </div>
        )
    }

    return null
}

export default BacktestResultsPanel