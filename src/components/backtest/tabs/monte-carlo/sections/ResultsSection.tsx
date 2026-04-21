import React from 'react'
import type { ResultsSectionProps } from '../types'
import { formatReturn, formatCurrency, calculateRiskScore, getRiskScoreColor, type RiskInsight } from '../utils'
import { MetricCard } from '../components'
import { PortfolioDistributionChart, PortfolioFanChart } from '../charts'
import { AnnualReturnExpectations } from './AnnualReturnExpectations'

// Risk insight icon component
const InsightIcon: React.FC<{ icon: RiskInsight['icon']; className?: string }> = ({ icon, className = '' }) => {
    switch (icon) {
        case 'shield':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        case 'alert':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        case 'trending':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        case 'target':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        case 'zap':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        case 'chart':
        default:
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
            )
    }
}

// Compact horizontal risk factor bar for always-visible display
const RiskFactorBar: React.FC<{
    name: string
    score: number
    isDark: boolean
}> = ({ name, score, isDark }) => {
    const getScoreColor = (s: number) => {
        if (s >= 75) return 'bg-emerald-500'
        if (s >= 50) return 'bg-blue-500'
        if (s >= 30) return 'bg-amber-500'
        return 'bg-red-500'
    }

    const getTextColor = (s: number) => {
        if (s >= 75) return isDark ? 'text-emerald-400' : 'text-emerald-600'
        if (s >= 50) return isDark ? 'text-blue-400' : 'text-blue-600'
        if (s >= 30) return isDark ? 'text-amber-400' : 'text-amber-600'
        return isDark ? 'text-red-400' : 'text-red-600'
    }

    // Short name mapping for compact display
    const shortNames: Record<string, string> = {
        'Capital Preservation': 'Capital',
        'Drawdown Resilience': 'Drawdown',
        'Tail Risk Protection': 'Tail Risk',
        'Outcome Consistency': 'Consistency',
        'Risk-Reward Efficiency': 'Efficiency'
    }

    return (
        <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[10px] font-medium w-[52px] flex-shrink-0 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {shortNames[name] || name}
            </span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden min-w-[40px] ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className={`text-[10px] font-bold tabular-nums w-5 text-right flex-shrink-0 ${getTextColor(score)}`}>
                {score}
            </span>
        </div>
    )
}

