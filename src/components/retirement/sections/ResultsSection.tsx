import { memo } from 'react'
import { MetricCard, ScenarioCard, SuccessRateGauge, RetirementTimeline } from '../components'
import { RetirementFanChart } from '../charts'
import { formatCurrency } from '../utils'
import { getMonthlyEquivalent, CASHFLOW_FREQUENCY_OPTIONS } from '../constants'
import type { ResultsSectionProps } from '../types'

const getFrequencyLabel = (frequency: string): string => {
    const option = CASHFLOW_FREQUENCY_OPTIONS.find(o => o.value === frequency)
    return option?.label.toLowerCase() || 'monthly'
}

const ResultsSectionComponent: React.FC<ResultsSectionProps> = ({
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
    spendingAmount,
    spendingFrequency,
    onReset
}) => {
    // Calculate monthly equivalents for total calculations
    const monthlyContribution = getMonthlyEquivalent(parseFloat(contributionAmount) || 0, contributionFrequency)
    const monthlySpending = getMonthlyEquivalent(parseFloat(spendingAmount) || 0, spendingFrequency)
    if (!results.results) return null

    const { results: data } = results

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Success Rate */}
            <SuccessRateGauge
                rate={data.success_rate}
                isDark={isDark}
                retirementAge={retirementAgeNum}
                lifeExpectancy={lifeExpectancyNum}
            />

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                    isDark={isDark}
                    label="At Retirement"
                    value={formatCurrency(data.value_at_retirement)}
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
                    value={formatCurrency(data.median_final_value)}
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
                    label="90th Percentile"
                    value={formatCurrency(data.scenarios.optimistic.final_value)}
                    subtext="Optimistic"
                    color="purple"
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    }
                />
                <MetricCard
                    isDark={isDark}
                    label="10th Percentile"
                    value={formatCurrency(data.scenarios.pessimistic.final_value)}
                    subtext={data.scenarios.pessimistic.ruin_age
                        ? `Depleted age ${Math.round(currentAgeNum + data.scenarios.pessimistic.ruin_age)}`
                        : 'Pessimistic'}
                    color={data.scenarios.pessimistic.final_value > 0 ? 'amber' : 'red'}
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
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

            {/* Retirement Timeline */}
            <RetirementTimeline
                currentAge={currentAgeNum}
                retirementAge={retirementAgeNum}
                lifeExpectancy={lifeExpectancyNum}
                contributionAmount={parseFloat(contributionAmount) || 0}
                contributionFrequency={contributionFrequency}
                spendingAmount={parseFloat(spendingAmount) || 0}
                spendingFrequency={spendingFrequency}
                isDark={isDark}
            />

            {/* Scenario Analysis */}
            <div className={`backdrop-blur-2xl rounded-lg overflow-hidden ${isDark ? 'bg-white/[0.02] border border-white/[0.15]' : 'bg-white border border-gray-200'}`}>
                <div className={`px-4 sm:px-5 py-3 sm:py-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Scenario Comparison
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Terminal portfolio values at age {lifeExpectancyNum}
                    </p>
                </div>

                <div className={`grid grid-cols-3 divide-x ${isDark ? 'divide-white/[0.1]' : 'divide-gray-100'}`}>
                    <ScenarioCard
                        title="Pessimistic"
                        subtitle="10th percentile"
                        value={formatCurrency(data.scenarios.pessimistic.final_value)}
                        subValue={data.scenarios.pessimistic.ruin_age
                            ? `Depleted at age ${Math.round(currentAgeNum + data.scenarios.pessimistic.ruin_age)}`
                            : undefined}
                        color="amber"
                        isDark={isDark}
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        }
                    />
                    <ScenarioCard
                        title="Median"
                        subtitle="50th percentile"
                        value={formatCurrency(data.scenarios.median.final_value)}
                        color="indigo"
                        isDark={isDark}
                        isHighlighted
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                    />
                    <ScenarioCard
                        title="Optimistic"
                        subtitle="90th percentile"
                        value={formatCurrency(data.scenarios.optimistic.final_value)}
                        color="purple"
                        isDark={isDark}
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        }
                    />
                </div>
            </div>

            {/* Cashflow Summary */}
            <div className={`backdrop-blur-2xl rounded-lg overflow-hidden ${isDark ? 'bg-white/[0.02] border border-white/[0.15]' : 'bg-white border border-gray-200'}`}>
                <div className={`px-4 sm:px-5 py-3 sm:py-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Cashflow Summary
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Total contributions and withdrawals over planning period
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
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Total Spending</p>
                            <p className={`text-base sm:text-lg font-semibold tabular-nums ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                −{formatCurrency(monthlySpending * 12 * yearsInRetirement)}
                            </p>
                            <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                ${(parseFloat(spendingAmount) || 0).toLocaleString()}/{getFrequencyLabel(spendingFrequency)} × {yearsInRetirement}y
                            </p>
                        </div>
                        <div className={`p-3 sm:p-4 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/[0.1]' : 'bg-white border-gray-200'}`}>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Ruin Probability</p>
                            <p className={`text-lg font-semibold tabular-nums ${data.ruin_probability < 0.1
                                ? isDark ? 'text-purple-400' : 'text-purple-600'
                                : data.ruin_probability < 0.25
                                    ? isDark ? 'text-amber-400' : 'text-amber-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                }`}>
                                {(data.ruin_probability * 100).toFixed(1)}%
                            </p>
                            <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                Portfolio depletion risk
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
                        {data.metadata?.simulations_run || 100} simulations
                    </div>
                    <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {data.metadata?.total_years || (lifeExpectancyNum - currentAgeNum)} year projection
                    </div>
                    <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Block Bootstrap methodology
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

export const ResultsSection = memo(ResultsSectionComponent)
ResultsSection.displayName = 'ResultsSection'
