import React, { useState, useEffect } from 'react'
import type { ProgressSectionProps } from '../types'

export const ProgressSection: React.FC<ProgressSectionProps> = ({ isDark, progress, onCancel }) => {
    const stages = ['Preparing', 'Simulating', 'Analyzing', 'Complete']

    // Smooth progress interpolation for fluid animations
    const [displayedPercent, setDisplayedPercent] = useState(progress.percent)

    useEffect(() => {
        const targetPercent = progress.percent

        // Animate towards target percent smoothly
        const animate = () => {
            setDisplayedPercent(current => {
                const diff = targetPercent - current
                // If we're very close, snap to target
                if (Math.abs(diff) < 0.5) return targetPercent
                // Ease towards target (faster when further away)
                const step = diff * 0.15
                return current + step
            })
        }

        // Run animation at 60fps
        const intervalId = setInterval(animate, 16)

        return () => clearInterval(intervalId)
    }, [progress.percent])

    const getCurrentStage = (percent: number) => {
        if (percent >= 100) return 3
        if (percent >= 66) return 2
        if (percent >= 33) return 1
        return 0
    }

    const currentStage = getCurrentStage(displayedPercent)

    return (
        <div className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-8 shadow-sm ${
            isDark 
                ? 'bg-white/[0.02] border-white/[0.08]' 
                : 'bg-white border-gray-200'
        }`}>
            {/* Animated background glow */}
            <div className={`absolute inset-0 ${
                isDark 
                    ? 'bg-gradient-to-br from-purple-500/[0.03] via-transparent to-indigo-500/[0.03]' 
                    : 'bg-gradient-to-br from-purple-50/30 via-transparent to-indigo-50/30'
            }`} />
            
            {/* Animated pulse effect behind progress */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl animate-pulse ${
                isDark ? 'bg-purple-500/10' : 'bg-purple-200/30'
            }`} />

            <div className="relative text-center space-y-8">
                {/* Circular Progress - Premium Design */}
                <div className="relative w-32 h-32 mx-auto">
                    {/* Outer glow ring */}
                    <div className={`absolute inset-0 rounded-full blur-md ${
                        isDark ? 'bg-purple-500/20' : 'bg-purple-300/30'
                    }`} />
                    
                    {/* Background track */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
                            strokeWidth="6"
                        />
                    </svg>
                    
                    {/* Progress arc */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="mcProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={isDark ? '#a855f7' : '#9333ea'} />
                                <stop offset="50%" stopColor={isDark ? '#818cf8' : '#6366f1'} />
                                <stop offset="100%" stopColor={isDark ? '#6366f1' : '#4f46e5'} />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#mcProgressGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${displayedPercent * 2.64} 264`}
                            className="transition-none"
                            style={{
                                filter: isDark ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))' : 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.3))'
                            }}
                        />
                    </svg>
                    
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold tabular-nums tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round(displayedPercent)}
                        </span>
                        <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            percent
                        </span>
                    </div>
                </div>

                {/* Title and Message */}
                <div>
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Running Monte Carlo Simulation
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {progress.message}
                    </p>
                </div>

                {/* Linear Progress Bar - Premium */}
                <div className={`relative h-2 rounded-full overflow-hidden ${
                    isDark ? 'bg-white/[0.05]' : 'bg-gray-100'
                }`}>
                    <div
                        className="absolute inset-y-0 left-0 rounded-full transition-none"
                        style={{
                            width: `${displayedPercent}%`,
                            background: isDark 
                                ? 'linear-gradient(90deg, #a855f7, #818cf8, #6366f1)' 
                                : 'linear-gradient(90deg, #9333ea, #6366f1, #4f46e5)',
                            boxShadow: isDark 
                                ? '0 0 20px rgba(139, 92, 246ظ 0.5)' 
                                : '0 0 15px rgba(139, 92, 246, 0.3)'
                        }}
                    />
                    {/* Shimmer effect */}
                    <div 
                        className="absolute inset-y-0 left-0 rounded-full transition-none overflow-hidden"
                        style={{ width: `${displayedPercent}%` }}
                    >
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                </div>

                {/* Stage Indicators - Premium Pills */}
                <div className="flex items-center justify-between gap-2 px-4">
                    {stages.map((stage, i) => {
                        const isActive = i <= currentStage
                        const isCurrent = i === currentStage && displayedPercent < 100

                        return (
                            <div key={stage} className="flex flex-col items-center gap-2.5 flex-1">
                                <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 ${
                                    isCurrent
                                        ? isDark 
                                            ? 'bg-purple-500/20 ring-2 ring-purple-500/40 border border-purple-500/30' 
                                            : 'bg-purple-100 ring-2 ring-purple-300 border border-purple-200'
                                        : isActive
                                            ? isDark 
                                                ? 'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30' 
                                                : 'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25'
                                            : isDark 
                                                ? 'bg-white/[0.03] border border-white/[0.08]' 
                                                : 'bg-gray-100 border border-gray-200'
                                }`}>
                                    {isActive && !isCurrent ? (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : isCurrent ? (
                                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                                            isDark ? 'bg-purple-400' : 'bg-purple-500'
                                        }`} />
                                    ) : (
                                        <span className={`text-sm font-semibold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {i + 1}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-xs font-medium transition-colors ${
                                    isActive
                                        ? isDark ? 'text-gray-200' : 'text-gray-700'
                                        : isDark ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                    {stage}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Cancel Button - Subtle */}
                <button
                    onClick={onCancel}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isDark
                            ? 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-gray-300 border border-white/[0.08] hover:border-white/[0.12]'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200 hover:border-gray-300'
                    }`}
                >
                    Cancel Simulation
                </button>
            </div>
            
            {/* Add shimmer animation keyframes via style tag */}
            <style>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    )
}
