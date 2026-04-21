import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useCreateDeployment } from '../../hooks/useApi'

interface BacktestMetrics {
    cagr?: number | null
    total_return?: number | null
    sharpe_ratio?: number | null
    max_drawdown?: number | null
}

interface DeploymentModalProps {
    isOpen: boolean
    onClose: () => void
    strategyId: string
    strategyName: string
    backtestMetrics?: BacktestMetrics
}

export const DeploymentModal = ({ isOpen, onClose, strategyId, strategyName, backtestMetrics }: DeploymentModalProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()
    const [initialCapital, setInitialCapital] = useState(10000)
    const [paperTrading, setPaperTrading] = useState(true)

    const createDeploymentMutation = useCreateDeployment()

    if (!isOpen) return null

    const handleDeploy = async () => {
        try {
            await createDeploymentMutation.mutateAsync({
                strategy_id: strategyId,
                initial_capital: initialCapital,
                broker_config: {
                    paper_trading: paperTrading
                },
                // Pass backtest metrics for live vs backtest comparison
                backtest_metrics: backtestMetrics ? {
                    cagr: backtestMetrics.cagr ?? undefined,
                    total_return: backtestMetrics.total_return ?? undefined,
                    sharpe_ratio: backtestMetrics.sharpe_ratio ?? undefined,
                    max_drawdown: backtestMetrics.max_drawdown ?? undefined
                } : undefined
            })
            onClose()
            // Navigate to deployed tab to see the newly deployed strategy
            navigate('/portfolios?tab=deployed')
        } catch (error) {
            console.error('Deploy failed:', error)
            // Error handling could be added here
        }
    }

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !createDeploymentMutation.isPending) {
            onClose()
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div
                className={`relative w-full max-w-lg rounded-xl shadow-2xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'
                    }`}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Deploy Strategy
                        </h3>
                        <button
                            onClick={onClose}
                            disabled={createDeploymentMutation.isPending}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'hover:bg-white/10 text-gray-400 disabled:opacity-50'
                                : 'hover:bg-gray-100 text-gray-600 disabled:opacity-50'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Deploy "{strategyName}" for live monitoring
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Initial Capital */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Initial Capital
                        </label>
                        <div className="relative">
                            <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                $
                            </span>
                            <input
                                type="number"
                                value={initialCapital}
                                onChange={(e) => setInitialCapital(Number(e.target.value))}
                                min="1000"
                                max="1000000"
                                step="1000"
                                className={`w-full pl-8 pr-4 py-3 rounded-lg text-sm transition-all duration-200 ${isDark
                                    ? 'bg-white/[0.05] border border-white/[0.15] text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20'
                                    }`}
                            />
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Minimum: $1,000 • Maximum: $1,000,000
                        </p>
                    </div>

                    {/* Trading Mode */}
                    <div>
                        <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Trading Mode
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="tradingMode"
                                    checked={paperTrading}
                                    onChange={() => setPaperTrading(true)}
                                    className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <div>
                                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Paper Trading (Recommended)
                                    </div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Simulate trades without real money. Perfect for testing strategies safely.
                                    </div>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer opacity-50">
                                <input
                                    type="radio"
                                    name="tradingMode"
                                    checked={!paperTrading}
                                    onChange={() => setPaperTrading(false)}
                                    disabled={true}
                                    className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <div>
                                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Live Trading
                                    </div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Real money trading. Coming soon - requires broker integration.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                        <div className="flex items-start gap-3">
                            <svg className={`w-5 h-5 mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                                    What happens when you deploy?
                                </h4>
                                <ul className={`text-xs space-y-1 ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                                    <li>• Strategy starts monitoring market conditions 24/7</li>
                                    <li>• You'll receive alerts when rebalancing is recommended</li>
                                    <li>• Performance is tracked and compared to backtest projections</li>
                                    <li>• You can pause or stop deployment at any time</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={createDeploymentMutation.isPending}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                            ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/[0.15] disabled:opacity-50'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 disabled:opacity-50'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeploy}
                        disabled={createDeploymentMutation.isPending}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                            ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50 disabled:opacity-50'
                            : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                            }`}
                    >
                        {createDeploymentMutation.isPending ? 'Deploying...' : 'Deploy Strategy'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}