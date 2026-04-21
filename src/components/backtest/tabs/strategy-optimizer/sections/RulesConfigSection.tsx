import React from 'react'
import type { RulesConfigSectionProps } from '../types'
import { RULES_TRIAL_OPTIONS, MAX_CONDITIONS_OPTIONS, OPTIMIZATION_OBJECTIVES } from '../constants'
import { ObjectiveTooltip } from '../components'
import { useUserLimits } from '../../../../../hooks/useUserLimits'

// Icon component for rules
const RulesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13" />
        <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
)

// Lock icon for unauthenticated state
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)

export const RulesConfigSection: React.FC<RulesConfigSectionProps> = ({
    isDark,
    strategyInfo,
    maxConditions,
    onMaxConditionsChange,
    complexityPenalty,
    onComplexityPenaltyChange,
    nTrials,
    onNTrialsChange,
    objective,
    onObjectiveChange,
    estimatedTime,
    onStart,
    isAuthenticated = true,
    onLogin
}) => {
    const limits = useUserLimits()
    const portfolioNames = strategyInfo.portfolioNames

    return (
        <div className="space-y-5">
            {/* Description */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        <RulesIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                            Automatic Rules Discovery
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Discovers optimal switching rules between your portfolios using technical indicators
                            and market conditions. Tries multiple configurations and returns the best performing strategy.
                        </p>
                    </div>
                </div>
            </div>

            {/* Portfolios to Optimize */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    Portfolios
                </h3>
                <div className="space-y-1.5">
                    {portfolioNames.map((name, idx) => (
                        <div
                            key={name}
                            className={`flex items-center gap-2.5 p-2.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                        >
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                {idx + 1}
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {name}
                            </span>
                        </div>
                    ))}
                </div>
                <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    The optimizer will determine the optimal fallback portfolio and switching rules.
                </p>
            </div>

            {/* Rule Complexity */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    Rule Complexity
                </h3>

                <div className="mb-4">
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Max Conditions (e.g., RSI &gt; 50 AND Price &gt; SMA)
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                        {MAX_CONDITIONS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onMaxConditionsChange(opt.value)}
                                className={`p-2.5 rounded text-center transition-colors border ${maxConditions === opt.value
                                    ? isDark
                                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/50'
                                        : 'bg-blue-50 text-blue-700 border-blue-300'
                                    : isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                    }`}
                            >
                                <div className="font-medium">{opt.label}</div>
                                <div className={`text-[10px] ${maxConditions === opt.value ? isDark ? 'text-blue-300/80' : 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {opt.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Complexity Penalty Slider */}
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Complexity Penalty
                        </label>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {complexityPenalty}% <span className={`font-normal text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>per condition</span>
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={complexityPenalty}
                        onChange={(e) => onComplexityPenaltyChange(Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        style={{
                            background: isDark
                                ? `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${complexityPenalty * 10}%, rgb(55, 65, 81) ${complexityPenalty * 10}%, rgb(55, 65, 81) 100%)`
                                : `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${complexityPenalty * 10}%, rgb(229, 231, 235) ${complexityPenalty * 10}%, rgb(229, 231, 235) 100%)`
                        }}
                    />
                    <div className="flex justify-between mt-1">
                        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No penalty</span>
                        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Prefer simple</span>
                    </div>
                </div>
            </div>

            {/* Optimization Settings */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    Optimization Settings
                </h3>

                {/* Objective */}
                <div className="mb-4">
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Optimization Goal
                    </label>

                    {/* Recommended objectives - top row */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {OPTIMIZATION_OBJECTIVES.filter(o => o.recommended).map(obj => (
                            <ObjectiveTooltip key={obj.value} content={obj.tooltip} isDark={isDark}>
                                <button
                                    onClick={() => onObjectiveChange(obj.value)}
                                    className={`w-full p-3 rounded-lg text-center transition-colors border ${objective === obj.value
                                        ? isDark
                                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/50'
                                            : 'bg-blue-50 text-blue-700 border-blue-300'
                                        : isDark
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span className="font-medium text-sm">{obj.label}</span>
                                        {obj.recommended && (
                                            <span className={`text-[9px] px-1 py-0.5 rounded ${isDark ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-[10px] mt-0.5 ${objective === obj.value ? isDark ? 'text-blue-300/80' : 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {obj.description}
                                    </div>
                                </button>
                            </ObjectiveTooltip>
                        ))}
                    </div>

                    {/* All other objectives */}
                    <div className="grid grid-cols-4 gap-1.5">
                        {OPTIMIZATION_OBJECTIVES.filter(o => !o.recommended).map(obj => (
                            <ObjectiveTooltip key={obj.value} content={obj.tooltip} isDark={isDark}>
                                <button
                                    onClick={() => onObjectiveChange(obj.value)}
                                    className={`w-full p-2 rounded text-center transition-colors border ${objective === obj.value
                                        ? isDark
                                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/50'
                                            : 'bg-blue-50 text-blue-700 border-blue-300'
                                        : isDark
                                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                                        }`}
                                >
                                    <div className="font-medium text-xs">{obj.label}</div>
                                </button>
                            </ObjectiveTooltip>
                        ))}
                    </div>
                </div>

                {/* Trial Count */}
                <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Number of Trials
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {RULES_TRIAL_OPTIONS.map(opt => {
                            const isOverLimit = opt.count > limits.max_rules_trials
                            return (
                            <button
                                key={opt.count}
                                onClick={() => !isOverLimit && onNTrialsChange(opt.count)}
                                disabled={isOverLimit}
                                className={`p-3 rounded-lg text-center transition-colors border ${isOverLimit
                                    ? 'opacity-40 cursor-not-allowed ' + (isDark ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-200')
                                    : nTrials === opt.count
                                    ? isDark
                                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/50'
                                        : 'bg-blue-50 text-blue-700 border-blue-300'
                                    : isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                    }`}
                            >
                                <div className="font-semibold text-base">{opt.count}</div>
                                <div className={`text-xs mt-0.5 ${isOverLimit ? isDark ? 'text-gray-600' : 'text-gray-400' : nTrials === opt.count ? isDark ? 'text-blue-300/80' : 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {opt.label}
                                </div>
                            </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <div className="space-y-2">
                <button
                    onClick={isAuthenticated ? onStart : onLogin}
                    disabled={isAuthenticated && portfolioNames.length < 2}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${!isAuthenticated
                        ? isDark
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                            : 'bg-gray-400 hover:bg-gray-500 text-white'
                        : isDark
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {!isAuthenticated && <LockIcon className="w-4 h-4" />}
                    {isAuthenticated ? 'Run Optimization' : 'Sign in to Run Optimization'}
                </button>
                <p className={`text-center text-xs flex items-center justify-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estimated time: {estimatedTime}
                </p>
            </div>
        </div>
    )
}
