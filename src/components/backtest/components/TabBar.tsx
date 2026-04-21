import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { TabType } from '../types/backtestResults'

interface TabBarProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}

const tabs = [
    { id: 'overview' as const, label: 'Summary' },
    { id: 'charts' as const, label: 'Charts' },
    { id: 'returns' as const, label: 'Returns' },
    { id: 'analytics' as const, label: 'Analytics' },
    { id: 'allocations' as const, label: 'Allocations' },
    { id: 'live_status' as const, label: 'Live Status', accent: 'blue' as const },
    { id: 'monte_carlo' as const, label: 'Monte Carlo', accent: 'purple' as const },
    { id: 'insights' as const, label: 'Optimizer', accent: 'emerald' as const }
]

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const getTabStyles = (tab: typeof tabs[0], isActive: boolean) => {
        const accent = 'accent' in tab ? tab.accent : null

        if (isActive) {
            if (accent === 'purple') {
                return isDark
                    ? 'text-purple-300 border-purple-500'
                    : 'text-purple-700 border-purple-600'
            }
            if (accent === 'emerald') {
                return isDark
                    ? 'text-emerald-300 border-emerald-500'
                    : 'text-emerald-700 border-emerald-600'
            }
            if (accent === 'blue') {
                return isDark
                    ? 'text-blue-300 border-blue-500'
                    : 'text-blue-700 border-blue-600'
            }
            return isDark
                ? 'text-white border-blue-500'
                : 'text-gray-900 border-blue-600'
        }

        // Inactive state with accent colors
        if (accent === 'purple') {
            return isDark
                ? 'text-purple-400/70 hover:text-purple-300 border-transparent'
                : 'text-purple-600/70 hover:text-purple-700 border-transparent'
        }
        if (accent === 'emerald') {
            return isDark
                ? 'text-emerald-400/70 hover:text-emerald-300 border-transparent'
                : 'text-emerald-600/70 hover:text-emerald-700 border-transparent'
        }
        if (accent === 'blue') {
            return isDark
                ? 'text-blue-400/70 hover:text-blue-300 border-transparent'
                : 'text-blue-600/70 hover:text-blue-700 border-transparent'
        }

        return isDark
            ? 'text-gray-500 hover:text-gray-300 border-transparent'
            : 'text-gray-500 hover:text-gray-700 border-transparent'
    }

    return (
        <div className={`border-b flex-shrink-0 ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide px-4 md:px-8">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`px-4 md:px-5 py-3 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 border-b-2 ${getTabStyles(tab, isActive)}`}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
