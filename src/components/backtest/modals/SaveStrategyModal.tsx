import React, { useState, useEffect } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { Strategy, StrategyDSL, BacktestResult, CanvasState, SavedStrategyMetrics } from '../../../types/strategy'
import { createStrategy, updateStrategy } from '../../../services/api'

interface SaveStrategyModalProps {
    isOpen: boolean
    onClose: () => void
    strategy: StrategyDSL
    backtestResult: BacktestResult['result']
    existingStrategyId?: string | null
    existingStrategyName?: string | null
    onSaved?: (strategyId: string, strategyName: string) => void
}

export const SaveStrategyModal: React.FC<SaveStrategyModalProps> = ({
    isOpen,
    onClose,
    strategy,
    backtestResult,
    existingStrategyId,
    existingStrategyName,
    onSaved
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const [formData, setFormData] = useState({
        name: '',
        risk_level: 'balanced' as 'defensive' | 'balanced' | 'aggressive',
        tags: '',
        notes: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Pre-populate name when editing an existing strategy
    useEffect(() => {
        if (isOpen && existingStrategyName) {
            setFormData(prev => ({ ...prev, name: existingStrategyName }))
        }
    }, [isOpen, existingStrategyName])

    // Determine if this is an update (same name as existing) or a new strategy
    const isUpdatingExisting = existingStrategyId && formData.name === existingStrategyName

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // CLEAN API V4.0: Convert StrategyDSL to Strategy format for API
            // entry_condition is embedded directly in allocations
            const apiStrategy: Strategy = {
                allocations: strategy.allocations,
                fallback_allocation: strategy.fallback_allocation,
                allocation_order: strategy.allocation_order || Object.keys(strategy.allocations)
            }

            // Build canvas state for visual layout persistence
            const canvasState: CanvasState | undefined =
                (strategy.canvas_edges && strategy.canvas_edges.length > 0) ||
                    (strategy.canvas_positions && Object.keys(strategy.canvas_positions).length > 0) ||
                    strategy.canvas_viewport
                    ? {
                        edges: strategy.canvas_edges || [],
                        positions: strategy.canvas_positions || {},
                        viewport: strategy.canvas_viewport,
                    }
                    : undefined;

            // Capture metrics from the current backtest result
            const capturedMetrics: SavedStrategyMetrics = {
                total_return: backtestResult.metrics.cumulative_return * 100, // Convert to percentage
                cagr: backtestResult.metrics.cagr * 100, // Convert to percentage
                sharpe_ratio: backtestResult.metrics.sharpe_ratio,
                sortino_ratio: backtestResult.metrics.sortino_ratio,
                max_drawdown: backtestResult.metrics.max_drawdown * 100, // Convert to percentage (will be negative)
                volatility: backtestResult.metrics.volatility * 100, // Convert to percentage
                calmar_ratio: backtestResult.metrics.calmar_ratio,
                win_rate: backtestResult.metrics.win_rate * 100, // Convert to percentage
                // Money-weighted return (IRR) from cashflow analysis - only if cashflows enabled
                money_weighted_return: backtestResult.cashflow_analysis?.money_weighted_return != null
                    ? backtestResult.cashflow_analysis.money_weighted_return * 100
                    : null,
                backtest_start_date: strategy.start_date,
                backtest_end_date: strategy.end_date,
                initial_capital: strategy.initial_capital,
                final_value: backtestResult.metrics.final_value
            }

            let savedStrategyId: string;
            let savedStrategyName: string = formData.name;

            // If updating existing strategy (same name), use PATCH; otherwise create new
            if (isUpdatingExisting && existingStrategyId) {
                // Update existing strategy with new DSL and canvas state
                const response = await updateStrategy(existingStrategyId, {
                    name: formData.name,
                    strategy_dsl: apiStrategy,
                    canvas_state: canvasState,
                    risk_level: formData.risk_level,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                    notes: formData.notes || undefined,
                    version_increment: true, // Increment version on update
                    metrics: capturedMetrics, // Include updated metrics
                })

                if (response.success) {
                    savedStrategyId = response.strategy_id
                } else {
                    throw new Error('Failed to update strategy')
                }
            } else {
                // Create new strategy
                const response = await createStrategy({
                    name: formData.name,
                    strategy_dsl: apiStrategy,
                    risk_level: formData.risk_level,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                    notes: formData.notes || undefined,
                    canvas_state: canvasState,
                    metrics: capturedMetrics, // Include captured metrics
                })

                if (response.success) {
                    savedStrategyId = response.strategy_id
                } else {
                    throw new Error('Failed to save strategy')
                }
            }

            onSaved?.(savedStrategyId, savedStrategyName)
            onClose()
            // Reset form
            setFormData({
                name: '',
                risk_level: 'balanced',
                tags: '',
                notes: ''
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save strategy')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setError(null)
        onClose()
    }

    // Auto-suggest strategy name based on performance
    const suggestName = () => {
        const sharpe = backtestResult.metrics.sharpe_ratio
        const cagr = backtestResult.metrics.cagr * 100

        let suggestion = 'My Strategy'
        if (sharpe > 1.5) suggestion = 'High Sharpe Strategy'
        else if (cagr > 15) suggestion = 'Growth Strategy'
        else if (backtestResult.metrics.max_drawdown < 0.1) suggestion = 'Low Risk Strategy'

        setFormData(prev => ({ ...prev, name: suggestion }))
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${isDark ? 'bg-black border-white/[0.15]' : 'bg-white border-gray-200'
                }`}>
                {/* Header */}
                <div className={`px-6 py-4 border-b ${isDark ? 'border-white/[0.15]' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {isUpdatingExisting ? 'Update Strategy' : 'Save Strategy'}
                            </h2>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isUpdatingExisting
                                    ? 'Update the existing strategy with your changes'
                                    : 'Save this backtest as a reusable strategy'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                        >
                            <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {/* Strategy Name */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Strategy Name *
                            </label>
                            <button
                                type="button"
                                onClick={suggestName}
                                className={`text-xs text-purple-500 hover:text-purple-400 transition-colors`}
                            >
                                Suggest name
                            </button>
                        </div>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${isDark
                                ? 'bg-white/[0.05] border-white/[0.15] text-white placeholder-gray-500 focus:border-purple-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                                } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                            placeholder="Enter strategy name"
                            required
                        />
                        {/* Helper text for save/update behavior */}
                        {existingStrategyName && (
                            <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {isUpdatingExisting
                                    ? 'Keeping the same name will update the existing strategy'
                                    : 'Changing the name will create a new strategy'}
                            </p>
                        )}
                    </div>

                    {/* Risk Level */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Risk Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['defensive', 'balanced', 'aggressive'] as const).map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, risk_level: level }))}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${formData.risk_level === level
                                        ? isDark
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : isDark
                                            ? 'bg-white/[0.05] text-gray-400 border border-white/[0.15] hover:bg-white/[0.1]'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Tags (optional)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${isDark
                                ? 'bg-white/[0.05] border-white/[0.15] text-white placeholder-gray-500 focus:border-purple-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                                } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                            placeholder="momentum, defensive, growth (comma separated)"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Notes (optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors resize-none ${isDark
                                ? 'bg-white/[0.05] border-white/[0.15] text-white placeholder-gray-500 focus:border-purple-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                                } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                            placeholder="Strategy description, rationale, or observations..."
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={`p-3 rounded-lg border text-sm ${isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
                            }`}>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark
                                ? 'bg-white/[0.02] text-gray-300 border-white/[0.15] hover:bg-white/[0.05]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.name || isLoading}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {isLoading
                                ? (isUpdatingExisting ? 'Updating...' : 'Saving...')
                                : (isUpdatingExisting ? 'Update Strategy' : 'Save Strategy')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}