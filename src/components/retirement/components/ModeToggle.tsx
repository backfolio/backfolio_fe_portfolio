import { memo } from 'react'
import type { PlannerMode } from '../types'

interface ModeToggleProps {
    mode: PlannerMode
    onChange: (mode: PlannerMode) => void
    isDark?: boolean
}

const ModeToggleComponent: React.FC<ModeToggleProps> = ({
    mode,
    onChange,
    isDark = false
}) => {

    return (
        <div className={`inline-flex rounded-2xl p-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <button
                onClick={() => onChange('check')}
                className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${mode === 'check'
                        ? isDark
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-white text-slate-900 shadow-md'
                        : isDark
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-500 hover:text-slate-900'
                    }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check My Plan
            </button>
            <button
                onClick={() => onChange('calculate')}
                className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${mode === 'calculate'
                        ? isDark
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-white text-slate-900 shadow-md'
                        : isDark
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-500 hover:text-slate-900'
                    }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Calculate My Budget
            </button>
        </div>
    )
}

export const ModeToggle = memo(ModeToggleComponent)
ModeToggle.displayName = 'ModeToggle'
