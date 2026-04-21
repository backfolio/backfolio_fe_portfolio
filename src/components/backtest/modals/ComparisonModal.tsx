import React from 'react'

interface MetricComparison {
    roi: number
    cagr: number
    sharpe: number
    drawdown: number
    volatility: number
}

interface ComparisonModalProps {
    isOpen: boolean
    onClose: () => void
    originalMetrics: MetricComparison
    optimizedMetrics: MetricComparison
    explanation: string
    optimizationMethod: 'ai' | 'algorithmic'
    onAccept: () => void
    isDark?: boolean
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
    isOpen,
    onClose,
    originalMetrics,
    optimizedMetrics,
    explanation,
    optimizationMethod,
    onAccept,
    isDark = false
}) => {
    if (!isOpen) return null

    const metrics = [
        { key: 'roi' as keyof MetricComparison, label: 'ROI', suffix: '%', decimals: 2 },
        { key: 'cagr' as keyof MetricComparison, label: 'CAGR', suffix: '%', decimals: 2 },
        { key: 'sharpe' as keyof MetricComparison, label: 'Sharpe Ratio', suffix: '', decimals: 3 },
        { key: 'drawdown' as keyof MetricComparison, label: 'Max Drawdown', suffix: '%', decimals: 2, lowerIsBetter: true },
        { key: 'volatility' as keyof MetricComparison, label: 'Volatility', suffix: '%', decimals: 2, lowerIsBetter: true }
    ]

    const getMetricColor = (oldVal: number, newVal: number, lowerIsBetter = false) => {
        const diff = newVal - oldVal
        const isImprovement = lowerIsBetter ? diff < 0 : diff > 0
        
        if (Math.abs(diff) < 0.01) {
            return isDark ? 'text-gray-400' : 'text-gray-600'
        }
        
        if (isImprovement) {
            return isDark ? 'text-green-400' : 'text-green-600'
        } else {
            return isDark ? 'text-red-400' : 'text-red-600'
        }
    }

    const getChangeIndicator = (oldVal: number, newVal: number, lowerIsBetter = false) => {
        const diff = newVal - oldVal
        
        if (Math.abs(diff) < 0.01) return { text: '—', color: 'gray' }
        
        const isImprovement = lowerIsBetter ? diff < 0 : diff > 0
        return { 
            text: isImprovement ? 'Better' : 'Worse', 
            color: isImprovement ? 'emerald' : 'red' 
        }
    }

    const methodBadge = optimizationMethod === 'ai' ? 'AI Enhanced' : 'Algorithm Enhanced'

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className={`w-full max-w-4xl ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 ${isDark ? 'border-white/10' : 'border-gray-200'} border-b`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                            <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Strategy Optimization Results
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {methodBadge}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                    >
                        <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Explanation */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border`}>
                        <p className={`text-sm whitespace-pre-line ${isDark ? 'text-purple-200' : 'text-purple-900'}`}>
                            {explanation}
                        </p>
                    </div>

                    {/* Metrics Comparison */}
                    <div>
                        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Performance Comparison
                        </h4>
                        <div className="space-y-3">
                            {metrics.map(({ key, label, suffix, decimals, lowerIsBetter }) => {
                                const oldVal = originalMetrics[key]
                                const newVal = optimizedMetrics[key]
                                const color = getMetricColor(oldVal, newVal, lowerIsBetter)
                                const indicator = getChangeIndicator(oldVal, newVal, lowerIsBetter)

                                return (
                                    <div 
                                        key={key}
                                        className={`p-4 rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {label}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {oldVal.toFixed(decimals)}{suffix}
                                                </span>
                                                <svg className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                <span className={`font-semibold ${color}`}>
                                                    {newVal.toFixed(decimals)}{suffix}
                                                </span>
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded min-w-[50px] text-center ${
                                                    indicator.color === 'emerald' 
                                                        ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                                        : indicator.color === 'red'
                                                            ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                                                            : isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {indicator.text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-end gap-3 px-6 py-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'} border-t`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        }`}
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all"
                    >
                        Use Optimized Strategy
                    </button>
                </div>
            </div>
        </div>
    )
}
