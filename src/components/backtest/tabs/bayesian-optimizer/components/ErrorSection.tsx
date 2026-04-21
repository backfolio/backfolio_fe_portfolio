import React from 'react'
import type { ErrorSectionProps } from '../types'

export const ErrorSection: React.FC<ErrorSectionProps> = ({ isDark, error, onRetry }) => (
    <div className={`backdrop-blur-xl border rounded-2xl p-8 shadow-sm text-center ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
            <svg className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Optimization Failed
        </h3>
        <div className={`p-4 rounded-xl border mb-6 ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                {error}
            </p>
        </div>
        <button
            onClick={onRetry}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isDark
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
        >
            Try Again
        </button>
    </div>
)

