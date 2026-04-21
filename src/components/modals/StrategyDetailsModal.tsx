import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../../context/ThemeContext'
import { AllocationPieChart, PerformanceSparkline } from '../charts'
import type { PortfolioDeployedStrategy as DeployedStrategy } from '../../types/dashboard'
import { getPerformanceHistory, getLivePerformance, getDebugSignals } from '../../services/api'
import { DeploymentSettingsModal } from './DeploymentSettingsModal'

interface StrategyDetailsModalProps {
    strategy: DeployedStrategy
    isOpen: boolean
    onClose: () => void
    deploymentId?: string // Optional deployment ID for fetching real performance data
}

export const StrategyDetailsModal = ({ strategy, isOpen, onClose, deploymentId }: StrategyDetailsModalProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showDebug, setShowDebug] = useState(false)

    // Fetch historical performance for the chart
    const { data: performanceData, isLoading: performanceLoading } = useQuery({
        queryKey: ['performanceHistory', deploymentId],
        queryFn: () => getPerformanceHistory(deploymentId!, { days: 90 }),
        enabled: isOpen && !!deploymentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Fetch live performance from EODHD - single source of truth for current allocation
    const { data: livePerformance, isLoading: liveLoading } = useQuery({
        queryKey: ['livePerformance', deploymentId],
        queryFn: () => getLivePerformance(deploymentId!),
        enabled: isOpen && !!deploymentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Fetch debug signals to show actual indicator values
    const { data: debugData, isLoading: debugLoading } = useQuery({
        queryKey: ['debugSignals', deploymentId],
        queryFn: () => getDebugSignals(deploymentId!),
        enabled: isOpen && !!deploymentId && showDebug,
        staleTime: 1 * 60 * 1000, // 1 minute
    })

    if (!isOpen) return null

    // Transform API performance data to chart format
    // Use stored performance history if available, otherwise fall back to live calculated daily_values
    const storedHistory = performanceData?.performance_history?.map(snapshot => ({
        date: new Date(snapshot.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Number((snapshot.cumulative_return * 100).toFixed(2))
    })) ?? []

    const liveHistory = livePerformance?.performance?.daily_values?.map((dv: { date: string; return: number }) => ({
        date: new Date(dv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Number((dv.return * 100).toFixed(2))
    })) ?? []

    // Prefer stored history if it has data, otherwise use live calculated history
    const historicalData = storedHistory.length > 0 ? storedHistory : liveHistory

    // Get current allocation from live EODHD performance (single source of truth)
    const currentAllocationData = livePerformance?.performance?.current_weights
        ? Object.entries(livePerformance.performance.current_weights).map(([symbol, weight]) => ({
            symbol,
            name: symbol,
            percentage: weight * 100, // API returns as decimal (0.0 to 1.0)
        }))
        : []

    // Get metadata from live performance
    const calculationDate = livePerformance?.performance?.calculation_date
    const currentAllocationName = livePerformance?.performance?.current_allocation

    const executionRate = strategy.alertsTriggered > 0
        ? (strategy.alertsExecuted / strategy.alertsTriggered) * 100
        : 0

    const getStatusConfig = () => {
        switch (strategy.status) {
            case 'active':
                return { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/20', dot: 'bg-green-500' }
            case 'alert':
                return { label: 'Alert Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20', dot: 'bg-yellow-500' }
            case 'paused':
                return { label: 'Paused', color: 'text-gray-400', bg: 'bg-gray-500/20', dot: 'bg-gray-500' }
        }
    }

    const statusConfig = getStatusConfig()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'
                    }`}
            >
                {/* Header */}
                <div className={`sticky top-0 z-10 px-8 py-6 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200'
                    }`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {strategy.name}
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg}`}>
                                    <span className={`w-2 h-2 rounded-full ${statusConfig.dot} ${strategy.status === 'alert' ? 'animate-pulse' : ''}`}></span>
                                    <span className={statusConfig.color}>{statusConfig.label}</span>
                                </div>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Deployed {strategy.deployedDate} • Running for {strategy.runningDays} days
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-8">
                    {/* Performance Overview */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Performance Overview
                            </h3>
                            {livePerformance?.performance?.days_deployed !== undefined && (
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {livePerformance.performance.days_deployed} days since deployment
                                </span>
                            )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div className={`p-6 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Since Deployment
                                </div>
                                {liveLoading ? (
                                    <div className={`h-9 w-20 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                                ) : (
                                    <div className={`text-3xl font-bold ${(livePerformance?.performance?.ideal_return ?? 0) >= 0
                                        ? isDark ? 'text-green-400' : 'text-green-600'
                                        : isDark ? 'text-red-400' : 'text-red-600'
                                        }`}>
                                        {(livePerformance?.performance?.ideal_return ?? 0) >= 0 ? '+' : ''}
                                        {((livePerformance?.performance?.ideal_return ?? 0) * 100).toFixed(2)}%
                                    </div>
                                )}
                            </div>
                            <div className={`p-6 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Portfolio Value
                                </div>
                                {liveLoading ? (
                                    <div className={`h-9 w-24 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                                ) : (
                                    <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                        ${(livePerformance?.performance?.portfolio_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                )}
                            </div>
                            <div className={`p-6 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Annualized (CAGR)
                                </div>
                                {liveLoading ? (
                                    <div className={`h-9 w-20 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                                ) : (
                                    <div className={`text-3xl font-bold ${(livePerformance?.performance?.ideal_cagr ?? 0) >= 0
                                        ? isDark ? 'text-green-400' : 'text-green-600'
                                        : isDark ? 'text-yellow-400' : 'text-yellow-600'
                                        }`}>
                                        {(livePerformance?.performance?.ideal_cagr ?? 0) >= 0 ? '+' : ''}
                                        {((livePerformance?.performance?.ideal_cagr ?? 0) * 100).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Chart */}
                        <div className={`p-6 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                            <div className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Performance Since Deployment
                            </div>
                            <div className="h-48">
                                {(performanceLoading || liveLoading) ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className={`animate-spin rounded-full h-8 w-8 border-2 ${isDark ? 'border-white/10 border-t-purple-500' : 'border-gray-200 border-t-purple-600'}`}></div>
                                    </div>
                                ) : historicalData.length > 0 ? (
                                    <PerformanceSparkline
                                        data={historicalData}
                                        color="#8b5cf6"
                                        showGrid={true}
                                        showAxis={true}
                                    />
                                ) : (
                                    <div className={`flex items-center justify-center h-full text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        No performance data available yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TARGET PORTFOLIO - Hero Section */}
                    <div className={`-mx-8 px-8 py-8 ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/5 border-y border-white/5'
                        : 'bg-gradient-to-br from-purple-50 via-white to-cyan-50 border-y border-gray-100'
                        }`}>
                        {/* Header with badge */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                    <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Your Target Portfolio
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        What you should hold right now
                                    </p>
                                </div>
                            </div>
                            {liveLoading ? (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-gray-500/20 border border-gray-500/30' : 'bg-gray-100 border border-gray-200'}`}>
                                    <div className={`animate-spin rounded-full h-3 w-3 border border-t-transparent ${isDark ? 'border-gray-400' : 'border-gray-500'}`}></div>
                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Loading...
                                    </span>
                                </div>
                            ) : currentAllocationData.length > 0 ? (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100 border border-green-200'}`}>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                        Live
                                    </span>
                                </div>
                            ) : (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-yellow-100 border border-yellow-200'}`}>
                                    <span className={`text-xs font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                                        No Data
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Donut Chart */}
                        <div className={`w-full p-6 rounded-2xl ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                            {currentAllocationData.length > 0 ? (
                                <>
                                    <AllocationPieChart
                                        data={currentAllocationData}
                                        size="xlarge"
                                        showLegend={true}
                                        centerLabel={{
                                            primary: `${currentAllocationData.length}`,
                                            secondary: currentAllocationData.length === 1 ? 'Position' : 'Positions'
                                        }}
                                        showPercentageLabels={true}
                                    />

                                    {calculationDate && (
                                        <div className={`mt-4 pt-4 border-t text-center ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>As of</div>
                                            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {new Date(calculationDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            {currentAllocationName && (
                                                <div className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                                    Holding: {currentAllocationName}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-sm font-medium">No allocation data yet</p>
                                    <p className="text-xs mt-1 opacity-70">Waiting for first strategy signal</p>
                                </div>
                            )}
                        </div>

                        {/* Info banner at bottom */}
                        <div className={`mt-6 p-4 rounded-xl flex items-center justify-between ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-white/80 border border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                                    <svg className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Stay in sync:</span> You'll receive an alert when this portfolio needs to change.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDebug(!showDebug)}
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${showDebug
                                    ? isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                                    : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {showDebug ? 'Hide Debug' : 'Debug'}
                            </button>
                        </div>

                        {/* Debug Panel - Show actual signal values */}
                        {showDebug && (
                            <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span className={`text-sm font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                                        Signal Debug
                                    </span>
                                </div>

                                {debugLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`animate-spin rounded-full h-4 w-4 border-2 border-t-transparent ${isDark ? 'border-yellow-400' : 'border-yellow-600'}`}></div>
                                        <span className={`text-sm ${isDark ? 'text-yellow-400/70' : 'text-yellow-700'}`}>Loading signal values...</span>
                                    </div>
                                ) : debugData?.debug ? (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-4">
                                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Data source: <span className={`font-mono font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{debugData.debug.data_source}</span>
                                            </div>
                                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Evaluated on: <span className="font-mono">{debugData.debug.evaluation_date}</span>
                                            </div>
                                        </div>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Final allocation: <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{debugData.debug.final_allocation}</span>
                                        </div>

                                        {Object.entries(debugData.debug.evaluations || {}).map(([allocName, evalData]: [string, any]) => (
                                            <div key={allocName} className={`p-3 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{allocName}</span>
                                                    {evalData.is_fallback ? (
                                                        <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>Fallback</span>
                                                    ) : evalData.triggered ? (
                                                        <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>✓ Triggered</span>
                                                    ) : (
                                                        <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>✗ Not triggered</span>
                                                    )}
                                                </div>

                                                {evalData.signal_values && Object.keys(evalData.signal_values).length > 0 && (
                                                    <div className="space-y-1">
                                                        {Object.entries(evalData.signal_values).map(([signal, data]: [string, any]) => (
                                                            <div key={signal} className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>{signal}</span>
                                                                {' = '}
                                                                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.value ?? 'N/A'}</span>
                                                                {data.comparison && data.threshold !== undefined && (
                                                                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                                                        {' '}{data.comparison} {data.threshold}
                                                                        {' → '}
                                                                        {data.value !== null && (
                                                                            data.comparison === '<' ? (data.value < data.threshold ? '✓' : '✗') :
                                                                                data.comparison === '>' ? (data.value > data.threshold ? '✓' : '✗') :
                                                                                    data.comparison === '<=' ? (data.value <= data.threshold ? '✓' : '✗') :
                                                                                        data.comparison === '>=' ? (data.value >= data.threshold ? '✓' : '✗') : '?'
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {evalData.error && (
                                                    <div className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                                        Error: {evalData.error}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-sm ${isDark ? 'text-yellow-400/70' : 'text-yellow-700'}`}>
                                        No debug data available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Alert Activity */}
                    <div>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Alert Activity
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className={`p-6 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Execution Rate
                                </div>
                                <div className={`text-4xl font-bold mb-4 ${executionRate >= 80 ? isDark ? 'text-green-400' : 'text-green-600' : isDark ? 'text-yellow-400' : 'text-yellow-600'
                                    }`}>
                                    {executionRate.toFixed(0)}%
                                </div>
                                <div className={`h-3 rounded-full overflow-hidden mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}>
                                    <div
                                        className={`h-full transition-all duration-300 ${executionRate >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}
                                        style={{ width: `${executionRate}%` }}
                                    />
                                </div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {strategy.alertsExecuted} of {strategy.alertsTriggered} alerts executed
                                </div>
                            </div>
                            <div className={`p-6 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Alerts Triggered</span>
                                        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {strategy.alertsTriggered}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Alerts Executed</span>
                                        <span className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                            {strategy.alertsExecuted}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Alerts Ignored</span>
                                        <span className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                            {strategy.alertsIgnored}
                                        </span>
                                    </div>
                                    <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Next Check</span>
                                            <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                                {strategy.nextCheck}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={`sticky bottom-0 px-8 py-6 border-t backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200'
                    }`}>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                                ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/[0.15]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                        >
                            Close
                        </button>
                        {strategy.status === 'active' && (
                            <button
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                                    ? 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/50'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                            >
                                Pause Strategy
                            </button>
                        )}
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                        >
                            Edit Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {deploymentId && (
                <DeploymentSettingsModal
                    isOpen={showSettingsModal}
                    onClose={() => setShowSettingsModal(false)}
                    deploymentId={deploymentId}
                    strategyName={strategy.name}
                    currentStatus={strategy.status === 'alert' ? 'active' : strategy.status}
                    deployedAt={livePerformance?.performance?.deployed_at}
                    initialCapital={livePerformance?.performance?.portfolio_value}
                    notificationPreferences={undefined}
                />
            )}
        </div>
    )
}

