import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useDeleteStrategy } from '../../hooks/useApi'
import { runBacktest } from '../../services/api'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { DeploymentModal } from './DeploymentModal'
import { StrategyFlowPreview } from './StrategyFlowPreview'
import BacktestResultsModal from '../backtest/BacktestResultsModal'
import type { SavedBacktest } from '../../types/dashboard'
import type { BacktestResult, Strategy, CanvasState, Condition, CompositeCondition, SignalParams, AllocationWithRebalancing } from '../../types/strategy'

/**
 * Format a timestamp string into a human-readable format.
 * Handles both ISO format ("2025-11-30T01:56:56.852869") and already formatted strings ("Nov 14, 2:34 PM").
 */
const formatTimestamp = (timestamp: string): { date: string; time: string } => {
    // Check if it's already in a nice format (contains a comma and no 'T')
    if (timestamp.includes(',') && !timestamp.includes('T')) {
        const parts = timestamp.split(',')
        return {
            date: parts[0]?.trim() || timestamp,
            time: parts[1]?.trim() || ''
        }
    }

    // Parse ISO format
    try {
        const date = new Date(timestamp)
        if (isNaN(date.getTime())) {
            // Invalid date, return as-is
            return { date: timestamp, time: '' }
        }

        // Format date: "Nov 30"
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })

        // Format time: "1:56 AM"
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })

        return { date: dateStr, time: timeStr }
    } catch {
        // Fallback if parsing fails
        return { date: timestamp, time: '' }
    }
}

// ============================================================================
// CLEAN API V4.0 - BACKTEST REQUEST BUILDING
// ============================================================================

/**
 * Normalize indicator types to uppercase (SMA, EMA, RSI, HV, DD, ROC, BB, MACD).
 * The backend requires uppercase types for proper signal handling.
 */
const normalizeSignalType = (signal: SignalParams): SignalParams => {
    if (!signal || !signal.type) return signal;

    const type = signal.type;
    // Normalize indicator types to uppercase
    if (['sma', 'Sma', 'SMA'].includes(type)) {
        return { ...signal, type: 'SMA' };
    }
    if (['ema', 'Ema', 'EMA'].includes(type)) {
        return { ...signal, type: 'EMA' };
    }
    if (['rsi', 'Rsi', 'RSI'].includes(type)) {
        return { ...signal, type: 'RSI' };
    }
    if (['hv', 'Hv', 'HV'].includes(type)) {
        return { ...signal, type: 'HV' };
    }
    // TIER 1 indicators
    if (['dd', 'Dd', 'DD'].includes(type)) {
        return { ...signal, type: 'DD' };
    }
    if (['roc', 'Roc', 'ROC'].includes(type)) {
        return { ...signal, type: 'ROC' };
    }
    // TIER 2 indicators
    if (['bb', 'Bb', 'BB', 'bollingerb', 'BollingerB'].includes(type)) {
        return { ...signal, type: 'BB' };
    }
    if (['macd', 'Macd', 'MACD'].includes(type)) {
        return { ...signal, type: 'MACD' };
    }
    // Price and constant stay as-is
    return signal;
};

/**
 * Normalize all signal types in a condition (handles both simple and composite conditions)
 */
const normalizeCondition = (condition: Condition | CompositeCondition): Condition | CompositeCondition => {
    // Composite condition
    if ('op' in condition && 'conditions' in condition) {
        return {
            op: condition.op,
            conditions: condition.conditions.map(c => normalizeCondition(c as Condition | CompositeCondition))
        };
    }

    // Simple condition
    if ('left' in condition && 'right' in condition) {
        return {
            left: normalizeSignalType(condition.left),
            comparison: condition.comparison,
            right: normalizeSignalType(condition.right)
        };
    }

    return condition;
};

/**
 * CLEAN API V4.0: Build backtest request from saved strategy.
 * 
 * The new architecture embeds entry_condition directly in allocations.
 * Simply pass through allocations with their entry_conditions - no more
 * complex switching_logic reconstruction from allocation_rules.
 */
