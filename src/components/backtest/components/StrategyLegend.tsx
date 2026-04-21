import React from 'react'
import { BacktestResult } from '../types/backtestResults'
import { STRATEGY_COLORS } from '../constants/chartColors'
import { useTheme } from '../../../context/ThemeContext'

interface StrategyLegendProps {
    results: BacktestResult[]
    visibleStrategies: boolean[]
    onToggleStrategy: (index: number) => void
}

export const StrategyLegend: React.FC<StrategyLegendProps> = ({
    results,
    visibleStrategies,
    onToggleStrategy
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    if (results.length === 1) return null

    return (
        <div className={`flex flex-wrap gap-3 mt-4 pt-4 border-t ${isDark ? 'border-white/[0.1]' : 'border-gray-200'
            }`}>
            {results.map((_r, idx) => (
                <button
                    key={idx}
                    onClick={() => onToggleStrategy(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${visibleStrategies[idx]
                        ? isDark
                            ? 'bg-white/[0.05] border-white/[0.15] opacity-100'
                            : 'bg-gray-100 border-gray-300 opacity-100'
                        : isDark
                            ? 'bg-white/[0.02] border-white/[0.05] opacity-40'
                            : 'bg-gray-50 border-gray-200 opacity-40'
                        } ${isDark ? 'hover:bg-white/[0.08]' : 'hover:bg-gray-200'}`}
                >
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: STRATEGY_COLORS[idx % STRATEGY_COLORS.length].stroke }}
                    />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Strategy {idx + 1}
                    </span>
                    {!visibleStrategies[idx] && (
                        <svg className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    )}
                </button>
            ))}
        </div>
    )
}
