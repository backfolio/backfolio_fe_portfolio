import React, { useState } from 'react'
import type { AnnualReturnExpectationsProps, ReturnViewMode } from '../types'
import { formatPercent, formatCurrencyDetailed } from '../utils'
import { CAGRDistributionBarChart, InteractiveDistributionCurve } from '../charts'

export const AnnualReturnExpectations: React.FC<AnnualReturnExpectationsProps> = ({
    isDark,
    p10,
    median,
    p90,
    years,
    initialCapital = 100000,
    cagrDistribution,
    totalSimulations = 100
}) => {
    const [viewMode, setViewMode] = useState<ReturnViewMode>('cagr')
    const [hoveredScenario, setHoveredScenario] = useState<string | null>(null)

    // Calculate total returns from CAGR (with safeguards for extreme values)
    const totalReturn = (cagr: number) => {
        const safeCagr = Math.max(-0.99, Math.min(cagr, 1.0)) // Cap at -99% to 100% CAGR
        const result = Math.pow(1 + safeCagr, years) - 1
        return isFinite(result) ? result : 0
    }
    const finalValue = (cagr: number) => {
        const safeCagr = Math.max(-0.99, Math.min(cagr, 1.0))
        const result = initialCapital * Math.pow(1 + safeCagr, years)
        return isFinite(result) ? result : initialCapital
    }

    // Get display values based on view mode
    const getDisplayValue = (cagr: number) => {
        switch (viewMode) {
            case 'cagr':
                return formatPercent(cagr)
            case 'total':
                return formatPercent(totalReturn(cagr))
            case 'value':
                return formatCurrencyDetailed(finalValue(cagr))
        }
    }

    const getSubtext = (scenario: string) => {
        const cagrVal = scenario === 'p10' ? p10 : scenario === 'median' ? median : p90
        switch (viewMode) {
            case 'cagr':
                return `→ ${formatCurrencyDetailed(finalValue(cagrVal))} final`
            case 'total':
                return `${formatPercent(cagrVal)} CAGR`
            case 'value':
                return `${formatPercent(totalReturn(cagrVal))} total return`
        }
    }

    const scenarios = [
        {
            id: 'p10',
            label: 'Pessimistic',
            percentile: '10th percentile',
            cagr: p10,
            color: 'amber',
            bgClass: isDark 
                ? 'bg-amber-500/[0.03] border-amber-500/20 hover:bg-amber-500/[0.06]' 
                : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/50',
            labelClass: isDark ? 'text-amber-400' : 'text-amber-600',
            accentColor: isDark ? 'bg-amber-500' : 'bg-amber-500'
        },
        {
            id: 'median',
            label: 'Expected',
            percentile: 'Median outcome',
            cagr: median,
            color: 'indigo',
            bgClass: isDark 
                ? 'bg-indigo-500/[0.05] border-indigo-500/30 ring-2 ring-indigo-500/20 hover:bg-indigo-500/[0.08]' 
                : 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-200/50 hover:bg-indigo-100/50',
            labelClass: isDark ? 'text-indigo-400' : 'text-indigo-600',
            accentColor: isDark ? 'bg-indigo-500' : 'bg-indigo-500'
        },
        {
            id: 'p90',
            label: 'Optimistic',
            percentile: '90th percentile',
            cagr: p90,
            color: 'emerald',
            bgClass: isDark 
                ? 'bg-emerald-500/[0.03] border-emerald-500/20 hover:bg-emerald-500/[0.06]' 
                : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/50',
            labelClass: isDark ? 'text-emerald-400' : 'text-emerald-600',
            accentColor: isDark ? 'bg-emerald-500' : 'bg-emerald-500'
        }
    ]

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${
            isDark 
                ? 'bg-white/[0.02] border-white/[0.08]' 
                : 'bg-white border-gray-200'
        }`}>
            {/* Header with View Toggle */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl border ${
                        isDark 
                            ? 'bg-emerald-500/15 border-emerald-500/20' 
                            : 'bg-emerald-50 border-emerald-200'
                    }`}>
                        <svg className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {viewMode === 'cagr' ? 'Expected Annual Returns' : viewMode === 'total' ? 'Total Return Over Period' : 'Final Portfolio Value'}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {viewMode === 'cagr'
                                ? `Compound annual growth rate over ${years} years`
                                : viewMode === 'total'
                                    ? `Cumulative return after ${years} years`
                                    : `Starting with ${formatCurrencyDetailed(initialCapital)} over ${years} years`
                            }
                        </p>
                    </div>
                </div>

                {/* View Mode Toggle - Premium Pills */}
                <div className={`flex items-center p-1 rounded-xl ${
                    isDark ? 'bg-white/[0.03] border border-white/[0.08]' : 'bg-gray-100 border border-gray-200'
                }`}>
                    <button
                        onClick={() => setViewMode('cagr')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                            viewMode === 'cagr'
                                ? isDark
                                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30'
                                    : 'bg-white text-emerald-600 shadow-sm border border-emerald-200'
                                : isDark
                                    ? 'text-gray-500 hover:text-gray-300'
                                    : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        CAGR
                    </button>
                    <button
                        onClick={() => setViewMode('total')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                            viewMode === 'total'
                                ? isDark
                                    ? 'bg-blue-500/20 text-blue-400 shadow-sm border border-blue-500/30'
                                    : 'bg-white text-blue-600 shadow-sm border border-blue-200'
                                : isDark
                                    ? 'text-gray-500 hover:text-gray-300'
                                    : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Total %
                    </button>
                    <button
                        onClick={() => setViewMode('value')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                            viewMode === 'value'
                                ? isDark
                                    ? 'bg-purple-500/20 text-purple-400 shadow-sm border border-purple-500/30'
                                    : 'bg-white text-purple-600 shadow-sm border border-purple-200'
                                : isDark
                                    ? 'text-gray-500 hover:text-gray-300'
                                    : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        $ Value
                    </button>
                </div>
            </div>

            {/* Main Stats - Interactive Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {scenarios.map((scenario) => (
                    <div
                        key={scenario.id}
                        className={`relative overflow-hidden text-center p-5 rounded-xl border cursor-pointer transition-all duration-300 ${scenario.bgClass}`}
                        onMouseEnter={() => setHoveredScenario(scenario.id)}
                        onMouseLeave={() => setHoveredScenario(null)}
                    >
                        {/* Top accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] ${scenario.accentColor} transition-opacity duration-300 ${
                            hoveredScenario === scenario.id ? 'opacity-100' : 'opacity-50'
                        }`} />
                        
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${scenario.labelClass}`}>
                            {scenario.label}
                        </p>
                        <p className={`text-2xl font-bold transition-all duration-300 ${
                            scenario.id === 'median'
                                ? (isDark ? 'text-indigo-400' : 'text-indigo-600')
                                : scenario.cagr >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                            {getDisplayValue(scenario.cagr)}
                        </p>

                        {/* Animated subtext */}
                        <div className={`overflow-hidden transition-all duration-300 ${
                            hoveredScenario === scenario.id ? 'max-h-12 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
                        }`}>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {getSubtext(scenario.id)}
                            </p>
                        </div>

                        {/* Default subtext (hidden on hover) */}
                        <div className={`transition-all duration-300 ${
                            hoveredScenario === scenario.id ? 'opacity-0 h-0' : 'opacity-100 h-auto mt-1'
                        }`}>
                            <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {scenario.percentile}
                            </p>
                        </div>

                        {/* Hover indicator */}
                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full transition-all duration-300 ${
                            hoveredScenario === scenario.id
                                ? `${scenario.accentColor} opacity-100`
                                : 'opacity-0'
                        }`} />
                    </div>
                ))}
            </div>

            {/* CAGR Distribution Bar Chart */}
            {cagrDistribution && cagrDistribution.bins && cagrDistribution.bins.length > 0 ? (
                <CAGRDistributionBarChart
                    isDark={isDark}
                    distribution={cagrDistribution}
                    p10={p10}
                    median={median}
                    p90={p90}
                    totalSimulations={totalSimulations}
                    hoveredScenario={hoveredScenario}
                />
            ) : (
                <InteractiveDistributionCurve
                    isDark={isDark}
                    p10={p10}
                    median={median}
                    p90={p90}
                    years={years}
                    initialCapital={initialCapital}
                    hoveredScenario={hoveredScenario}
                    setHoveredScenario={setHoveredScenario}
                />
            )}
        </div>
    )
}
