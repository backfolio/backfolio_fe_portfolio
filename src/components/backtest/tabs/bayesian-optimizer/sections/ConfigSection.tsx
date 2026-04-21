import React from 'react'
import type { ConfigSectionProps } from '../types'
import { OPTIMIZATION_TRIAL_OPTIONS, OPTIMIZATION_OBJECTIVES } from '../constants'
import { ObjectiveTooltip } from '../components'
import { useUserLimits } from '../../../../../hooks/useUserLimits'

export const ConfigSection: React.FC<ConfigSectionProps> = ({
    isDark,
    optimizationTrials,
    onOptimizationTrialsChange,
    optimizationObjective,
    onOptimizationObjectiveChange,
    estimatedTime,
    onStart
}) => {
    const limits = useUserLimits()

    return (
        <div className="space-y-6">

            {/* What does the optimizer do? */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-slate-900'}`}>
                            How Does the Optimizer Work?
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            The optimizer uses AI to find better <strong>asset allocation weights</strong> for your portfolios.
                            For example, a 60/40 split could become 80/20 or even 100/0. It uses full historical data for training and validates results with Monte Carlo simulation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Optimization Settings */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <h3 className={`font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Optimization Settings
                </h3>

                {/* Objective */}
                <div className="mb-6">
                    <label className={`block text-xs font-medium uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Optimize For <span className={`font-normal normal-case ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>(hover for details)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {OPTIMIZATION_OBJECTIVES.map(obj => (
                            <ObjectiveTooltip key={obj.value} content={obj.tooltip} isDark={isDark}>
                                <button
                                    onClick={() => onOptimizationObjectiveChange(obj.value)}
                                    className={`w-full p-3 rounded-xl text-center transition-all duration-200 border-2 relative ${optimizationObjective === obj.value
                                        ? isDark
                                            ? 'bg-emerald-500/10 text-white border-emerald-500 shadow-lg shadow-emerald-500/10'
                                            : 'bg-emerald-50 text-emerald-900 border-emerald-500 shadow-lg shadow-emerald-500/20'
                                        : obj.recommended
                                            ? isDark
                                                ? 'bg-white/[0.03] text-gray-200 hover:bg-white/[0.06] border-white/10'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                            : isDark
                                                ? 'bg-white/[0.02] text-gray-300 hover:bg-white/[0.05] border-white/10'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                        }`}
                                >
                                    {obj.recommended && optimizationObjective !== obj.value && (
                                        <span className={`absolute -top-1.5 -right-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${isDark ? 'bg-emerald-500/90 text-white' : 'bg-emerald-500 text-white'}`}>
                                            REC
                                        </span>
                                    )}
                                    <div className="font-bold text-sm">{obj.label}</div>
                                    <div className={`text-[10px] mt-0.5 ${optimizationObjective === obj.value ? isDark ? 'text-emerald-300' : 'text-emerald-600' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {obj.description}
                                    </div>
                                </button>
                            </ObjectiveTooltip>
                        ))}
                    </div>
                </div>

                {/* Trial Count */}
                <div>
                    <label className={`block text-xs font-medium uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Number of Trials
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {OPTIMIZATION_TRIAL_OPTIONS.map(opt => {
                            const isOverLimit = opt.count > limits.max_allocations_trials
                            return (
                            <button
                                key={opt.count}
                                onClick={() => !isOverLimit && onOptimizationTrialsChange(opt.count)}
                                disabled={isOverLimit}
                                className={`p-4 rounded-xl text-center transition-all duration-200 border-2 ${isOverLimit
                                    ? 'opacity-40 cursor-not-allowed ' + (isDark ? 'bg-white/[0.01] text-gray-500 border-white/5' : 'bg-gray-100 text-gray-400 border-gray-200')
                                    : optimizationTrials === opt.count
                                    ? isDark
                                        ? 'bg-emerald-500/10 text-white border-emerald-500 shadow-lg shadow-emerald-500/10'
                                        : 'bg-emerald-50 text-emerald-900 border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : isDark
                                        ? 'bg-white/[0.02] text-gray-300 hover:bg-white/[0.05] border-white/10'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                    }`}
                            >
                                <div className="font-bold text-lg">{opt.count}</div>
                                <div className={`text-xs mt-1 ${isOverLimit ? isDark ? 'text-gray-600' : 'text-gray-400' : optimizationTrials === opt.count ? isDark ? 'text-emerald-300' : 'text-emerald-600' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {opt.label} • {opt.description}
                                </div>
                            </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Start Button - at bottom */}
            <div className="space-y-2">
                <button
                    onClick={onStart}
                    className={`w-full py-4 px-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-3 text-white ${isDark
                        ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 border border-purple-500/50 shadow-purple-500/20'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Optimize Allocations ({optimizationTrials} trials)
                </button>
                <p className={`text-center text-xs flex items-center justify-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estimated time: {estimatedTime}
                </p>
            </div>
        </div>
    )
}

