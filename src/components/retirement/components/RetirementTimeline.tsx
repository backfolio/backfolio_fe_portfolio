import { memo } from 'react'
import { CASHFLOW_FREQUENCY_OPTIONS } from '../constants'
import type { RetirementTimelineProps, CashflowFrequency } from '../types'

const getFrequencyLabel = (frequency: CashflowFrequency): string => {
    const option = CASHFLOW_FREQUENCY_OPTIONS.find(o => o.value === frequency)
    return option?.label.toLowerCase() || 'monthly'
}

const RetirementTimelineComponent: React.FC<RetirementTimelineProps> = ({
    currentAge,
    retirementAge,
    lifeExpectancy,
    contributionAmount,
    contributionFrequency,
    spendingAmount,
    spendingFrequency,
    isDark
}) => {
    const totalYears = lifeExpectancy - currentAge
    const accumulationYears = retirementAge - currentAge
    const drawdownYears = lifeExpectancy - retirementAge
    const accumulationWidth = (accumulationYears / totalYears) * 100
    const drawdownWidth = (drawdownYears / totalYears) * 100

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200'
            }`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${isDark ? 'bg-purple-500/15 border-purple-500/20' : 'bg-purple-50 border-purple-200'
                    }`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Retirement Timeline
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Your {totalYears}-year financial journey
                    </p>
                </div>
            </div>

            {/* Timeline bar */}
            <div className="mb-6">
                <div className={`h-4 rounded-full overflow-hidden flex ${isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}`}>
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 relative"
                        style={{ width: `${accumulationWidth}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                    </div>
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 relative"
                        style={{ width: `${drawdownWidth}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                    </div>
                </div>

                {/* Age markers */}
                <div className="flex justify-between mt-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Age {currentAge}
                    </span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        Retire: {retirementAge}
                    </span>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Age {lifeExpectancy}
                    </span>
                </div>
            </div>

            {/* Phase cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-purple-500/[0.03] border-purple-500/20' : 'bg-purple-50/50 border-purple-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                            Accumulation
                        </span>
                    </div>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {accumulationYears} years
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        +${contributionAmount.toLocaleString()}/{getFrequencyLabel(contributionFrequency)} contributions
                    </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-indigo-500/[0.03] border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                            Drawdown
                        </span>
                    </div>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {drawdownYears} years
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        −${spendingAmount.toLocaleString()}/{getFrequencyLabel(spendingFrequency)} spending
                    </p>
                </div>
            </div>
        </div>
    )
}

export const RetirementTimeline = memo(RetirementTimelineComponent)
RetirementTimeline.displayName = 'RetirementTimeline'

