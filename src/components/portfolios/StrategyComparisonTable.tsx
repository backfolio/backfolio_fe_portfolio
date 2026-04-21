import { useTheme } from '../../context/ThemeContext'
import type { ComparisonStrategy } from '../../types/dashboard'

interface StrategyComparisonTableProps {
    strategies: ComparisonStrategy[]
}

export const StrategyComparisonTable = ({ strategies }: StrategyComparisonTableProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    if (strategies.length === 0) {
        return (
            <div className="text-center py-12">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/[0.05]' : 'bg-slate-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-white/40' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                </div>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select strategies to compare
                </p>
            </div>
        )
    }

    const getBestInMetric = (metricKey: keyof ComparisonStrategy['metrics']) => {
        let bestValue = -Infinity
        let bestIndex = -1

        strategies.forEach((strategy, index) => {
            const value = strategy.metrics[metricKey]
            if (value === null) return

            // For drawdown and volatility, lower is better
            const isLowerBetter = metricKey === 'maxDrawdown' || metricKey === 'volatility' || metricKey === 'worstMonth'
            const compareValue = isLowerBetter ? -value : value

            if (compareValue > bestValue) {
                bestValue = compareValue
                bestIndex = index
            }
        })

        return bestIndex
    }

    const formatMetric = (value: number | null, suffix: string = '%') => {
        if (value === null) return 'N/A'
        return `${value >= 0 && suffix === '%' ? '+' : ''}${value.toFixed(value % 1 === 0 ? 0 : 1)}${suffix}`
    }

    const renderMetricCell = (
        value: number | null,
        isBest: boolean,
        suffix: string = '%'
    ) => {
        return (
            <td
                className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
                    }`}
            >
                <div className="flex items-center gap-1">
                    {formatMetric(value, suffix)}
                    {isBest && value !== null && <span className="text-yellow-500">⭐</span>}
                </div>
            </td>
        )
    }

    return (
        <div className="space-y-4">
            {/* Selected Strategies */}
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Selected:{' '}
                {strategies.map((s, i) => (
                    <span key={s.id}>
                        ✓ {s.name}
                        {i < strategies.length - 1 ? ' • ' : ''}
                    </span>
                ))}
            </div>

            {/* Comparison Table */}
            <div
                className={`backdrop-blur-2xl rounded-lg overflow-hidden ${isDark
                    ? 'bg-white/[0.02] border border-white/[0.15]'
                    : 'bg-white border border-gray-200'
                    }`}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr
                                className={
                                    isDark
                                        ? 'bg-white/[0.05] border-b border-white/[0.15]'
                                        : 'bg-gray-50 border-b border-gray-200'
                                }
                            >
                                <th
                                    className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                                        }`}
                                >
                                    Metric
                                </th>
                                {strategies.map((strategy) => (
                                    <th
                                        key={strategy.id}
                                        className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                                            }`}
                                    >
                                        {strategy.name}
                                        {strategy.type === 'benchmark' && (
                                            <span
                                                className={`ml-2 text-xs font-normal ${isDark ? 'text-gray-500' : 'text-gray-500'
                                                    }`}
                                            >
                                                (Benchmark)
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody
                            className={
                                isDark
                                    ? 'divide-y divide-white/[0.1]'
                                    : 'divide-y divide-gray-200'
                            }
                        >
                            {/* Total Return */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    Total Return
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.totalReturn,
                                        index === getBestInMetric('totalReturn')
                                    )
                                )}
                            </tr>

                            {/* CAGR */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    CAGR
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.cagr,
                                        index === getBestInMetric('cagr')
                                    )
                                )}
                            </tr>

                            {/* Sharpe Ratio */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    Sharpe Ratio
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.sharpeRatio,
                                        index === getBestInMetric('sharpeRatio'),
                                        ''
                                    )
                                )}
                            </tr>

                            {/* Max Drawdown */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    Max Drawdown
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.maxDrawdown,
                                        index === getBestInMetric('maxDrawdown')
                                    )
                                )}
                            </tr>

                            {/* Volatility */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    Volatility
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.volatility,
                                        index === getBestInMetric('volatility')
                                    )
                                )}
                            </tr>

                            {/* Win Rate */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    Win Rate
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.winRate,
                                        index === getBestInMetric('winRate')
                                    )
                                )}
                            </tr>

                            {/* Number of Trades */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    # of Trades
                                </td>
                                {strategies.map((strategy) => (
                                    <td
                                        key={strategy.id}
                                        className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
                                            }`}
                                    >
                                        {strategy.metrics.numberOfTrades ?? 'N/A'}
                                    </td>
                                ))}
                            </tr>

                            {/* Avg Trade */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    Avg Trade
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.avgTrade,
                                        index === getBestInMetric('avgTrade')
                                    )
                                )}
                            </tr>

                            {/* Best Month */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    Best Month
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.bestMonth,
                                        index === getBestInMetric('bestMonth')
                                    )
                                )}
                            </tr>

                            {/* Worst Month */}
                            <tr>
                                <td
                                    className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'
                                        }`}
                                >
                                    Worst Month
                                </td>
                                {strategies.map((strategy, index) =>
                                    renderMetricCell(
                                        strategy.metrics.worstMonth,
                                        index === getBestInMetric('worstMonth')
                                    )
                                )}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                ⭐ = Best in class
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    className={`py-2 px-4 rounded text-sm font-medium transition-all duration-200 ${isDark
                        ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                        }`}
                >
                    Export as PDF
                </button>
                <button
                    className={`py-2 px-4 rounded text-sm font-medium transition-all duration-200 ${isDark
                        ? 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] border border-white/[0.15]'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                >
                    Add More Strategies
                </button>
            </div>
        </div>
    )
}
