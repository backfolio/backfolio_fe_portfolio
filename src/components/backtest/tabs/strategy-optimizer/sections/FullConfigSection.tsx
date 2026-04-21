import React from 'react'
import type { OptimizationObjective } from '../../../../../types/strategy'
import type { StrategyInfo } from '../types'
import { RULES_TRIAL_OPTIONS, ALLOCATIONS_TRIAL_OPTIONS, MAX_CONDITIONS_OPTIONS, OPTIMIZATION_OBJECTIVES } from '../constants'
import { ObjectiveTooltip } from '../components'
import { useUserLimits } from '../../../../../hooks/useUserLimits'

// Icon component for full optimization
const FullOptimizationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
    </svg>
)

// Lock icon for unauthenticated state
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)

export interface FullConfigSectionProps {
    isDark: boolean
    strategyInfo: StrategyInfo
    // Rules config
    maxConditions: 1 | 2 | 3 | 4 | 5
    onMaxConditionsChange: (n: 1 | 2 | 3 | 4 | 5) => void
    complexityPenalty: number
    onComplexityPenaltyChange: (p: number) => void
    rulesTrials: number
    onRulesTrialsChange: (n: number) => void
    // Allocations config
    allocationsTrials: number
    onAllocationsTrialsChange: (n: number) => void
    // Common
    objective: OptimizationObjective
    onObjectiveChange: (obj: OptimizationObjective) => void
    estimatedTime: string
    onStart: () => void
    isAuthenticated?: boolean
    onLogin?: () => void
}

export const FullConfigSection: React.FC<FullConfigSectionProps> = ({
    isDark,
    strategyInfo,
    maxConditions,
    onMaxConditionsChange,
    complexityPenalty,
    onComplexityPenaltyChange,
    rulesTrials,
    onRulesTrialsChange,
    allocationsTrials,
    onAllocationsTrialsChange,
    objective,
    onObjectiveChange,
    estimatedTime,
    onStart,
    isAuthenticated = true,
    onLogin
}) => {
    const limits = useUserLimits()
    const portfolioNames = strategyInfo.portfolioNames
    const hasMultiAssetPortfolio = strategyInfo.hasMultipleAssets

    return (
        <div className="space-y-5">
            {/* Description */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        <FullOptimizationIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                            Full Strategy Optimization
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Two-phase optimization: First discovers switching rules, then optimizes allocation weights.
                        </p>
                        <div className="mt-2 flex gap-4">
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium mr-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>1</span>
                                Rules Discovery
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium mr-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>2</span>
                                Allocation Optimization
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Your Portfolios */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    Portfolios
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
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
                {!hasMultiAssetPortfolio && (
                    <p className={`text-xs mt-3 px-3 py-2 rounded ${isDark ? 'bg-amber-500/10 text-amber-200/80 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        Note: Phase 2 (allocation optimization) will be skipped since your portfolios are single-asset.
                    </p>
                )}
            </div>

            {/* Phase 1: Rules Discovery Settings */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        1
                    </div>
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        Rules Discovery
                    </h3>
                </div>

                {/* Max Conditions */}
                <div className="mb-4">
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Max Conditions Per Rule
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                        {MAX_CONDITIONS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onMaxConditionsChange(opt.value)}
                                className={`p-2 rounded text-center transition-colors border ${maxConditions === opt.value
                                    ? isDark
                                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/50'
                                        : 'bg-blue-50 text-blue-700 border-blue-300'
                                    : isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                    }`}
                            >
                                <div className="font-medium text-sm">{opt.label}</div>
                                <div className={`text-[10px] ${maxConditions === opt.value ? isDark ? 'text-blue-300/80' : 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {opt.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Complexity Penalty */}
                <div className="mb-4">
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
                </div>

                {/* Rules Trials */}
                <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Number of Trials
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                        {RULES_TRIAL_OPTIONS.map(opt => {
                            const isOverLimit = opt.count > limits.max_rules_trials
                            return (
                            <button
                                key={opt.count}
                                onClick={() => !isOverLimit && onRulesTrialsChange(opt.count)}
                                disabled={isOverLimit}
                                className={`p-2.5 rounded text-center transition-colors border ${isOverLimit
                                    ? 'opacity-40 cursor-not-allowed ' + (isDark ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-200')
                                    : rulesTrials === opt.count
                                    ? isDark
                                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/50'
                                        : 'bg-blue-50 text-blue-700 border-blue-300'
                                    : isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                    }`}
                            >
                                <div className="font-semibold">{opt.count}</div>
                                <div className={`text-[10px] ${isOverLimit ? isDark ? 'text-gray-600' : 'text-gray-400' : rulesTrials === opt.count ? isDark ? 'text-blue-300/80' : 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {opt.label}
                                </div>
                            </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Phase 2: Allocation Optimization Settings */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'} ${!hasMultiAssetPortfolio ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        2
                    </div>
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        Allocation Optimization
                        {!hasMultiAssetPortfolio && (
                            <span className={`ml-2 text-xs font-normal ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>(skipped)</span>
                        )}
                    </h3>
                </div>

                {/* Allocations Trials */}
                <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Number of Trials
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {ALLOCATIONS_TRIAL_OPTIONS.map(opt => {
                            const isOverLimit = opt.count > limits.max_allocations_trials
                            const isDisabled = isOverLimit || !hasMultiAssetPortfolio
                            return (
                            <button
                                key={opt.count}
                                onClick={() => !isDisabled && onAllocationsTrialsChange(opt.count)}
                                disabled={isDisabled}
                                className={`p-2.5 rounded text-center transition-colors border ${isOverLimit
                                    ? 'opacity-40 cursor-not-allowed ' + (isDark ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-200')
                                    : !hasMultiAssetPortfolio
                                    ? 'opacity-50 cursor-not-allowed ' + (isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200')
                                    : allocationsTrials === opt.count
                                    ? isDark
                                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/50'
                                        : 'bg-blue-50 text-blue-700 border-blue-300'
                                    : isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                    }`}
                            >
                                <div className="font-semibold">{opt.count}</div>
                                <div className={`text-[10px] ${isOverLimit ? isDark ? 'text-gray-600' : 'text-gray-400' : allocationsTrials === opt.count ? isDark ? 'text-blue-300/80' : 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {opt.label}
                                </div>
                            </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Common: Objective */}
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    Optimization Goal
                </h3>

                {/* Recommended objectives */}
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

                {/* Other objectives */}
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

