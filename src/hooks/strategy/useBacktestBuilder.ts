import { useCallback } from 'react';
import { StrategyDSL, BacktestConfig, AllocationWithRebalancing, SignalParams, Condition, CompositeCondition } from '../../types/strategy';

/**
 * Normalize indicator types to uppercase (SMA, EMA, RSI, HV).
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
 * CLEAN API CONTRACT V4.0
 * 
 * The new architecture embeds entry_condition directly in allocations.
 * No more separate switching_logic or allocation_rules arrays.
 * 
 * Linked-list semantics:
 * - allocation_order defines traversal order: [A, B, C] means A → B → C
 * - Each allocation can have an optional entry_condition
 * - If entry_condition exists and evaluates true → select this portfolio
 * - If entry_condition is absent → this is a "stopping point" (always selected when reached)
 * - Traverse in order, stop at first portfolio that "passes"
 */
export interface BacktestRequest {
    strategy: {
        // Allocations with embedded entry_condition
        allocations: { [name: string]: AllocationWithRebalancing };
        // Last resort if chain evaluation fails
        fallback_allocation: string;
        // Linked-list traversal order - determines evaluation priority
        allocation_order: string[];
        // Cashflow system
        cashflow_amount?: number | null;
        cashflow_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | null;
    };
    config: {
        initial_capital: number;
        rebalance_frequency: string;
        start_date?: string;
        end_date?: string;
        signal_delay?: 0 | 1 | 2;
    };
}

export interface UseBacktestBuilderReturn {
    buildBacktestRequest: (nodePositions?: Map<string, { x: number; y: number }>) => BacktestRequest;
}

/**
 * CLEAN API V4.0 - Builds the backtest request payload.
 * 
 * Simply passes through allocations with their embedded entry_conditions.
 * The frontend editing model now matches the API model directly.
 */
export const useBacktestBuilder = (
    strategy: StrategyDSL,
    backtestConfig: BacktestConfig
): UseBacktestBuilderReturn => {

    const buildBacktestRequest = useCallback((nodePositions?: Map<string, { x: number; y: number }>): BacktestRequest => {
        const allocationNames = Object.keys(strategy.allocations);
        
        // ================================================================
        // STEP 1: Build allocation_order from canvas edges
        // ================================================================
        let allocationOrder: string[];
        const edges = strategy.canvas_edges || [];

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
        } else if (strategy.allocation_order && strategy.allocation_order.length > 0) {
            // Use existing allocation_order if available
            allocationOrder = [...strategy.allocation_order];
            // Add any missing allocations
            allocationNames.forEach(name => {
                if (!allocationOrder.includes(name)) {
                    allocationOrder.push(name);
                }
            });
        } else {
            // No edges - use x-position sorting or default order
            if (nodePositions && nodePositions.size > 0) {
                allocationOrder = allocationNames
                    .filter(name => nodePositions.has(name))
                    .sort((a, b) => nodePositions.get(a)!.x - nodePositions.get(b)!.x);

                allocationNames.forEach(name => {
                    if (!allocationOrder.includes(name)) {
                        allocationOrder.push(name);
                    }
                });
            } else if (strategy.canvas_positions && Object.keys(strategy.canvas_positions).length > 0) {
                allocationOrder = allocationNames
                    .filter(name => strategy.canvas_positions?.[name])
                    .sort((a, b) => strategy.canvas_positions![a].x - strategy.canvas_positions![b].x);

                allocationNames.forEach(name => {
                    if (!allocationOrder.includes(name)) {
                        allocationOrder.push(name);
                    }
                });
            } else {
                allocationOrder = allocationNames;
            }
        }

        // ================================================================
        // STEP 2: Build allocations - pass through with normalized entry_conditions
        // ================================================================
        const apiAllocations: { [name: string]: AllocationWithRebalancing } = {};

        Object.entries(strategy.allocations).forEach(([name, allocWithRebalancing]) => {
            const allocation: AllocationWithRebalancing = {
                allocation: allocWithRebalancing.allocation,
                rebalancing_frequency: allocWithRebalancing.rebalancing_frequency || 'none'
            };

            // Pass through entry_condition if present (normalize signal types)
            if (allocWithRebalancing.entry_condition) {
                allocation.entry_condition = normalizeCondition(allocWithRebalancing.entry_condition);
            }

            apiAllocations[name] = allocation;
        });

        // ================================================================
        // STEP 3: Build config
        // ================================================================
        const config: BacktestRequest['config'] = {
            initial_capital: strategy.initial_capital,
            rebalance_frequency: backtestConfig.rebalance_frequency || 'daily'
        };

        if (strategy.start_date && strategy.start_date.trim()) {
            config.start_date = strategy.start_date;
        }
        if (strategy.end_date && strategy.end_date.trim()) {
            config.end_date = strategy.end_date;
        }
        if (strategy.signal_delay !== undefined && strategy.signal_delay !== null) {
            config.signal_delay = strategy.signal_delay;
        }

        // ================================================================
        // STEP 4: Build final payload
        // ================================================================
        const strategyPayload: BacktestRequest['strategy'] = {
            allocations: apiAllocations,
            fallback_allocation: strategy.fallback_allocation,
            allocation_order: allocationOrder
        };

        // Include cashflow fields only if configured
        if (strategy.cashflow_amount !== null && strategy.cashflow_amount !== undefined && strategy.cashflow_frequency) {
            strategyPayload.cashflow_amount = strategy.cashflow_amount;
            strategyPayload.cashflow_frequency = strategy.cashflow_frequency;
        }

        return {
            strategy: strategyPayload,
            config
        };
    }, [strategy, backtestConfig]);

    return {
        buildBacktestRequest
    };
};
