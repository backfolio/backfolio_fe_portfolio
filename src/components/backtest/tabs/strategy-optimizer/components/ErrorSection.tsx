import React from 'react'
import type { ErrorSectionProps } from '../types'

export const ErrorSection: React.FC<ErrorSectionProps> = ({ isDark, error, onRetry }) => (
    <div className={`border rounded-lg p-6 text-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`w-10 h-10 mx-auto rounded flex items-center justify-center mb-3 ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            Optimization Failed
        </h3>
        <div className={`p-3 rounded border mb-4 ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                {error}
            </p>
        </div>
        <button
            onClick={onRetry}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
        >
            Try Again
        </button>
    </div>
)

