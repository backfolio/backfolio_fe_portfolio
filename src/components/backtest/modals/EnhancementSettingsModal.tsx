import React, { useState } from 'react'

interface EnhancementSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onEnhance: (metrics: string[]) => void
    isDark?: boolean
}

const AVAILABLE_METRICS = [
    { id: 'return', label: 'Returns (ROI/CAGR)', description: 'Maximize portfolio returns' },
    { id: 'sharpe', label: 'Sharpe Ratio', description: 'Improve risk-adjusted returns' },
    { id: 'drawdown', label: 'Drawdown', description: 'Reduce maximum loss from peak' },
    { id: 'volatility', label: 'Volatility', description: 'Reduce portfolio fluctuations' },
]

export const EnhancementSettingsModal: React.FC<EnhancementSettingsModalProps> = ({
    isOpen,
    onClose,
    onEnhance,
    isDark = false
}) => {
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])

    if (!isOpen) return null

    const toggleMetric = (metricId: string) => {
        setSelectedMetrics(prev =>
            prev.includes(metricId)
                ? prev.filter(m => m !== metricId)
                : [...prev, metricId]
        )
    }

    const handleEnhance = () => {
        onEnhance(selectedMetrics)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-lg ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 ${isDark ? 'border-white/10' : 'border-gray-200'} border-b`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                            <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                AI Enhancement Settings
                            </h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Select metrics to prioritize
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1.5 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                    >
                        <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Info */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border`}>
                        <p className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-900'}`}>
                            Select one or more metrics to prioritize. If no metrics are selected, the AI will optimize for overall performance balance.
                        </p>
                    </div>

                    {/* Metrics Selection */}
                    <div className="space-y-2">
                        {AVAILABLE_METRICS.map(metric => (
                            <button
                                key={metric.id}
                                onClick={() => toggleMetric(metric.id)}
                                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                    selectedMetrics.includes(metric.id)
                                        ? isDark
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-purple-500 bg-purple-50'
                                        : isDark
                                        ? 'border-white/10 hover:border-white/20 bg-white/5'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        selectedMetrics.includes(metric.id)
                                            ? isDark
                                                ? 'border-purple-500 bg-purple-500'
                                                : 'border-purple-600 bg-purple-600'
                                            : isDark
                                            ? 'border-white/30'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedMetrics.includes(metric.id) && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {metric.label}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {metric.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Selected Count */}
                    {selectedMetrics.length > 0 && (
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between gap-3 px-6 py-4 ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-gray-50'} border-t rounded-b-2xl`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            isDark
                                ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleEnhance}
                        className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                            isDark
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                        } flex items-center gap-2`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {selectedMetrics.length > 0 ? 'Enhance Strategy' : 'Enhance (Auto)'}
                    </button>
                </div>
            </div>
        </div>
    )
}
