import React from 'react'
import type { ProgressSectionProps } from '../types'

export const ProgressSection: React.FC<ProgressSectionProps> = ({ isDark, status, onCancel }) => {
    const progress = status?.progress || { step: 'pending', percent: 0, message: 'Starting optimization...' }

    const stages = ['Preparing', 'Optimizing', 'Validating', 'Complete']

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-8 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
            <div className="text-center space-y-6">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 mx-auto">
                    <div className={`absolute inset-0 rounded-full ${isDark ? 'border-4 border-white/10' : 'border-4 border-gray-100'}`} />
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke={isDark ? "url(#optProgressGradientDark)" : "url(#optProgressGradient)"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${progress.percent * 2.89} 289`}
                            className="transition-all duration-500 ease-out"
                        />
                        <defs>
                            <linearGradient id="optProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#9333ea" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                            <linearGradient id="optProgressGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {progress.percent}%
                        </span>
                    </div>
                </div>

                <div>
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Optimizing Allocations
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {progress.message}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className={`relative h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div
                        className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${isDark
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600'
                            }`}
                        style={{ width: `${progress.percent}%` }}
                    />
                    {/* Shimmer effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{
                            animation: 'shimmer 2s ease-in-out infinite',
                            backgroundSize: '200% 100%'
                        }}
                    />
                    <style>{`
                        @keyframes shimmer {
                            0% { background-position: 200% 0; }
                            100% { background-position: -200% 0; }
                        }
                    `}</style>
                </div>

                {/* Stage Indicators */}
                <div className="flex items-center justify-between px-4">
                    {stages.map((stage, i) => {
                        const stagePercent = i * 33
                        const isActive = progress.percent >= stagePercent
                        const isCurrent = progress.percent >= stagePercent && progress.percent < stagePercent + 33
                        return (
                            <div key={stage} className="flex flex-col items-center gap-1.5">
                                <div className={`w-3 h-3 rounded-full transition-all ${isCurrent
                                    ? isDark ? 'bg-purple-400 ring-4 ring-purple-400/20' : 'bg-purple-500 ring-4 ring-purple-500/20'
                                    : isActive
                                        ? isDark ? 'bg-purple-400/70' : 'bg-purple-500'
                                        : isDark ? 'bg-white/20' : 'bg-gray-300'
                                    }`} />
                                <span className={`text-xs font-medium ${isActive ? isDark ? 'text-gray-300' : 'text-gray-600' : isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {stage}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onCancel}
                    className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isDark
                        ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Cancel Optimization
                </button>
            </div>

            {/* What's happening - shown during loading */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/[0.08]' : 'border-gray-100'}`}>
                <h4 className={`text-xs font-semibold uppercase tracking-wide mb-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    What's Happening
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: '⚖️', text: 'Testing different asset weights' },
                        { icon: '▣', text: 'Running backtests for each trial' },
                        { icon: '○', text: 'Finding optimal allocations' },
                        { icon: '◇', text: 'Validating with Monte Carlo' }
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                            <span className="text-lg">{item.icon}</span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