// Helper to format cashflow display
const formatCashflowSummary = (amount: number, frequency: string, years: number): string => {
    const perYear = frequency === 'weekly' ? 52 : frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1
    const total = Math.abs(amount) * perYear * years
    const direction = amount >= 0 ? 'contributing' : 'withdrawing'
    return `${direction} $${Math.abs(amount).toLocaleString()} ${frequency} ($${total.toLocaleString()} total)`
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ isDark, results: mc, summary, onReset }) => {
    const years = mc.metadata?.projection_years || mc.statistics?.years_per_simulation || 1
    const isMultiYear = years > 1
    const medianReturn = mc.cagr_median ?? mc.expected_return_median ?? 0
    const p10Return = mc.cagr_p10 ?? mc.expected_return_p10 ?? 0
    const p90Return = mc.cagr_p90 ?? mc.expected_return_p90 ?? 0

    const pessimisticScenario = mc.scenarios?.pessimistic || mc.scenarios?.bad_year
    const typicalScenario = mc.scenarios?.typical
    const optimisticScenario = mc.scenarios?.optimistic || mc.scenarios?.great_year

    // Check if cashflow was used in this simulation
    const hasCashflow = mc.metadata?.has_cashflow || (mc.metadata?.cashflow_amount !== undefined && mc.metadata?.cashflow_frequency)
    const cashflowAmount = mc.metadata?.cashflow_amount || 0
    const cashflowFrequency = mc.metadata?.cashflow_frequency || 'monthly'

    // Calculate comprehensive risk score with all available data
    const riskScore = calculateRiskScore(
        mc.loss_probability,
        mc.drawdown_analysis,
        mc.statistics,
        mc.scenarios,
        mc.sharpe_distribution,
        p10Return,
        p90Return,
        medianReturn,
        mc.drawdown_probabilities
    )

    return (
        <div className="space-y-6">
            {/* Integrated Risk Analysis Header - Always Visible */}
            <div className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl shadow-sm ${isDark
                ? 'bg-white/[0.02] border-white/[0.08]'
                : 'bg-white border-gray-200'
                }`}>
                {/* Subtle gradient background */}
                <div className={`absolute inset-0 ${isDark
                    ? 'bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-purple-500/[0.02]'
                    : 'bg-gradient-to-br from-emerald-50/30 via-transparent to-purple-50/30'
                    }`} />

                <div className="relative p-5">
                    {/* Top Row: Title + Simulation Info */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark
                                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20'
                                : 'bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200'
                                }`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Monte Carlo Analysis
                                </h3>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {mc.metadata?.simulations_run || mc.statistics?.simulations_completed} simulations × {years} years
                                </p>
                            </div>
                        </div>

                        {/* Cashflow Badge - shown when cashflow was simulated */}
                        {hasCashflow && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${cashflowAmount >= 0
                                ? isDark ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isDark ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="capitalize">
                                    {formatCashflowSummary(cashflowAmount, cashflowFrequency, years)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Main Content: Score + Factors + Insights - Always Visible */}
                    <div className="grid grid-cols-12 gap-4">
                        {/* Left: Big Risk Score */}
                        <div className="col-span-12 sm:col-span-3 lg:col-span-2">
                            <div className={`h-full flex flex-col items-center justify-center p-4 rounded-xl border ${getRiskScoreColor(riskScore.color, isDark)}`}>
                                <span className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                    }`}>Risk Score</span>
                                <div className={`text-4xl font-bold tabular-nums ${riskScore.color === 'emerald'
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : riskScore.color === 'blue'
                                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                                        : riskScore.color === 'amber'
                                            ? isDark ? 'text-amber-400' : 'text-amber-600'
                                            : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {riskScore.score}
                                </div>
                                <span className={`text-xs font-semibold mt-1 ${riskScore.color === 'emerald'
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : riskScore.color === 'blue'
                                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                                        : riskScore.color === 'amber'
                                            ? isDark ? 'text-amber-400' : 'text-amber-600'
                                            : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>{riskScore.label}</span>
                            </div>
                        </div>

                        {/* Middle: Risk Factor Breakdown */}
                        <div className="col-span-12 sm:col-span-4 lg:col-span-4">
                            <div className={`h-full p-3 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50/50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <svg className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Risk Factors
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    {riskScore.components.map((component, idx) => (
                                        <RiskFactorBar
                                            key={idx}
                                            name={component.name}
                                            score={component.score}
                                            isDark={isDark}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Key Insights */}
                        <div className="col-span-12 sm:col-span-5 lg:col-span-6">
                            <div className={`h-full p-3 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50/50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <svg className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Key Insights
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {riskScore.insights.map((insight, idx) => (
                                        <div
                                            key={idx}
                                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] ${insight.type === 'warning'
                                                ? insight.severity === 'critical'
                                                    ? isDark ? 'bg-red-500/15 text-red-300 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
                                                    : isDark ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                : insight.type === 'strength'
                                                    ? isDark ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : isDark ? 'bg-white/5 text-gray-300 border border-white/10' : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                }`}
                                        >
                                            <InsightIcon
                                                icon={insight.icon}
                                                className="w-3 h-3 flex-shrink-0"
                                            />
                                            <span className="leading-tight">{insight.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Headline - Elegant Alert */}
            {summary && (
                <div className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-5 ${summary.verdict === 'low_risk'
                    ? isDark ? 'bg-emerald-500/[0.03] border-emerald-500/[0.15]' : 'bg-emerald-50/70 border-emerald-200'
                    : summary.verdict === 'high_risk' || summary.verdict === 'speculative'
                        ? isDark ? 'bg-red-500/[0.03] border-red-500/[0.15]' : 'bg-red-50/70 border-red-200'
                        : isDark ? 'bg-amber-500/[0.03] border-amber-500/[0.15]' : 'bg-amber-50/70 border-amber-200'
                    }`}>
                    <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${summary.verdict === 'low_risk' ? 'bg-emerald-500'
                        : summary.verdict === 'high_risk' || summary.verdict === 'speculative' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                    <p className={`text-sm font-medium pl-3 ${summary.verdict === 'low_risk'
                        ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                        : summary.verdict === 'high_risk' || summary.verdict === 'speculative'
                            ? isDark ? 'text-red-400' : 'text-red-700'
                            : isDark ? 'text-amber-400' : 'text-amber-700'
                        }`}>
                        {summary.headline}
                    </p>
                </div>
            )}

            {/* Key Metrics Grid - Premium Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    isDark={isDark}
                    label="Probability of Loss"
                    value={`${(mc.loss_probability * 100).toFixed(1)}%`}
                    subtext={`over ${years} year${years > 1 ? 's' : ''}`}
                    color={mc.loss_probability < 0.1 ? 'emerald' : mc.loss_probability < 0.25 ? 'amber' : 'red'}
                />
                <MetricCard
                    isDark={isDark}
                    label="Value at Risk (95%)"
                    value={formatCurrency(Math.abs(mc.var_95))}
                    subtext="max likely loss"
                    color="red"
                />
                <MetricCard
                    isDark={isDark}
                    label={isMultiYear ? "Expected CAGR" : "Expected Return"}
                    value={formatReturn(medianReturn)}
                    subtext={isMultiYear ? "compound annual" : "median outcome"}
                    color="purple"
                />
                <MetricCard
                    isDark={isDark}
                    label={isMultiYear ? "CAGR Range" : "Return Range"}
                    value={`${(p10Return * 100).toFixed(0)}% to ${(p90Return * 100).toFixed(0)}%`}
                    subtext="10th-90th percentile"
                    color="blue"
                />
            </div>

            {/* Cashflow Analysis - Only shown when cashflows are enabled */}
            {mc.cashflow_metrics && (
                <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark
                    ? 'bg-white/[0.02] border-white/[0.08]'
                    : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mc.cashflow_metrics.cashflow_type === 'contribution'
                            ? isDark ? 'bg-emerald-500/15 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                            : isDark ? 'bg-orange-500/15 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'
                            }`}>
                            <svg className={`w-5 h-5 ${mc.cashflow_metrics.cashflow_type === 'contribution'
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : isDark ? 'text-orange-400' : 'text-orange-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {mc.cashflow_metrics.cashflow_type === 'contribution' ? 'Investment Growth Analysis' : 'Withdrawal Sustainability'}
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {mc.cashflow_metrics.cashflow_type === 'contribution'
                                    ? `Adding $${Math.abs(mc.cashflow_metrics.amount_per_period).toLocaleString()} ${mc.cashflow_metrics.frequency}`
                                    : `Withdrawing $${Math.abs(mc.cashflow_metrics.amount_per_period).toLocaleString()} ${mc.cashflow_metrics.frequency}`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Contribution Metrics */}
                    {mc.cashflow_metrics.cashflow_type === 'contribution' && (
                        <div className="space-y-4">
                            {/* Summary Row */}
                            <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                                <svg className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                    {mc.cashflow_metrics.summary}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                {/* Investment Multiple */}
                                <div className={`p-4 rounded-xl border ring-2 ${isDark
                                    ? 'bg-emerald-500/[0.05] border-emerald-500/30 ring-emerald-500/20'
                                    : 'bg-emerald-50/50 border-emerald-200 ring-emerald-200'
                                    }`}>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                        Investment Multiple
                                    </p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                        {mc.cashflow_metrics.investment_multiple_median?.toFixed(1)}×
                                    </p>
                                    <p className={`text-[10px] mt-1 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>
                                        {mc.cashflow_metrics.investment_multiple_p10?.toFixed(1)}× – {mc.cashflow_metrics.investment_multiple_p90?.toFixed(1)}×
                                    </p>
                                </div>

                                {/* Break-even Probability */}
                                <div className={`p-4 rounded-xl border ${isDark
                                    ? 'bg-white/[0.02] border-white/[0.08]'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Break-even Chance
                                    </p>
                                    <p className={`text-2xl font-bold ${(mc.cashflow_metrics.break_even_probability ?? 0) > 0.9
                                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        : isDark ? 'text-gray-200' : 'text-gray-700'
                                        }`}>
                                        {((mc.cashflow_metrics.break_even_probability ?? 0) * 100).toFixed(0)}%
                                    </p>
                                    <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        of getting money back
                                    </p>
                                </div>

                                {/* Double Money Probability */}
                                <div className={`p-4 rounded-xl border ${isDark
                                    ? 'bg-white/[0.02] border-white/[0.08]'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Double Money
                                    </p>
                                    <p className={`text-2xl font-bold ${(mc.cashflow_metrics.double_money_probability ?? 0) > 0.5
                                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        : isDark ? 'text-gray-200' : 'text-gray-700'
                                        }`}>
                                        {((mc.cashflow_metrics.double_money_probability ?? 0) * 100).toFixed(0)}%
                                    </p>
                                    <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        chance of 2× return
                                    </p>
                                </div>
                            </div>

                            {/* Total Invested vs Median Outcome */}
                            <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/[0.06]' : 'bg-gray-50/50 border-gray-200'}`}>
                                <div className="text-center">
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Invested</p>
                                    <p className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        ${(mc.cashflow_metrics.total_invested ?? 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Median Outcome</p>
                                    <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        ${(mc.cashflow_metrics.final_value_median ?? 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Withdrawal Metrics */}
                    {mc.cashflow_metrics.cashflow_type === 'withdrawal' && (
                        <div className="space-y-4">
                            {/* Summary Row */}
                            <div className={`flex items-center gap-2 p-3 rounded-xl ${(mc.cashflow_metrics.success_rate ?? 0) > 0.9
                                ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                                : (mc.cashflow_metrics.success_rate ?? 0) > 0.7
                                    ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                                    : isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                                }`}>
                                <svg className={`w-4 h-4 flex-shrink-0 ${(mc.cashflow_metrics.success_rate ?? 0) > 0.9
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : (mc.cashflow_metrics.success_rate ?? 0) > 0.7
                                        ? isDark ? 'text-amber-400' : 'text-amber-600'
                                        : isDark ? 'text-red-400' : 'text-red-600'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {(mc.cashflow_metrics.success_rate ?? 0) > 0.7 ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    )}
                                </svg>
                                <span className={`text-sm ${(mc.cashflow_metrics.success_rate ?? 0) > 0.9
                                    ? isDark ? 'text-emerald-300' : 'text-emerald-700'
                                    : (mc.cashflow_metrics.success_rate ?? 0) > 0.7
                                        ? isDark ? 'text-amber-300' : 'text-amber-700'
                                        : isDark ? 'text-red-300' : 'text-red-700'
                                    }`}>
                                    {mc.cashflow_metrics.summary}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                {/* Success Rate */}
                                <div className={`p-4 rounded-xl border ring-2 ${(mc.cashflow_metrics.success_rate ?? 0) > 0.9
                                    ? isDark ? 'bg-emerald-500/[0.05] border-emerald-500/30 ring-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200 ring-emerald-200'
                                    : (mc.cashflow_metrics.success_rate ?? 0) > 0.7
                                        ? isDark ? 'bg-amber-500/[0.05] border-amber-500/30 ring-amber-500/20' : 'bg-amber-50/50 border-amber-200 ring-amber-200'
                                        : isDark ? 'bg-red-500/[0.05] border-red-500/30 ring-red-500/20' : 'bg-red-50/50 border-red-200 ring-red-200'
                                    }`}>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${(mc.cashflow_metrics.success_rate ?? 0) > 0.9
                                        ? isDark ? 'text-emerald-300' : 'text-emerald-600'
                                        : (mc.cashflow_metrics.success_rate ?? 0) > 0.7
                                            ? isDark ? 'text-amber-300' : 'text-amber-600'
                                            : isDark ? 'text-red-300' : 'text-red-600'
                                        }`}>
                                        Success Rate
                                    </p>
                                    <p className={`text-2xl font-bold ${(mc.cashflow_metrics.success_rate ?? 0) > 0.9
                                        ? isDark ? 'text-emerald-300' : 'text-emerald-700'
                                        : (mc.cashflow_metrics.success_rate ?? 0) > 0.7
                                            ? isDark ? 'text-amber-300' : 'text-amber-700'
                                            : isDark ? 'text-red-300' : 'text-red-700'
                                        }`}>
                                        {((mc.cashflow_metrics.success_rate ?? 0) * 100).toFixed(0)}%
                                    </p>
                                    <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        sustained withdrawals
                                    </p>
                                </div>

                                {/* Ruin Probability */}
                                <div className={`p-4 rounded-xl border ${isDark
                                    ? 'bg-white/[0.02] border-white/[0.08]'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                        Ruin Risk
                                    </p>
                                    <p className={`text-2xl font-bold ${(mc.cashflow_metrics.ruin_probability ?? 0) > 0.2
                                        ? isDark ? 'text-red-400' : 'text-red-600'
                                        : isDark ? 'text-gray-200' : 'text-gray-700'
                                        }`}>
                                        {((mc.cashflow_metrics.ruin_probability ?? 0) * 100).toFixed(0)}%
                                    </p>
                                    <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        ran out of money
                                    </p>
                                </div>

                                {/* Ending Balance */}
                                <div className={`p-4 rounded-xl border ${isDark
                                    ? 'bg-white/[0.02] border-white/[0.08]'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Median Ending
                                    </p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                        {formatCurrency(mc.cashflow_metrics.ending_balance_median ?? 0)}
                                    </p>
                                    <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        for successful sims
                                    </p>
                                </div>
                            </div>

                            {/* Total Withdrawn vs Initial Capital */}
                            <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/[0.06]' : 'bg-gray-50/50 border-gray-200'}`}>
                                <div className="text-center">
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Initial Capital</p>
                                    <p className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        ${(mc.cashflow_metrics.initial_capital ?? 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Total Withdrawn</p>
                                    <p className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                        ${(mc.cashflow_metrics.total_withdrawn ?? 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Portfolio Value Distribution (Bell Curve) */}
            {mc.distribution && mc.distribution.bins && mc.distribution.bins.length > 0 && (
                <PortfolioDistributionChart
                    isDark={isDark}
                    distribution={mc.distribution}
                    initialCapital={mc.statistics?.initial_capital || mc.initial_capital || 100000}
                    medianValue={typicalScenario?.final_value || (mc.statistics?.initial_capital || 100000) * (1 + medianReturn)}
                    p10Value={pessimisticScenario?.final_value || (mc.statistics?.initial_capital || 100000) * (1 + p10Return)}
                    p90Value={optimisticScenario?.final_value || (mc.statistics?.initial_capital || 100000) * (1 + p90Return)}
                    totalSimulations={mc.metadata?.simulations_run || mc.statistics?.simulations_completed || 100}
                />
            )}

            {/* Expected Annual Returns - Interactive */}
            {isMultiYear && (
                <AnnualReturnExpectations
                    isDark={isDark}
                    p10={p10Return}
                    median={medianReturn}
                    p90={p90Return}
                    years={years}
                    initialCapital={mc.statistics?.initial_capital || mc.initial_capital || 100000}
                    cagrDistribution={mc.cagr_distribution}
                    totalSimulations={mc.metadata?.simulations_run || mc.statistics?.simulations_completed || 100}
                />
            )}

            {/* Portfolio Value Fan Chart (Cone of Uncertainty) */}
            {mc.path_percentiles && mc.path_percentiles.percentiles && (
                <PortfolioFanChart
                    isDark={isDark}
                    pathData={mc.path_percentiles}
                    years={years}
                />
            )}

            {/* Drawdown Analysis - Premium Design */}
            {mc.drawdown_analysis && (
                <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark
                    ? 'bg-white/[0.02] border-white/[0.08]'
                    : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark
                            ? 'bg-red-500/15 border border-red-500/20'
                            : 'bg-red-50 border border-red-200'
                            }`}>
                            <svg className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        </div>
                        <div>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Maximum Drawdown Risk
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Worst peak-to-trough decline across simulations
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className={`p-4 rounded-xl border ${isDark
                            ? 'bg-white/[0.02] border-white/[0.08]'
                            : 'bg-gray-50 border-gray-200'
                            }`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Median</p>
                            <p className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                {((mc.drawdown_analysis.median || 0) * 100).toFixed(0)}%
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${isDark
                            ? 'bg-amber-500/[0.03] border-amber-500/20'
                            : 'bg-amber-50/50 border-amber-200'
                            }`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>90th Percentile</p>
                            <p className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                {((mc.drawdown_analysis.p90 || 0) * 100).toFixed(0)}%
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${isDark
                            ? 'bg-red-500/[0.03] border-red-500/20'
                            : 'bg-red-50/50 border-red-200'
                            }`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Worst Case</p>
                            <p className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                {((mc.drawdown_analysis.worst || 0) * 100).toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Sharpe Ratio Distribution - Premium Design */}
            {mc.sharpe_distribution && (
                <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark
                    ? 'bg-white/[0.02] border-white/[0.08]'
                    : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark
                                ? 'bg-cyan-500/15 border border-cyan-500/20'
                                : 'bg-cyan-50 border border-cyan-200'
                                }`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Sharpe Ratio Distribution
                                </h4>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Risk-adjusted return metric
                                </p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg ${isDark
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                            Above 1.0 is excellent
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className={`p-4 rounded-xl border ${mc.sharpe_distribution.p10 < 0.5
                            ? isDark ? 'bg-red-500/[0.03] border-red-500/20' : 'bg-red-50/50 border-red-200'
                            : isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${mc.sharpe_distribution.p10 < 0.5
                                ? isDark ? 'text-red-400' : 'text-red-600'
                                : isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>10th Percentile</p>
                            <p className={`text-xl font-bold ${mc.sharpe_distribution.p10 < 0.5
                                ? isDark ? 'text-red-400' : 'text-red-600'
                                : isDark ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                {mc.sharpe_distribution.p10.toFixed(2)}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ring-2 ${isDark
                            ? 'bg-indigo-500/[0.05] border-indigo-500/30 ring-indigo-500/20'
                            : 'bg-indigo-50/50 border-indigo-200 ring-indigo-200'
                            }`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>Median</p>
                            <p className={`text-xl font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                                {mc.sharpe_distribution.median.toFixed(2)}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${mc.sharpe_distribution.p90 > 1.0
                            ? isDark ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200'
                            : isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${mc.sharpe_distribution.p90 > 1.0
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>90th Percentile</p>
                            <p className={`text-xl font-bold ${mc.sharpe_distribution.p90 > 1.0
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : isDark ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                {mc.sharpe_distribution.p90.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Run Again Button - Premium */}
            <button
                onClick={onReset}
                className={`group w-full py-3.5 px-5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2.5 ${isDark
                    ? 'bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] hover:text-white border border-white/[0.08] hover:border-white/[0.15]'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                    }`}
            >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Run New Simulation
            </button>
        </div>
    )
}
