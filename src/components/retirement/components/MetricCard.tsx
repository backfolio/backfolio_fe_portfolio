import { memo } from 'react'
import type { MetricCardProps, ColorVariant } from '../types'

const COLOR_CONFIG: Record<ColorVariant, (isDark: boolean) => { text: string; border: string }> = {
    emerald: (isDark) => ({
        text: isDark ? 'text-green-400' : 'text-green-600',
        border: isDark ? 'border-l-green-400' : 'border-l-green-500'
    }),
    blue: (isDark) => ({
        text: isDark ? 'text-blue-400' : 'text-blue-600',
        border: isDark ? 'border-l-blue-400' : 'border-l-blue-500'
    }),
    purple: (isDark) => ({
        text: isDark ? 'text-purple-400' : 'text-purple-600',
        border: isDark ? 'border-l-purple-400' : 'border-l-purple-500'
    }),
    amber: (isDark) => ({
        text: isDark ? 'text-amber-400' : 'text-amber-600',
        border: isDark ? 'border-l-amber-400' : 'border-l-amber-500'
    }),
    red: (isDark) => ({
        text: isDark ? 'text-red-400' : 'text-red-600',
        border: isDark ? 'border-l-red-400' : 'border-l-red-500'
    }),
    cyan: (isDark) => ({
        text: isDark ? 'text-cyan-400' : 'text-cyan-600',
        border: isDark ? 'border-l-cyan-400' : 'border-l-cyan-500'
    }),
    indigo: (isDark) => ({
        text: isDark ? 'text-indigo-400' : 'text-indigo-600',
        border: isDark ? 'border-l-indigo-400' : 'border-l-indigo-500'
    })
}

const MetricCardComponent: React.FC<MetricCardProps> = ({
    label,
    value,
    subtext,
    color,
    isDark,
    icon
}) => {
    const colors = COLOR_CONFIG[color](isDark)

    return (
        <div className={`border border-l-2 rounded-lg p-4 ${isDark
            ? 'bg-white/[0.02] border-white/[0.06]'
            : 'bg-white border-gray-200'
            } ${colors.border}`}>
            <div className="flex items-start gap-3">
                {icon && (
                    <div className={`flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {icon}
                    </div>
                )}
                <div className="min-w-0">
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {label}
                    </p>
                    <p className={`text-xl font-semibold tabular-nums ${colors.text}`}>
                        {value}
                    </p>
                    {subtext && (
                        <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {subtext}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export const MetricCard = memo(MetricCardComponent)
MetricCard.displayName = 'MetricCard'
