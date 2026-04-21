import React from 'react'
import type { MetricCardProps } from '../types'

export const MetricCard: React.FC<MetricCardProps> = ({ isDark, label, value, subtext, color }) => {
    const colorConfig = {
        emerald: {
            text: isDark ? 'text-emerald-400' : 'text-emerald-600',
            accent: isDark ? 'bg-emerald-500' : 'bg-emerald-500',
            glow: isDark ? 'bg-emerald-500/10' : 'bg-emerald-100/50',
            iconBg: isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'
        },
        red: {
            text: isDark ? 'text-red-400' : 'text-red-600',
            accent: isDark ? 'bg-red-500' : 'bg-red-500',
            glow: isDark ? 'bg-red-500/10' : 'bg-red-100/50',
            iconBg: isDark ? 'bg-red-500/15' : 'bg-red-50'
        },
        amber: {
            text: isDark ? 'text-amber-400' : 'text-amber-600',
            accent: isDark ? 'bg-amber-500' : 'bg-amber-500',
            glow: isDark ? 'bg-amber-500/10' : 'bg-amber-100/50',
            iconBg: isDark ? 'bg-amber-500/15' : 'bg-amber-50'
        },
        purple: {
            text: isDark ? 'text-purple-400' : 'text-purple-600',
            accent: isDark ? 'bg-purple-500' : 'bg-purple-500',
            glow: isDark ? 'bg-purple-500/10' : 'bg-purple-100/50',
            iconBg: isDark ? 'bg-purple-500/15' : 'bg-purple-50'
        },
        blue: {
            text: isDark ? 'text-blue-400' : 'text-blue-600',
            accent: isDark ? 'bg-blue-500' : 'bg-blue-500',
            glow: isDark ? 'bg-blue-500/10' : 'bg-blue-100/50',
            iconBg: isDark ? 'bg-blue-500/15' : 'bg-blue-50'
        }
    }

    const colors = colorConfig[color]

    return (
        <div className={`relative overflow-hidden backdrop-blur-xl border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${
            isDark 
                ? 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.12]' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}>
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${colors.accent}`} />
            
            {/* Subtle corner glow */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl ${colors.glow}`} />
            
            <div className="relative">
                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {label}
                </p>
                <p className={`text-2xl font-bold tracking-tight ${colors.text}`}>
                    {value}
                </p>
                <p className={`text-[11px] mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {subtext}
                </p>
            </div>
        </div>
    )
}
