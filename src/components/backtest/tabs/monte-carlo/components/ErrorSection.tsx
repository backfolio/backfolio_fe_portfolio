import React from 'react'
import type { ErrorSectionProps } from '../types'

export const ErrorSection: React.FC<ErrorSectionProps> = ({ isDark, error, onRetry }) => (
    <div className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-10 text-center shadow-sm ${
        isDark 
            ? 'bg-white/[0.02] border-white/[0.08]' 
            : 'bg-white border-gray-200'
    }`}>
        {/* Subtle red gradient background */}
        <div className={`absolute inset-0 ${
            isDark 
                ? 'bg-gradient-to-br from-red-500/[0.02] via-transparent to-orange-500/[0.02]' 
                : 'bg-gradient-to-br from-red-50/30 via-transparent to-orange-50/30'
        }`} />
        
        <div className="relative">
            {/* Error icon with glow */}
            <div className="relative w-20 h-20 mx-auto mb-5">
                <div className={`absolute inset-0 rounded-2xl blur-xl ${
                    isDark ? 'bg-red-500/20' : 'bg-red-200/50'
                }`} />
                <div className={`relative w-full h-full rounded-2xl flex items-center justify-center ${
                    isDark 
                        ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30' 
                        : 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-200'
                }`}>
                    <svg className={`w-9 h-9 ${isDark ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Simulation Failed
            </h3>
            
            {/* Error message box */}
            <div className={`max-w-md mx-auto p-4 rounded-xl border mb-6 ${
                isDark 
                    ? 'bg-red-500/[0.05] border-red-500/20' 
                    : 'bg-red-50/70 border-red-200'
            }`}>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    {error}
                </p>
            </div>
            
            {/* Retry button */}
            <button
                onClick={onRetry}
                className={`group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isDark
                        ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.1] hover:border-white/[0.15]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                }`}
            >
                <svg className="w-4 h-4 transition-transform group-hover:-rotate-45 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
            </button>
            
            {/* Help text */}
            <p className={`text-xs mt-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                If the problem persists, try with fewer simulations or a shorter projection period.
            </p>
        </div>
    </div>
)
