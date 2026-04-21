import React from 'react'
import type { AnalysisItemProps } from '../types'

export const AnalysisItem: React.FC<AnalysisItemProps> = ({ isDark, icon, text, color }) => {
    const colorClasses = {
        emerald: {
            bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
            icon: isDark ? 'text-emerald-400' : 'text-emerald-600',
            border: isDark ? 'border-emerald-500/20' : 'border-emerald-200'
        },
        amber: {
            bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
            icon: isDark ? 'text-amber-400' : 'text-amber-600',
            border: isDark ? 'border-amber-500/20' : 'border-amber-200'
        },
        red: {
            bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
            icon: isDark ? 'text-red-400' : 'text-red-600',
            border: isDark ? 'border-red-500/20' : 'border-red-200'
        },
        purple: {
            bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
            icon: isDark ? 'text-purple-400' : 'text-purple-600',
            border: isDark ? 'border-purple-500/20' : 'border-purple-200'
        },
        blue: {
            bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
            icon: isDark ? 'text-blue-400' : 'text-blue-600',
            border: isDark ? 'border-blue-500/20' : 'border-blue-200'
        },
        cyan: {
            bg: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50',
            icon: isDark ? 'text-cyan-400' : 'text-cyan-600',
            border: isDark ? 'border-cyan-500/20' : 'border-cyan-200'
        }
    }

    const colors = colorClasses[color]

    return (
        <div className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
            isDark 
                ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]' 
                : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100/70 hover:border-gray-300'
        }`}>
            <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${colors.bg} ${colors.border} ${colors.icon}`}>
                {icon}
            </div>
            <span className={`text-sm font-medium transition-colors ${
                isDark 
                    ? 'text-gray-300 group-hover:text-gray-200' 
                    : 'text-gray-600 group-hover:text-gray-800'
            }`}>
                {text}
            </span>
        </div>
    )
}