const buildBacktestRequestFromSavedStrategy = (
    strategyDsl: Strategy,
    canvasState: CanvasState | undefined,
    savedMetrics: SavedBacktest['metrics'] | undefined
) => {
    const allocationNames = Object.keys(strategyDsl.allocations || {});

    // ================================================================
    // STEP 1: Build allocation_order from canvas edges
    // ================================================================
    let allocationOrder: string[];
    const edges = canvasState?.edges || [];

    if (edges.length > 0) {
        // Build adjacency map
        const outgoingEdges = new Map<string, string>();
        const hasIncoming = new Set<string>();

        edges.forEach(edge => {
            outgoingEdges.set(edge.source, edge.target);
            hasIncoming.add(edge.target);
        });

        // Find chain start: node with outgoing edge but no incoming edge
        const chainStarts = allocationNames.filter(name =>
            outgoingEdges.has(name) && !hasIncoming.has(name)
        );

        // Walk the chain
        allocationOrder = [];
        const visited = new Set<string>();
        let current = chainStarts[0] || allocationNames.find(name => outgoingEdges.has(name)) || allocationNames[0];

        while (current && !visited.has(current)) {
            allocationOrder.push(current);
            visited.add(current);
            current = outgoingEdges.get(current) || '';
        }

        // Add any remaining allocations not in the chain
        allocationNames.forEach(name => {
            if (!allocationOrder.includes(name)) {
                allocationOrder.push(name);
            }
        });
    } else {
        // No edges - use default order
        allocationOrder = allocationNames;
    }

    // ================================================================
    // STEP 2: Build allocations - pass through with entry_conditions
    // ================================================================
    const apiAllocations: { [name: string]: AllocationWithRebalancing } = {};

    Object.entries(strategyDsl.allocations || {}).forEach(([name, rawAllocation]) => {
        // Check if allocation already has AllocationWithRebalancing structure
        const allocAny = rawAllocation as unknown as {
            allocation?: Record<string, number>;
            rebalancing_frequency?: string;
            entry_condition?: Condition | CompositeCondition;
        };

        let allocation: AllocationWithRebalancing;

        if (typeof rawAllocation === 'object' && allocAny.allocation && typeof allocAny.allocation === 'object') {
            // Already in AllocationWithRebalancing format
            allocation = {
                allocation: allocAny.allocation,
                rebalancing_frequency: (allocAny.rebalancing_frequency as AllocationWithRebalancing['rebalancing_frequency']) || 'none'
            };
            // Pass through entry_condition if present
            if (allocAny.entry_condition) {
                allocation.entry_condition = normalizeCondition(allocAny.entry_condition);
            }
        } else {
            // Simple allocation format (Record<string, number>) - wrap it
            allocation = {
                allocation: rawAllocation as unknown as Record<string, number>,
                rebalancing_frequency: 'none'
            };
        }

        apiAllocations[name] = allocation;
    });

    // ================================================================
    // STEP 3: Build config
    // ================================================================
    const config: {
        initial_capital: number;
        rebalance_frequency: string;
        start_date?: string;
        end_date?: string;
    } = {
        initial_capital: savedMetrics?.initial_capital || 10000,
        rebalance_frequency: 'daily' // Default rebalance frequency
    };

    // Use saved backtest dates if available
    if (savedMetrics?.backtest_start_date) {
        config.start_date = savedMetrics.backtest_start_date;
    }
    if (savedMetrics?.backtest_end_date) {
        config.end_date = savedMetrics.backtest_end_date;
    }

    // ================================================================
    // STEP 4: Build final payload
    // ================================================================
    const strategyPayload: {
        allocations: { [name: string]: AllocationWithRebalancing };
        fallback_allocation: string;
        allocation_order: string[];
    } = {
        allocations: apiAllocations,
        fallback_allocation: strategyDsl.fallback_allocation || '',
        allocation_order: allocationOrder
    };

    return {
        strategy: strategyPayload,
        config
    };
};

interface SavedBacktestCardProps {
    backtest: SavedBacktest
    // Optional strategy data for visual preview
    strategyDSL?: Strategy
    fallbackAllocation?: string
    canvasState?: CanvasState
}

