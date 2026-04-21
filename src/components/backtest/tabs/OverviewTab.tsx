import React, { memo } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { MetricCard } from '../components/MetricCard'
import { PortfolioChart } from '../components/PortfolioChart'
import { AllocationDistribution } from '../components/AllocationDistribution'
import { formatMetric, formatCurrency } from '../utils/backtestFormatters'
import { BacktestResult } from '../types/backtestResults'
import type { StrategyDSL } from '../../../types/strategy'

interface OverviewTabProps {
    result: BacktestResult
    portfolioData: any[]
    strategy?: StrategyDSL
    strategyName?: string
}

const OverviewTabComponent: React.FC<OverviewTabProps> = ({ result, portfolioData, strategy }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { result: apiResult } = result
    const { metrics, allocation_efficiency, transaction_analysis, cashflow_analysis } = apiResult

    // Get the last (current/final) allocation from allocation_log
    const currentAllocation = React.useMemo(() => {
        if (!apiResult.allocation_log) return null
        const dates = Object.keys(apiResult.allocation_log).sort()
        return dates.length > 0 ? apiResult.allocation_log[dates[dates.length - 1]] : null
    }, [apiResult.allocation_log])

    // Get initial capital - try from portfolio log first, then default to 10000
    const initialCapital = portfolioData.length > 0 && portfolioData[0].value
        ? portfolioData[0].value
        : 10000
    const finalValue = portfolioData.length > 0
        ? portfolioData[portfolioData.length - 1].value
        : initialCapital * (1 + metrics.cumulative_return)

    return (
        <div className="relative space-y-6">
            {/* Key Metrics Row - Prominent Display (4 Hero Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Return"
                    value={formatMetric(metrics.cumulative_return * 100, true)}
                    subtext={`${formatMetric(metrics.cagr * 100, true)} CAGR`}
                    valueColor={metrics.cumulative_return >= 0 ? 'emerald' : 'red'}
                />
                <MetricCard
                    label="Final Value"
                    value={formatCurrency(finalValue)}
                    subtext={`From ${formatCurrency(initialCapital)}`}
                    valueColor="blue"
                />
                <MetricCard
                    label="Max Drawdown"
                    value={formatMetric(metrics.max_drawdown * 100, true)}
                    subtext={apiResult.drawdown_analysis?.summary?.avg_recovery_days ? `Avg ${Math.round(apiResult.drawdown_analysis.summary.avg_recovery_days)}d recovery` : undefined}
                    valueColor="red"
                />
                <MetricCard
                    label="Sharpe Ratio"
                    value={formatMetric(metrics.sharpe_ratio)}
                    subtext={
                        metrics.sharpe_ratio > 1 ? "Good risk-adjusted return" :
                            metrics.sharpe_ratio > 0.5 ? "Fair risk-adjusted return" :
                                "Below average"
                    }
                    valueColor={metrics.sharpe_ratio > 1 ? 'emerald' : metrics.sharpe_ratio > 0.5 ? 'blue' : 'gray'}
                />
            </div>

            {/* Hero Chart Section - Portfolio Performance */}
            <PortfolioChart data={portfolioData} />

            {/* Strategy Flow Visualization - using allocation_efficiency.allocation_percentages */}
            {allocation_efficiency && allocation_efficiency.allocation_percentages && Object.keys(allocation_efficiency.allocation_percentages).length > 0 && (
                <AllocationDistribution
                    allocationPercentages={allocation_efficiency.allocation_percentages}
                    allocationPerformance={allocation_efficiency.allocation_performance}
                    currentAllocation={currentAllocation}
                    strategy={strategy}
                />
            )}

            {/* Additional Metrics Grid */}
            <div>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                        label="Volatility"
                        value={formatMetric(metrics.volatility * 100, true)}
                        subtext="Annualized"
                        valueColor="amber"
                    />
                    <MetricCard
                        label="Sortino Ratio"
                        value={formatMetric(metrics.sortino_ratio)}
                        subtext="Downside risk"
                        valueColor={metrics.sortino_ratio > 1.5 ? 'emerald' : metrics.sortino_ratio > 0.5 ? 'blue' : 'gray'}
                    />
                    <MetricCard
                        label="Calmar Ratio"
                        value={formatMetric(metrics.calmar_ratio)}
                        subtext="Return / Max DD"
                        valueColor={metrics.calmar_ratio > 1 ? 'emerald' : metrics.calmar_ratio > 0.3 ? 'blue' : 'gray'}
                    />
                    <MetricCard
                        label="Win Rate"
                        value={formatMetric(metrics.win_rate * 100, true)}
                        subtext="Positive periods"
                        valueColor={metrics.win_rate > 0.55 ? 'emerald' : metrics.win_rate > 0.45 ? 'blue' : 'amber'}
                    />
                </div>
            </div>

            {/* Transaction Analysis - using actual backend field names */}
            {transaction_analysis && Object.keys(transaction_analysis).length > 0 && (
                <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                    }`}>
                    <h4 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Transaction Analysis
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Trades</div>
                            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {transaction_analysis.total_trades ?? 0}
                            </div>
                        </div>
                        <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Turnover</div>
                            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(transaction_analysis.total_turnover)}
                            </div>
                        </div>
                        <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Costs</div>
                            <div className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                {formatCurrency(transaction_analysis.total_transaction_costs)}
                            </div>
                            {transaction_analysis.cost_as_pct_of_portfolio !== undefined && (
                                <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {formatMetric(transaction_analysis.cost_as_pct_of_portfolio, true, 3)} of portfolio
                                </div>
                            )}
                        </div>
                        <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cost per Trade</div>
                            <div className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                {formatCurrency(transaction_analysis.avg_cost_per_trade)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cashflow Analysis - only shown when cashflows are enabled */}
            {cashflow_analysis && cashflow_analysis.enabled && (
                <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                    }`}>
                    <h4 className={`text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Cashflow Analysis
                        {cashflow_analysis.cashflow_frequency && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${isDark ? 'bg-white/[0.1] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                {cashflow_analysis.cashflow_frequency}
                            </span>
                        )}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Contributions</div>
                            <div className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {formatCurrency(cashflow_analysis.total_contributions)}
                            </div>
                            {cashflow_analysis.num_contributions !== undefined && (
                                <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {cashflow_analysis.num_contributions} deposits
                                </div>
                            )}
                        </div>
                        <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Withdrawals</div>
                            <div className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                {formatCurrency(cashflow_analysis.total_withdrawals)}
                            </div>
                            {cashflow_analysis.num_withdrawals !== undefined && (
                                <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {cashflow_analysis.num_withdrawals} withdrawals
                                </div>
                            )}
                        </div>
                        <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Net Cashflow</div>
                            <div className={`text-xl font-bold ${cashflow_analysis.net_cashflow >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                                {cashflow_analysis.net_cashflow >= 0 ? '+' : ''}{formatCurrency(cashflow_analysis.net_cashflow)}
                            </div>
                            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {formatMetric(cashflow_analysis.cashflow_as_pct_of_final_value, true, 1)} of final value
                            </div>
                        </div>
                        <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Money-Weighted Return</div>
                            <div className={`text-xl font-bold ${cashflow_analysis.money_weighted_return === null
                                ? (isDark ? 'text-gray-400' : 'text-gray-600')
                                : cashflow_analysis.money_weighted_return >= 0
                                    ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                    : (isDark ? 'text-red-400' : 'text-red-600')
                                }`}>
                                {cashflow_analysis.money_weighted_return !== null
                                    ? formatMetric(cashflow_analysis.money_weighted_return * 100, true)
                                    : 'N/A'}
                            </div>
                            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Accounts for cashflow timing
                            </div>
                        </div>
                    </div>
                    {/* Additional row for averages */}
                    {(cashflow_analysis.avg_contribution > 0 || cashflow_analysis.avg_withdrawal > 0) && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {cashflow_analysis.avg_contribution > 0 && (
                                <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Contribution</div>
                                    <div className={`text-lg font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {formatCurrency(cashflow_analysis.avg_contribution)}
                                    </div>
                                </div>
                            )}
                            {cashflow_analysis.avg_withdrawal > 0 && (
                                <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Withdrawal</div>
                                    <div className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                        {formatCurrency(cashflow_analysis.avg_withdrawal)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}

// Memoize with explicit comparison to prevent re-renders when switching tabs
export const OverviewTab = memo(OverviewTabComponent, (prevProps, nextProps) => {
    // Compare result by reference (should be stable from parent useState)
    if (prevProps.result !== nextProps.result) return false
    // Compare portfolioData by reference (memoized in useBacktestChartData)
    if (prevProps.portfolioData !== nextProps.portfolioData) return false
    // Compare strategy by reference
    if (prevProps.strategy !== nextProps.strategy) return false
    // Compare strategyName
    if (prevProps.strategyName !== nextProps.strategyName) return false
    return true
})
