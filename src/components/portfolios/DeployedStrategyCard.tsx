import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import type { PortfolioDeployedStrategy as DeployedStrategy } from '../../types/dashboard'
import { AllocationPieChart } from '../charts'
import { StrategyDetailsModal } from '../modals'

interface DeployedStrategyCardProps {
    strategy: DeployedStrategy
}

export const DeployedStrategyCard = ({ strategy }: DeployedStrategyCardProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [isModalOpen, setIsModalOpen] = useState(false)

    const getStatusConfig = () => {
        switch (strategy.status) {
            case 'active':
                return {
                    label: 'Active',
                    colorClass: isDark ? 'text-green-400' : 'text-green-600',
                    bgClass: isDark ? 'bg-green-500/10' : 'bg-green-50',
                    dotClass: 'bg-green-500'
                }
            case 'alert':
                return {
                    label: 'Alert Pending',
                    colorClass: isDark ? 'text-yellow-400' : 'text-yellow-600',
                    bgClass: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50',
                    dotClass: 'bg-yellow-500'
                }
            case 'paused':
                return {
                    label: 'Paused',
                    colorClass: isDark ? 'text-gray-400' : 'text-gray-600',
                    bgClass: isDark ? 'bg-gray-500/10' : 'bg-gray-50',
                    dotClass: 'bg-gray-500'
                }
            default:
                return {
                    label: 'Active',
                    colorClass: isDark ? 'text-green-400' : 'text-green-600',
                    bgClass: isDark ? 'bg-green-500/10' : 'bg-green-50',
                    dotClass: 'bg-green-500'
                }
        }
    }

    const statusConfig = getStatusConfig()

    return (
        <>
            <StrategyDetailsModal
                strategy={strategy}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deploymentId={strategy.id}
            />
            <div
                className={`backdrop-blur-2xl rounded-lg p-6 transition-all duration-300 ${isDark
                    ? 'bg-white/[0.02] border border-white/[0.15] hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10'
                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                    }`}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3
                            className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                                }`}
                        >
                            {strategy.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass} ${strategy.status === 'alert' ? 'animate-pulse' : ''}`}></span>
                                <span className={statusConfig.colorClass}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            {strategy.status !== 'paused' && (
                                <>
                                    <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>•</span>
                                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Last Alert: {strategy.lastAlert}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    {strategy.status === 'active' && (
                        <span
                            className={`px-2.5 py-1 rounded text-xs font-medium ${isDark
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                        >
                            PRO
                        </span>
                    )}
                </div>

                {/* Performance */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Performance:
                        </span>
                        <span
                            className={`text-xl font-bold ${strategy.ytdPerformance >= 0
                                ? isDark
                                    ? 'text-green-400'
                                    : 'text-green-600'
                                : isDark
                                    ? 'text-red-400'
                                    : 'text-red-600'
                                }`}
                        >
                            {strategy.ytdPerformance >= 0 ? '+' : ''}
                            {strategy.ytdPerformance.toFixed(1)}% YTD
                        </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Backtest projected: {strategy.backtestProjection >= 0 ? '+' : ''}
                        {strategy.backtestProjection.toFixed(1)}%
                    </p>
                </div>

                {/* Alerts */}
                <div className="mb-4 pb-4 border-b border-white/10">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-medium">Alerts:</span> {strategy.alertsTriggered}{' '}
                        triggered • {strategy.alertsExecuted} executed • {strategy.alertsIgnored}{' '}
                        ignored
                    </div>
                    <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-medium">Next Check:</span> {strategy.nextCheck}
                    </div>
                </div>

                {/* Current Allocation with Chart */}
                <div className="mb-4">
                    <div
                        className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                    >
                        Current Allocation:
                    </div>

                    {/* Pie Chart */}
                    <div className="mb-3">
                        <AllocationPieChart
                            data={strategy.currentAllocation}
                            size="small"
                            showLegend={false}
                        />
                    </div>

                    {/* Allocation Breakdown */}
                    <div className="space-y-2">
                        {strategy.currentAllocation.map((asset) => (
                            <div
                                key={asset.symbol}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-sm ${asset.color}`} />
                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {asset.symbol}
                                    </span>
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {asset.name}
                                    </span>
                                </div>
                                <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {asset.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metadata */}
                <div
                    className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                >
                    Deployed: {strategy.deployedDate} • Running for {strategy.runningDays} days
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${isDark
                            ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            }`}
                    >
                        View Details
                    </button>
                    <button
                        className={`py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${isDark
                            ? 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] border border-white/[0.15]'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        Pause
                    </button>
                </div>
            </div>
        </>
    )
}
