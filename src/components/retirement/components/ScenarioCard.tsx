import { memo } from 'react'
import type { ScenarioCardProps, ColorVariant } from '../types'

const COLOR_CONFIG: Record<ColorVariant, (isDark: boolean) => { text: string }> = {
    emerald: (isDark) => ({
        text: isDark ? 'text-green-400' : 'text-green-600'
    }),
    amber: (isDark) => ({
        text: isDark ? 'text-amber-400' : 'text-amber-600'
    }),
    red: (isDark) => ({
        text: isDark ? 'text-red-400' : 'text-red-600'
    }),
    indigo: (isDark) => ({
        text: isDark ? 'text-white' : 'text-gray-900'
    }),
    blue: (isDark) => ({
        text: isDark ? 'text-blue-400' : 'text-blue-600'
    }),
    purple: (isDark) => ({
        text: isDark ? 'text-purple-400' : 'text-purple-600'
    }),
    cyan: (isDark) => ({
        text: isDark ? 'text-cyan-400' : 'text-cyan-600'
    })
}

const ScenarioCardComponent: React.FC<ScenarioCardProps> = ({
    title,
    subtitle,
    value,
    subValue,
    color,
    isDark,
    isHighlighted,
    icon
}) => {
    const colors = COLOR_CONFIG[color](isDark)

    return (
        <div className={`p-5 ${isHighlighted
            ? isDark ? 'bg-white/[0.03]' : 'bg-gray-50'
            : ''
            }`}>
            <div className="flex items-start gap-3">
                {icon && (
                    <div className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {icon}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                        <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {title}
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {subtitle}
                        </p>
                    </div>
                    <p className={`text-xl font-semibold tabular-nums ${colors.text}`}>
                        {value}
                    </p>
                    {subValue && (
                        <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {subValue}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export const ScenarioCard = memo(ScenarioCardComponent)
ScenarioCard.displayName = 'ScenarioCard'