export const SavedBacktestCard = ({ backtest, strategyDSL, fallbackAllocation, canvasState }: SavedBacktestCardProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()

    // State for modals and dialogs
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [showDeploymentModal, setShowDeploymentModal] = useState(false)
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
    const [loadingResults, setLoadingResults] = useState(false)

    // API mutations
    const deleteStrategyMutation = useDeleteStrategy()

    // Handlers
    const handleDelete = async () => {
        try {
            await deleteStrategyMutation.mutateAsync(backtest.id)
            setDeleteConfirm(false)
            // Success feedback could be added here
        } catch (error) {
            console.error('Delete failed:', error)
            // Error handling could be added here
        }
    }

    const handleViewResults = async () => {
        setLoadingResults(true)

        try {
            if (!strategyDSL) {
                throw new Error('Strategy DSL not available')
            }

            // Build proper backtest request using the same logic as the canvas page
            const backtestRequest = buildBacktestRequestFromSavedStrategy(
                strategyDSL,
                canvasState,
                backtest.metrics
            )

            // Run fresh backtest (now fast enough ~500ms)
            const result = await runBacktest(backtestRequest as any)
            setBacktestResult(result)
        } catch (error) {
            console.error('Failed to run backtest:', error)
            // Fallback: navigate to backtest page with strategy loaded via state
            navigate('/backtest', {
                state: {
                    strategyId: backtest.id,
                    strategyName: backtest.name
                }
            })
        } finally {
            setLoadingResults(false)
        }
    }

    const handleEdit = () => {
        // Navigate to backtest page with this strategy loaded for editing via navigation state
        navigate('/backtest', {
            state: {
                strategyId: backtest.id,
                strategyName: backtest.name
            }
        })
    }

    const handleViewLiveStatus = () => {
        // Navigate to deployed tab where live strategies are shown
        navigate('/portfolios?tab=deployed')
    }

    const getRiskBadge = () => {
        switch (backtest.riskLevel) {
            case 'aggressive':
                return (
                    <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${isDark
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        Aggressive
                    </span>
                )
            case 'defensive':
                return (
                    <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${isDark
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                    >
                        Defensive
                    </span>
                )
            case 'balanced':
                return (
                    <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${isDark
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-green-50 text-green-700 border border-green-200'
                            }`}
                    >
                        Balanced
                    </span>
                )
        }
    }

    return (
        <div
            className={`backdrop-blur-2xl rounded-lg p-5 transition-all duration-300 ${isDark
                ? 'bg-white/[0.02] border border-white/[0.15] hover:border-purple-500/50'
                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
        >
            <div className="flex gap-4">
                {/* Timestamp */}
                <div
                    className={`text-xs font-medium flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}
                >
                    {(() => {
                        const { date, time } = formatTimestamp(backtest.timestamp)
                        return (
                            <>
                                <div className="whitespace-nowrap">{date}</div>
                                {time && <div className="whitespace-nowrap">{time}</div>}
                            </>
                        )
                    })()}
                </div>

                {/* Left Content - Strategy Info */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3
                                className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}
                            >
                                {backtest.name}
                                {backtest.version > 1 && ` (v${backtest.version})`}
                            </h3>
                            {backtest.isDeployed && (
                                <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${isDark
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                                        }`}
                                >
                                    DEPLOYED
                                </span>
                            )}
                            {getRiskBadge()}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div
                        className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                    >
                        {/* Show CAGR as primary return metric, with total return as fallback */}
                        {backtest.cagr !== null ? (
                            <>
                                CAGR: <span className={`font-medium ${backtest.cagr >= 0
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {`${backtest.cagr >= 0 ? '+' : ''}${backtest.cagr.toFixed(1)}%`}
                                </span>
                            </>
                        ) : (
                            <>
                                Return: <span className={`font-medium ${backtest.totalReturn !== null
                                    ? backtest.totalReturn >= 0
                                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        : isDark ? 'text-red-400' : 'text-red-600'
                                    : ''
                                    }`}>
                                    {backtest.totalReturn !== null
                                        ? `${backtest.totalReturn >= 0 ? '+' : ''}${backtest.totalReturn.toFixed(1)}%`
                                        : 'Run backtest'
                                    }
                                </span>
                            </>
                        )}
                        {' • '}
                        Sharpe: <span className={`font-medium ${backtest.sharpeRatio !== null
                            ? backtest.sharpeRatio >= 1
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : backtest.sharpeRatio >= 0.5
                                    ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                            : ''
                            }`}>
                            {backtest.sharpeRatio !== null
                                ? backtest.sharpeRatio.toFixed(2)
                                : 'N/A'
                            }
                        </span>
                        {' • '}
                        Max DD: <span className={`font-medium ${backtest.maxDrawdown !== null
                            ? backtest.maxDrawdown >= -10
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : backtest.maxDrawdown >= -20
                                    ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                            : ''
                            }`}>
                            {backtest.maxDrawdown !== null
                                ? `${backtest.maxDrawdown.toFixed(1)}%`
                                : 'N/A'
                            }
                        </span>
                        {/* Show Money-Weighted Return (IRR) only if cashflows were enabled */}
                        {backtest.moneyWeightedReturn !== null && (
                            <>
                                {' • '}
                                MWR: <span className={`font-medium ${backtest.moneyWeightedReturn >= 0
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {`${backtest.moneyWeightedReturn >= 0 ? '+' : ''}${backtest.moneyWeightedReturn.toFixed(1)}%`}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        {!backtest.isDeployed ? (
                            <>
                                <button
                                    onClick={() => setShowDeploymentModal(true)}
                                    className={`py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${isDark
                                        ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
                                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                        }`}
                                >
                                    Deploy Strategy
                                </button>
                                <button
                                    onClick={() => handleViewResults()}
                                    disabled={loadingResults}
                                    className={`py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${isDark
                                        ? 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] border border-white/[0.15] disabled:opacity-50'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50'
                                        }`}
                                >
                                    {loadingResults ? 'Loading...' : 'View Results'}
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className={`py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${isDark
                                        ? 'text-gray-400 hover:text-gray-300'
                                        : 'text-gray-600 hover:text-gray-700'
                                        }`}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(true)}
                                    disabled={deleteStrategyMutation.isPending}
                                    className={`py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${isDark
                                        ? 'text-red-400 hover:text-red-300 disabled:opacity-50'
                                        : 'text-red-600 hover:text-red-700 disabled:opacity-50'
                                        }`}
                                >
                                    {deleteStrategyMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleViewLiveStatus}
                                    className={`py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${isDark
                                        ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
                                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                        }`}
                                >
                                    View in Dashboard
                                </button>
                                <button
                                    onClick={() => handleViewResults()}
                                    className={`py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${isDark
                                        ? 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] border border-white/[0.15]'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    View Backtest
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Side - Strategy Flow Visualization */}
                {strategyDSL && Object.keys(strategyDSL.allocations || {}).length > 0 ? (
                    <div className={`flex-shrink-0 hidden sm:flex items-center justify-end pl-4 border-l ${isDark ? 'border-white/10' : 'border-gray-100'
                        }`}>
                        <StrategyFlowPreview
                            strategy={strategyDSL}
                            fallbackAllocation={fallbackAllocation || strategyDSL.fallback_allocation || ''}
                            canvasPositions={canvasState?.positions}
                        />
                    </div>
                ) : (
                    <div className={`flex-shrink-0 hidden sm:flex items-center text-xs pl-4 border-l ${isDark ? 'text-gray-500 border-white/10' : 'text-gray-500 border-gray-100'
                        }`}>
                        {backtest.rules}
                    </div>
                )}
            </div>

            {/* Modals */}
            <DeploymentModal
                isOpen={showDeploymentModal}
                onClose={() => setShowDeploymentModal(false)}
                strategyId={backtest.id}
                strategyName={backtest.name}
                backtestMetrics={{
                    cagr: backtest.cagr,
                    total_return: backtest.totalReturn,
                    sharpe_ratio: backtest.sharpeRatio,
                    max_drawdown: backtest.maxDrawdown
                }}
            />

            {/* Loading Modal - rendered via portal for true viewport centering */}
            {loadingResults && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className={`rounded-2xl p-8 shadow-2xl max-w-md w-full border ${isDark
                        ? 'bg-slate-900 border-slate-700'
                        : 'bg-white border-gray-200'
                        }`}>
                        <div className="text-center">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Loading Results
                                </h2>
                            </div>

                            {/* Animated spinner */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className={`w-14 h-14 border-4 rounded-full ${isDark ? 'border-slate-700' : 'border-gray-100'
                                        }`}></div>
                                    <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {backtestResult && (
                <BacktestResultsModal
                    result={backtestResult}
                    strategy={strategyDSL as import('../../types/strategy').StrategyDSL | undefined}
                    canvasState={canvasState}
                    onClose={() => setBacktestResult(null)}
                    existingStrategyId={backtest.id}
                    existingStrategyName={backtest.name}
                />
            )}

            <ConfirmDialog
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Strategy"
                message={`Are you sure you want to delete "${backtest.name}"? This action cannot be undone.`}
                confirmText="Delete"
                danger={true}
                loading={deleteStrategyMutation.isPending}
            />
        </div>
    )
}
