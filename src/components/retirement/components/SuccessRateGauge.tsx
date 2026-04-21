import { memo } from 'react'
import type { SuccessRateGaugeProps } from '../types'

const SuccessRateGaugeComponent: React.FC<SuccessRateGaugeProps> = ({
    rate,
    isDark,
    retirementAge,
    lifeExpectancy
}) => {
    const percentage = Math.round(rate * 100)

    const getColorConfig = () => {
        if (rate >= 0.90) return { 
            main: isDark ? '#4ade80' : '#16a34a', 
            label: 'On Track',
            insight: 'Your retirement plan is well-positioned. A professional review can help optimize further.'
        }
        if (rate >= 0.75) return { 
            main: isDark ? '#facc15' : '#ca8a04', 
            label: 'Needs Attention',
            insight: 'Small adjustments now could significantly improve your retirement outlook.'
        }
        if (rate >= 0.60) return { 
            main: isDark ? '#fb923c' : '#ea580c', 
            label: 'At Risk',
            insight: 'Your current plan has gaps that should be addressed sooner rather than later.'
        }
        return { 
            main: isDark ? '#f87171' : '#dc2626', 
            label: 'Critical',
            insight: 'Without changes, there\'s a high probability of running out of money in retirement.'
        }
    }
    const color = getColorConfig()

    const getMessage = () => {
        if (rate >= 0.95) return 'Very high probability of meeting retirement spending requirements through the planning horizon.'
        if (rate >= 0.90) return 'Strong probability of portfolio sustainability throughout retirement.'
        if (rate >= 0.80) return 'Good probability of success. Consider stress-testing with reduced contributions or higher spending.'
        if (rate >= 0.70) return 'Moderate success probability. Review contribution levels and spending assumptions.'
        if (rate >= 0.50) return 'Significant risk of portfolio depletion. Recommend adjusting plan parameters.'
        return 'High probability of shortfall. Substantial changes to savings rate or spending required.'
    }

    return (
        <div className={`backdrop-blur-2xl rounded-lg overflow-hidden ${isDark
            ? 'bg-white/[0.02] border border-white/[0.15]'
            : 'bg-white border border-gray-200'
            }`}>
            <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
                    {/* Gauge */}
                    <div className="flex-shrink-0 flex items-center justify-center lg:justify-start">
                        <div className="relative">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke={isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb'}
                                    strokeWidth="8"
                                />
                                {/* Progress arc */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke={color.main}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${rate * 264} 264`}
                                    className="transition-all duration-700 ease-out"
                                />
                            </svg>
                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-bold tabular-nums tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {percentage}
                                </span>
                                <span className={`text-[9px] uppercase tracking-widest font-semibold mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Score
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div 
                                className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                                style={{ 
                                    backgroundColor: `${color.main}18`,
                                    color: color.main
                                }}
                            >
                                {color.label}
                            </div>
                        </div>
                        <p className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {color.insight}
                        </p>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getMessage()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer stats */}
            <div className={`px-4 sm:px-6 py-3 border-t flex flex-wrap items-center gap-3 sm:gap-4 text-xs ${isDark ? 'border-white/[0.1]' : 'bg-gray-50 border-gray-100'}`}>
                <div className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Retirement:</span> Age {retirementAge}
                </div>
                <div className={`hidden sm:block w-px h-3 ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
                <div className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Horizon:</span> Age {lifeExpectancy}
                </div>
                <div className={`hidden sm:block w-px h-3 ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
                <div className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Years:</span> {lifeExpectancy - retirementAge} in retirement
                </div>
            </div>
        </div>
    )
}

export const SuccessRateGauge = memo(SuccessRateGaugeComponent)
SuccessRateGauge.displayName = 'SuccessRateGauge'
