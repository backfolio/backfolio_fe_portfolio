import React from 'react'
import type { ModeSelectorProps, OptimizerMode } from '../types'
import { MODE_INFO } from '../constants'

// SVG Icons for each mode - professional and clean
const ModeIcons: Record<OptimizerMode, React.FC<{ className?: string }>> = {
    allocations: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="18" rx="1" />
            <rect x="14" y="8" width="7" height="13" rx="1" />
        </svg>
    ),
    rules: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
            <circle cx="3" cy="6" r="1" fill="currentColor" />
            <circle cx="3" cy="12" r="1" fill="currentColor" />
            <circle cx="3" cy="18" r="1" fill="currentColor" />
        </svg>
    ),
    full: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>
    )
}

// Info icon for tooltips
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </svg>
)

// Lock icon for disabled modes
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
)

export const ModeSelector: React.FC<ModeSelectorProps> = ({
    isDark,
    selectedMode,
    onModeChange,
    strategyInfo
}) => {
    const modes: OptimizerMode[] = ['allocations', 'rules', 'full']

    const getModeDisabledReason = (mode: OptimizerMode): string | null => {
        switch (mode) {
            case 'allocations':
                if (!strategyInfo.canOptimizeAllocations) {
                    return 'Requires portfolio with 2+ assets'
                }
                break
            case 'rules':
                if (!strategyInfo.canOptimizeRules) {
                    return 'Requires 2+ portfolios'
                }
                break
            case 'full':
                if (!strategyInfo.canOptimizeAllocations && !strategyInfo.canOptimizeRules) {
                    return 'Requires 2+ portfolios with multi-asset allocation'
                }
                if (!strategyInfo.canOptimizeAllocations) {
                    return 'Requires at least one portfolio with 2+ assets'
                }
                if (!strategyInfo.canOptimizeRules) {
                    return 'Requires 2+ portfolios'
                }
                break
        }
        return null
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Optimization Mode
                </h3>
                {strategyInfo.recommendation && strategyInfo.canOptimizeAllocations && strategyInfo.canOptimizeRules && (
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Recommended: {MODE_INFO[strategyInfo.recommendedMode].title}
                    </span>
                )}
            </div>

            {/* Mode Options - Radio-style selection */}
            <div className={`border rounded-lg divide-y ${isDark
                ? 'border-gray-700 divide-gray-700 bg-gray-800/50'
                : 'border-gray-200 divide-gray-200 bg-white'
                }`}>
                {modes.map(mode => {
                    const info = MODE_INFO[mode]
                    const isSelected = selectedMode === mode
                    const disabledReason = getModeDisabledReason(mode)
                    const isDisabled = !!disabledReason
                    const isRecommended = strategyInfo.recommendedMode === mode && !isDisabled
                    const Icon = ModeIcons[mode]

                    return (
                        <label
                            key={mode}
                            className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${isDisabled
                                ? 'opacity-50 cursor-not-allowed'
                                : isSelected
                                    ? isDark
                                        ? 'bg-blue-500/10'
                                        : 'bg-blue-50'
                                    : isDark
                                        ? 'hover:bg-gray-700/50'
                                        : 'hover:bg-gray-50'
                                }`}
                        >
                            {/* Radio button */}
                            <div className="pt-0.5">
                                <input
                                    type="radio"
                                    name="optimization-mode"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => !isDisabled && onModeChange(mode)}
                                    className={`w-4 h-4 ${isDark
                                        ? 'text-blue-500 bg-gray-700 border-gray-600'
                                        : 'text-blue-600 bg-white border-gray-300'
                                        } focus:ring-blue-500 focus:ring-offset-0`}
                                />
                            </div>

                            {/* Icon */}
                            <div className={`flex-shrink-0 w-5 h-5 mt-0.5 ${isDisabled
                                ? isDark ? 'text-gray-600' : 'text-gray-300'
                                : isSelected
                                    ? isDark ? 'text-blue-400' : 'text-blue-600'
                                    : isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                <Icon className="w-full h-full" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${isDisabled
                                        ? isDark ? 'text-gray-500' : 'text-gray-400'
                                        : isDark ? 'text-gray-100' : 'text-gray-900'
                                        }`}>
                                        {info.title}
                                    </span>
                                    {isRecommended && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isDark
                                            ? 'bg-blue-500/20 text-blue-300'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            Recommended
                                        </span>
                                    )}
                                    {isDisabled && (
                                        <LockIcon className={`w-3.5 h-3.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                                    )}
                                </div>
                                <p className={`text-xs mt-0.5 ${isDisabled
                                    ? isDark ? 'text-gray-600' : 'text-gray-400'
                                    : isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    {info.shortDescription}
                                </p>
                                {isDisabled && disabledReason && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-amber-500/70' : 'text-amber-600'
                                        }`}>
                                        {disabledReason}
                                    </p>
                                )}
                            </div>
                        </label>
                    )
                })}
            </div>

            {/* Selected Mode Details */}
            <div className={`text-xs p-4 rounded-lg border ${isDark
                ? 'bg-gray-800/30 border-gray-700/50 text-gray-400'
                : 'bg-gray-50 border-gray-100 text-gray-600'
                }`}>
                <div className="flex items-start gap-2">
                    <InfoIcon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                    <div className="space-y-1">
                        <p>{MODE_INFO[selectedMode].longDescription}</p>
                        <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                            <span className="font-medium">Best for:</span> {MODE_INFO[selectedMode].bestFor}
                        </p>
                    </div>
                </div>
            </div>

            {/* Strategy Status - Only show when relevant */}
            {(strategyInfo.numPortfolios === 1 || !strategyInfo.hasMultipleAssets) && (
                <div className={`text-xs p-3 rounded-lg border ${isDark
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-200/80'
                    : 'bg-amber-50 border-amber-100 text-amber-700'
                    }`}>
                    <p className="font-medium mb-1">Strategy Configuration</p>
                    <p className={isDark ? 'text-amber-200/60' : 'text-amber-600'}>
                        {strategyInfo.numPortfolios === 1 && !strategyInfo.hasMultipleAssets ? (
                            <>Current strategy has 1 portfolio with a single asset. Add another portfolio to enable switching rules, or add multiple assets to enable weight optimization.</>
                        ) : strategyInfo.numPortfolios === 1 ? (
                            <>Current strategy has 1 portfolio. Add another portfolio to enable switching rules optimization.</>
                        ) : (
                            <>Current portfolios each have a single asset. Add multiple assets to at least one portfolio to enable weight optimization.</>
                        )}
                    </p>
                </div>
            )}
        </div>
    )
}
