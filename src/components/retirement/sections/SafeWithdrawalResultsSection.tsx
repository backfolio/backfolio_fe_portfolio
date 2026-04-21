import { memo } from 'react'
import { MetricCard } from '../components'
import { RetirementFanChart } from '../charts'
import { formatCurrency } from '../utils'
import { getMonthlyEquivalent, CASHFLOW_FREQUENCY_OPTIONS } from '../constants'
import type { SafeWithdrawalResultsProps } from '../types'

const getFrequencyLabel = (frequency: string): string => {
    const option = CASHFLOW_FREQUENCY_OPTIONS.find(o => o.value === frequency)
    return option?.label.toLowerCase() || 'monthly'
}

const SafeWithdrawalResultsSectionComponent: React.FC<SafeWithdrawalResultsProps> = ({
    isDark,
    results,
    chartData,
    currentAgeNum,
    retirementAgeNum,
    lifeExpectancyNum,
    yearsToRetirement,
    yearsInRetirement,
    initialSavings,
    contributionAmount,
    contributionFrequency,
    onReset
}) => {
    const monthlyContribution = getMonthlyEquivalent(parseFloat(contributionAmount) || 0, contributionFrequency)

    if (!results.safe_withdrawals || !results.recommended) return null

    const { safe_withdrawals, recommended, simulation_results } = results

    // Sort thresholds by confidence level (highest first)
    const sortedThresholds = Object.entries(safe_withdrawals)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Hero: Recommended Budget */}
            <div className={`rounded-xl p-6 text-center ${isDark
                ? 'bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/30'
                : 'bg-gradient-to-br from-purple-50 via-purple-25 to-white border border-purple-200'}`}>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${isDark
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-purple-100 text-purple-700'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {recommended.confidence}% Confidence Level
                </div>

                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your recommended monthly budget in retirement
                </p>

                <div className={`text-4xl sm:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${recommended.monthly.toLocaleString()}
                    <span className={`text-lg font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/month</span>
                </div>

                <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    ${recommended.annual.toLocaleString()} per year
                </p>
            </div>

            {/* Confidence Thresholds Table */}
            <div className={`backdrop-blur-2xl rounded-lg overflow-hidden ${isDark ? 'bg-white/[0.02] border border-white/[0.15]' : 'bg-white border border-gray-200'}`}>
                <div className={`px-4 sm:px-5 py-3 sm:py-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Safe Withdrawal by Confidence Level
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Higher confidence = more conservative spending
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}>
                                <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Confidence
                                </th>
                                <th className={`px-4 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Monthly
                                </th>
                                <th className={`px-4 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Annual
                                </th>
                                <th className={`px-4 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Risk Level
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/[0.05]' : 'divide-gray-100'}`}>
                            {sortedThresholds.map(([confidence, data]) => {
                                const isRecommended = parseInt(confidence) === recommended.confidence
                                const riskLevel = parseInt(confidence) >= 95
                                    ? { label: 'Conservative', color: isDark ? 'text-emerald-400' : 'text-emerald-600' }
                                    : parseInt(confidence) >= 90
                                        ? { label: 'Balanced', color: isDark ? 'text-blue-400' : 'text-blue-600' }
                                        : { label: 'Aggressive', color: isDark ? 'text-amber-400' : 'text-amber-600' }

                                return (
                                    <tr
                                        key={confidence}
                                        className={`${isRecommended
                                            ? isDark ? 'bg-purple-500/10' : 'bg-purple-50'
                                            : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {confidence}%
                                                </span>
                                                {isRecommended && (
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isDark
                                                        ? 'bg-purple-500/30 text-purple-300'
                                                        : 'bg-purple-100 text-purple-700'}`}>
                                                        Recommended
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 text-right text-sm font-semibold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            ${data.monthly.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-3 text-right text-sm tabular-nums ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            ${data.annual.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-3 text-center text-xs font-medium ${riskLevel.color}`}>
                                            {riskLevel.label}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                    isDark={isDark}
                    label="At Retirement"
                    value={formatCurrency(simulation_results?.value_at_retirement || 0)}
                    subtext={`Age ${retirementAgeNum}`}
                    color="purple"
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                />
                <MetricCard
                    isDark={isDark}
                    label="Median Final"
                    value={formatCurrency(simulation_results?.median_final_value || 0)}
                    subtext={`Age ${lifeExpectancyNum}`}
                    color="blue"
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                />
                <MetricCard
                    isDark={isDark}
                    label="Success Rate"
                    value={`${((simulation_results?.success_rate || 0) * 100).toFixed(0)}%`}
                    subtext="At recommended budget"
                    color="emerald"
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <MetricCard
                    isDark={isDark}
                    label="Total Withdrawal"
                    value={formatCurrency(recommended.monthly * 12 * yearsInRetirement)}
                    subtext={`Over ${yearsInRetirement} years`}
                    color="amber"
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Portfolio Projection Chart */}
            {chartData.length > 0 && (
                <RetirementFanChart
                    chartData={chartData}
                    isDark={isDark}
                    yearsToRetirement={yearsToRetirement}
                    formatCurrency={formatCurrency}
                />
            )}

            {/* Cashflow Summary */}
            <div className={`backdrop-blur-2xl rounded-lg overflow-hidden ${isDark ? 'bg-white/[0.02] border border-white/[0.15]' : 'bg-white border border-gray-200'}`}>
                <div className={`px-4 sm:px-5 py-3 sm:py-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Cashflow Summary
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Based on your recommended monthly budget of ${recommended.monthly.toLocaleString()}
                    </p>
                </div>

                <div className={`p-4 sm:p-5 ${isDark ? '' : 'bg-gray-50/50'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className={`p-3 sm:p-4 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/[0.1]' : 'bg-white border-gray-200'}`}>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Initial Savings</p>
                            <p className={`text-lg font-semibold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(parseFloat(initialSavings) || 0)}
                            </p>
                        </div>
                        <div className={`p-3 sm:p-4 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/[0.1]' : 'bg-white border-gray-200'}`}>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Total Contributions</p>
                            <p className={`text-base sm:text-lg font-semibold tabular-nums ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                +{formatCurrency(monthlyContribution * 12 * yearsToRetirement)}
                            </p>
                            <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                ${(parseFloat(contributionAmount) || 0).toLocaleString()}/{getFrequencyLabel(contributionFrequency)} × {yearsToRetirement}y
                            </p>
                        </div>
                        <div className={`p-3 sm:p-4 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/[0.1]' : 'bg-white border-gray-200'}`}>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Total Withdrawals</p>
                            <p className={`text-base sm:text-lg font-semibold tabular-nums ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                −{formatCurrency(recommended.monthly * 12 * yearsInRetirement)}
                            </p>
                            <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                ${recommended.monthly.toLocaleString()}/monthly × {yearsInRetirement}y
                            </p>
                        </div>
                        <div className={`p-3 sm:p-4 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/[0.1]' : 'bg-white border-gray-200'}`}>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Years in Retirement</p>
                            <p className={`text-lg font-semibold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {yearsInRetirement} years
                            </p>
                            <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                Age {retirementAgeNum} to {lifeExpectancyNum}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Metadata */}
            <div className={`rounded-lg p-3 ${isDark ? 'bg-white/[0.02] border border-white/[0.1]' : 'bg-gray-100 border border-gray-200'}`}>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Percentile-based analysis
                    </div>
                    <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {lifeExpectancyNum - currentAgeNum} year projection
                    </div>
                    <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Monte Carlo simulation
                    </div>
                </div>
            </div>

            {/* Close Button */}
            <button
                onClick={onReset}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isDark
                    ? 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-gray-300 border border-white/[0.06]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 border border-gray-200'
                    }`}
            >
                Close Results
            </button>
        </div>
    )
}

export const SafeWithdrawalResultsSection = memo(SafeWithdrawalResultsSectionComponent)
SafeWithdrawalResultsSection.displayName = 'SafeWithdrawalResultsSection'



