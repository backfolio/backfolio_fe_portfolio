import React, { memo } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { formatMetric } from '../utils/backtestFormatters'
import { MetricTooltip } from '../components/MetricTooltip'
import { BacktestResult } from '../types/backtestResults'
import { SortableTable, Column } from '../components/SortableTable'

interface AnalyticsTabProps {
    result: BacktestResult
}

const AnalyticsTabComponent: React.FC<AnalyticsTabProps> = ({ result }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { result: apiResult } = result
    const { metrics, risk_metrics } = apiResult

    // Cast risk_metrics to any to handle dynamic field names from backend
    const riskMetrics = risk_metrics as Record<string, number> | undefined

    return (
        <div className="relative space-y-6">
            {/* Risk Metrics - using actual backend field names:
                var_95, cvar_95, var_99, cvar_99, skewness, kurtosis, 
                tail_ratio, max_consecutive_losses, volatility_clustering */}
            {riskMetrics && Object.keys(riskMetrics).length > 0 && (
                <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                    }`}>
                    <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Advanced Risk Metrics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {riskMetrics.var_95 !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        VaR (95%)
                                    </div>
                                    <MetricTooltip
                                        content="Value at Risk at 95% confidence. Maximum expected loss in 95% of cases. Only 5% of the time losses exceed this amount."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatMetric(riskMetrics.var_95 * 100, true)}
                                </div>
                            </div>
                        )}
                        {riskMetrics.cvar_95 !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        CVaR (95%)
                                    </div>
                                    <MetricTooltip
                                        content="Conditional Value at Risk (Expected Shortfall). Average loss in the worst 5% of cases. More conservative than VaR."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatMetric(riskMetrics.cvar_95 * 100, true)}
                                </div>
                            </div>
                        )}
                        {riskMetrics.var_99 !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        VaR (99%)
                                    </div>
                                    <MetricTooltip
                                        content="Value at Risk at 99% confidence. Maximum expected loss in 99% of cases. Measures extreme downside risk."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatMetric(riskMetrics.var_99 * 100, true)}
                                </div>
                            </div>
                        )}
                        {riskMetrics.cvar_99 !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        CVaR (99%)
                                    </div>
                                    <MetricTooltip
                                        content="Conditional Value at Risk at 99%. Average loss in the worst 1% of cases. Captures tail risk beyond VaR."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatMetric(riskMetrics.cvar_99 * 100, true)}
                                </div>
                            </div>
                        )}
                        {riskMetrics.skewness !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Skewness
                                    </div>
                                    <MetricTooltip
                                        content="Measures asymmetry in return distribution. Negative skew means more frequent large losses. Positive skew means more frequent large gains."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${riskMetrics.skewness >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                                    {formatMetric(riskMetrics.skewness)}
                                </div>
                            </div>
                        )}
                        {riskMetrics.kurtosis !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Kurtosis
                                    </div>
                                    <MetricTooltip
                                        content="Measures tail heaviness. Higher values mean more extreme outliers. Values > 3 indicate fat tails (higher crash risk)."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatMetric(riskMetrics.kurtosis)}
                                </div>
                            </div>
                        )}
                        {riskMetrics.tail_ratio !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Tail Ratio
                                    </div>
                                    <MetricTooltip
                                        content="Ratio of gains to losses in extreme events (95th percentile). Values > 1 mean big wins outweigh big losses."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatMetric(riskMetrics.tail_ratio)}
                                </div>
                            </div>
                        )}
                        {riskMetrics.max_consecutive_losses !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Max Consecutive Losses
                                    </div>
                                    <MetricTooltip
                                        content="Longest streak of consecutive losing periods. Indicates how long drawdowns can persist."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                    {riskMetrics.max_consecutive_losses}
                                </div>
                            </div>
                        )}
                        {riskMetrics.volatility_clustering !== undefined && (
                            <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Volatility Clustering
                                    </div>
                                    <MetricTooltip
                                        content="Measures if high volatility periods tend to cluster together. Higher values indicate volatility comes in waves."
                                        isDark={isDark}
                                    >
                                        <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </MetricTooltip>
                                </div>
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatMetric(riskMetrics.volatility_clustering * 100, true)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Benchmark Comparison - using actual backend field names */}
            {apiResult.benchmark_comparison && Object.keys(apiResult.benchmark_comparison).length > 0 && (
                <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                    }`}>
                    <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Benchmark Comparison
                    </h3>
                    {Object.entries(apiResult.benchmark_comparison).map(([symbol, stats]: [string, any]) => (
                        <div key={symbol} className={`mb-6 last:mb-0 ${isDark ? 'border-white/[0.1]' : 'border-gray-200'} pb-6 last:pb-0 ${Object.keys(apiResult.benchmark_comparison!).length > 1 ? 'border-b last:border-b-0' : ''}`}>
                            <h5 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                vs {symbol}
                            </h5>

                            {/* Comparative Metrics */}
                            <div className="mb-4">
                                <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    Comparative Metrics
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {stats.beta !== undefined && (
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Beta</div>
                                                <MetricTooltip
                                                    content="Measures systematic risk. Beta < 1 means less volatile than benchmark. Your portfolio moves proportionally to the benchmark based on this ratio."
                                                    isDark={isDark}
                                                >
                                                    <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </MetricTooltip>
                                            </div>
                                            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {formatMetric(stats.beta)}
                                            </div>
                                        </div>
                                    )}
                                    {stats.alpha !== undefined && (
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Alpha</div>
                                                <MetricTooltip
                                                    content="Annualized excess return after adjusting for risk (beta). Positive alpha means you're beating the benchmark on a risk-adjusted basis."
                                                    isDark={isDark}
                                                >
                                                    <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </MetricTooltip>
                                            </div>
                                            <div className={`text-lg font-bold ${stats.alpha >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                                                {formatMetric(stats.alpha * 100, true)}
                                            </div>
                                        </div>
                                    )}
                                    {stats.information_ratio !== undefined && (
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Info Ratio</div>
                                                <MetricTooltip
                                                    content="Excess return per unit of tracking error. Values > 1.0 are excellent, showing consistent outperformance."
                                                    isDark={isDark}
                                                >
                                                    <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </MetricTooltip>
                                            </div>
                                            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {formatMetric(stats.information_ratio)}
                                            </div>
                                        </div>
                                    )}
                                    {stats.tracking_error !== undefined && (
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tracking Error</div>
                                                <MetricTooltip
                                                    content="How much your returns deviate from the benchmark. High tracking error means you're taking a very different path."
                                                    isDark={isDark}
                                                >
                                                    <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </MetricTooltip>
                                            </div>
                                            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {formatMetric(stats.tracking_error * 100, true)}
                                            </div>
                                        </div>
                                    )}
                                    {stats.relative_return !== undefined && (
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Relative Return</div>
                                                <MetricTooltip
                                                    content="Total return difference vs benchmark over the full period. Positive means you outperformed."
                                                    isDark={isDark}
                                                >
                                                    <svg className={`w-3 h-3 cursor-help ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </MetricTooltip>
                                            </div>
                                            <div className={`text-lg font-bold ${stats.relative_return >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                                                {formatMetric(stats.relative_return * 100, true)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Benchmark Performance */}
                            {stats.benchmark_cagr !== undefined && (
                                <div>
                                    <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                        {symbol} Performance
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>CAGR</div>
                                            <div className={`text-lg font-bold ${stats.benchmark_cagr >= 0 ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                                                {formatMetric(stats.benchmark_cagr * 100, true)}
                                            </div>
                                        </div>
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sharpe Ratio</div>
                                            <div className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                {formatMetric(stats.benchmark_sharpe)}
                                            </div>
                                        </div>
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Volatility</div>
                                            <div className={`text-lg font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                                {formatMetric(stats.benchmark_volatility * 100, true)}
                                            </div>
                                        </div>
                                        <div className={`border rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Max Drawdown</div>
                                            <div className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                                {formatMetric(stats.benchmark_max_drawdown * 100, true)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Win/Loss Analysis */}
            <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                }`}>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Performance Ratios
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="text-sm text-emerald-700 mb-1">Win Rate</div>
                        <div className="text-2xl font-bold text-emerald-600">{formatMetric(metrics.win_rate * 100, true)}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-blue-700 mb-1">Sharpe Ratio</div>
                        <div className="text-2xl font-bold text-blue-600">{formatMetric(metrics.sharpe_ratio)}</div>
                    </div>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                        <div className="text-sm text-cyan-700 mb-1">Sortino Ratio</div>
                        <div className="text-2xl font-bold text-cyan-600">{formatMetric(metrics.sortino_ratio)}</div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="text-sm text-indigo-700 mb-1">Calmar Ratio</div>
                        <div className="text-2xl font-bold text-indigo-600">{formatMetric(metrics.calmar_ratio)}</div>
                    </div>
                </div>
            </div>

            {/* Drawdown Periods Analysis - using actual backend field names:
                periods[]: start_date, end_date, max_drawdown, duration_days, recovery_date, recovery_days */}
            {apiResult.drawdown_analysis?.periods && apiResult.drawdown_analysis.periods.length > 0 && (
                <div className={`border rounded-xl p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
                    }`}>
                    <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Drawdown Periods
                        <span className={`text-[10px] font-normal normal-case ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            Click headers to sort
                        </span>
                    </h3>
                    <SortableTable
                        data={apiResult.drawdown_analysis.periods as Array<{
                            start_date: string
                            end_date: string
                            max_drawdown: number
                            duration_days: number
                            recovery_date: string | null
                            recovery_days: number | null
                        }>}
                        keyExtractor={(_, idx) => idx}
                        columns={[
                            {
                                key: 'start_date',
                                label: 'Start Date',
                                sortValue: (row) => new Date(row.start_date).getTime(),
                                render: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            },
                            {
                                key: 'end_date',
                                label: 'End Date',
                                sortValue: (row) => new Date(row.end_date).getTime(),
                                render: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            },
                            {
                                key: 'max_drawdown',
                                label: 'Max Drawdown',
                                align: 'right',
                                render: (value) => (
                                    <span className={`font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                        {formatMetric(value * 100, true)}
                                    </span>
                                )
                            },
                            {
                                key: 'duration_days',
                                label: 'Duration',
                                align: 'right',
                                render: (value) => `${value} days`
                            },
                            {
                                key: 'recovery_days',
                                label: 'Recovery',
                                align: 'right',
                                sortValue: (row) => row.recovery_days ?? 999999,
                                render: (value, row) => row.recovery_date ? (
                                    <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                                        {value} days
                                    </span>
                                ) : (
                                    <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>
                                        Not recovered
                                    </span>
                                )
                            }
                        ] as Column<{
                            start_date: string
                            end_date: string
                            max_drawdown: number
                            duration_days: number
                            recovery_date: string | null
                            recovery_days: number | null
                        }>[]}
                        maxHeight="300px"
                    />
                </div>
            )}
        </div>
    )
}

// Memoize with explicit comparison to prevent re-renders when switching tabs
export const AnalyticsTab = memo(AnalyticsTabComponent, (prevProps, nextProps) => {
    return prevProps.result === nextProps.result
})
