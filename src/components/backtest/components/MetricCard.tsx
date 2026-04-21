import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

interface MetricCardProps {
    icon?: React.ReactNode
    label: string
    value: string
    badge?: string
    badgeColor?: 'emerald' | 'blue' | 'purple' | 'red' | 'amber' | 'cyan' | 'indigo'
    valueColor: 'emerald' | 'blue' | 'purple' | 'red' | 'amber' | 'cyan' | 'indigo' | 'gray'
    subtext?: string
}

const colorClasses = {
    emerald: {
        light: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            hoverBg: 'group-hover:bg-emerald-100',
            iconText: 'text-emerald-600',
            badgeBg: 'bg-emerald-100',
            badgeText: 'text-emerald-700',
            badgeBorder: 'border-emerald-200',
            valueText: 'text-emerald-600'
        },
        dark: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            hoverBg: 'group-hover:bg-emerald-500/15',
            iconText: 'text-emerald-400',
            badgeBg: 'bg-emerald-500/20',
            badgeText: 'text-emerald-300',
            badgeBorder: 'border-emerald-500/30',
            valueText: 'text-emerald-400'
        }
    },
    blue: {
        light: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            hoverBg: 'group-hover:bg-blue-100',
            iconText: 'text-blue-600',
            badgeBg: 'bg-blue-100',
            badgeText: 'text-blue-700',
            badgeBorder: 'border-blue-200',
            valueText: 'text-blue-600'
        },
        dark: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            hoverBg: 'group-hover:bg-blue-500/15',
            iconText: 'text-blue-400',
            badgeBg: 'bg-blue-500/20',
            badgeText: 'text-blue-300',
            badgeBorder: 'border-blue-500/30',
            valueText: 'text-blue-400'
        }
    },
    purple: {
        light: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            hoverBg: 'group-hover:bg-purple-100',
            iconText: 'text-purple-600',
            badgeBg: 'bg-purple-100',
            badgeText: 'text-purple-700',
            badgeBorder: 'border-purple-200',
            valueText: 'text-purple-600'
        },
        dark: {
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30',
            hoverBg: 'group-hover:bg-purple-500/15',
            iconText: 'text-purple-400',
            badgeBg: 'bg-purple-500/20',
            badgeText: 'text-purple-300',
            badgeBorder: 'border-purple-500/30',
            valueText: 'text-purple-400'
        }
    },
    red: {
        light: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            hoverBg: 'group-hover:bg-red-100',
            iconText: 'text-red-600',
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-700',
            badgeBorder: 'border-red-200',
            valueText: 'text-red-600'
        },
        dark: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            hoverBg: 'group-hover:bg-red-500/15',
            iconText: 'text-red-400',
            badgeBg: 'bg-red-500/20',
            badgeText: 'text-red-300',
            badgeBorder: 'border-red-500/30',
            valueText: 'text-red-400'
        }
    },
    amber: {
        light: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            hoverBg: 'group-hover:bg-amber-100',
            iconText: 'text-amber-600',
            badgeBg: 'bg-amber-100',
            badgeText: 'text-amber-700',
            badgeBorder: 'border-amber-200',
            valueText: 'text-amber-600'
        },
        dark: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            hoverBg: 'group-hover:bg-amber-500/15',
            iconText: 'text-amber-400',
            badgeBg: 'bg-amber-500/20',
            badgeText: 'text-amber-300',
            badgeBorder: 'border-amber-500/30',
            valueText: 'text-amber-400'
        }
    },
    cyan: {
        light: {
            bg: 'bg-cyan-50',
            border: 'border-cyan-200',
            hoverBg: 'group-hover:bg-cyan-100',
            iconText: 'text-cyan-600',
            badgeBg: 'bg-cyan-100',
            badgeText: 'text-cyan-700',
            badgeBorder: 'border-cyan-200',
            valueText: 'text-cyan-600'
        },
        dark: {
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/30',
            hoverBg: 'group-hover:bg-cyan-500/15',
            iconText: 'text-cyan-400',
            badgeBg: 'bg-cyan-500/20',
            badgeText: 'text-cyan-300',
            badgeBorder: 'border-cyan-500/30',
            valueText: 'text-cyan-400'
        }
    },
    indigo: {
        light: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            hoverBg: 'group-hover:bg-indigo-100',
            iconText: 'text-indigo-600',
            badgeBg: 'bg-indigo-100',
            badgeText: 'text-indigo-700',
            badgeBorder: 'border-indigo-200',
            valueText: 'text-indigo-600'
        },
        dark: {
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/30',
            hoverBg: 'group-hover:bg-indigo-500/15',
            iconText: 'text-indigo-400',
            badgeBg: 'bg-indigo-500/20',
            badgeText: 'text-indigo-300',
            badgeBorder: 'border-indigo-500/30',
            valueText: 'text-indigo-400'
        }
    },
    gray: {
        light: {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            hoverBg: 'group-hover:bg-gray-100',
            iconText: 'text-gray-600',
            badgeBg: 'bg-gray-100',
            badgeText: 'text-gray-700',
            badgeBorder: 'border-gray-200',
            valueText: 'text-gray-900'
        },
        dark: {
            bg: 'bg-white/[0.05]',
            border: 'border-white/[0.1]',
            hoverBg: 'group-hover:bg-white/[0.08]',
            iconText: 'text-gray-400',
            badgeBg: 'bg-white/[0.1]',
            badgeText: 'text-gray-300',
            badgeBorder: 'border-white/[0.15]',
            valueText: 'text-white'
        }
    }
}

export const MetricCard: React.FC<MetricCardProps> = ({
    icon,
    label,
    value,
    badge,
    badgeColor,
    valueColor,
    subtext
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const valueColors = colorClasses[valueColor][isDark ? 'dark' : 'light']
    const iconColors = badgeColor ? colorClasses[badgeColor][isDark ? 'dark' : 'light'] : valueColors
    const badgeColors = badgeColor ? colorClasses[badgeColor][isDark ? 'dark' : 'light'] : null

    return (
        <div className={`group border transition-all duration-300 rounded-xl p-5 ${isDark
            ? 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}>
            {/* Show icon/badge only if provided */}
            {(icon || badge) && (
                <div className="flex items-start justify-between mb-3">
                    {icon && (
                        <div className={`flex items-center justify-center w-9 h-9 ${iconColors.bg} border ${iconColors.border} rounded-lg transition-all duration-300`}>
                            {icon}
                        </div>
                    )}
                    {badge && badgeColors && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${badgeColors.badgeBg} ${badgeColors.badgeText} border ${badgeColors.badgeBorder}`}>
                            {badge}
                        </span>
                    )}
                </div>
            )}
            <div className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{label}</div>
            <div className={`text-2xl font-bold tracking-tight ${valueColors.valueText}`}>
                {value}
            </div>
            {subtext && (
                <div className={`text-[11px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {subtext}
                </div>
            )}
        </div>
    )
}
