import { memo } from 'react'
import type { LoadingSectionProps } from '../types'

const LoadingSectionComponent: React.FC<LoadingSectionProps> = ({ isDark, totalYears }) => {
    return (
        <div className={`border rounded-xl p-10 text-center ${isDark
            ? 'bg-white/[0.02] border-white/[0.08]'
            : 'bg-white border-gray-200'
            }`}>
            {/* Loading indicator */}
            <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6">
                <div
                    className={`absolute inset-0 rounded-full border-2 ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}
                />
                <div
                    className={`absolute inset-0 rounded-full border-2 border-t-current border-r-transparent border-b-transparent border-l-transparent animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                    style={{ animationDuration: '1s' }}
                />
                <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>

            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Running Simulation
            </h3>
            <p className={`text-sm mb-6 max-w-sm mx-auto ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Generating 100 Monte Carlo scenarios across a {totalYears}-year projection period.
            </p>

            {/* Status indicators */}
            <div className={`inline-flex items-center gap-4 px-4 py-2 rounded-lg text-xs ${isDark ? 'bg-white/[0.02] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200'
                }`}>
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-purple-400' : 'bg-purple-500'}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Processing scenarios
                    </span>
                </div>
            </div>
        </div>
    )
}

export const LoadingSection = memo(LoadingSectionComponent)
LoadingSection.displayName = 'LoadingSection'
