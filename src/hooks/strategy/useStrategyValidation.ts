import { useCallback, useMemo } from 'react';
import { StrategyDSL } from '../../types/strategy';
import { calculateDisconnectedChains } from './strategyUtils';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface UseStrategyValidationReturn {
    validateStrategy: () => ValidationResult;
    isValid: boolean;
    hasDisconnectedChains: (edges: Array<{ source: string; target: string }>) => boolean;
}

/**
 * CLEAN API V4.0: Strategy validation logic.
 * - entry_condition is embedded directly in allocations
 * - No more switching_logic or allocation_rules to validate separately
 */
export const useStrategyValidation = (strategy: StrategyDSL): UseStrategyValidationReturn => {

    /**
     * Comprehensive validation function returning detailed errors.
     */
    const validateStrategy = useCallback((): ValidationResult => {
        const errors: string[] = [];
        const allocationGroups = Object.keys(strategy.allocations);

        if (allocationGroups.length === 0) {
            errors.push('No allocations defined');
            return { valid: false, errors };
        }

        allocationGroups.forEach(groupName => {
            const allocationWithRebalancing = strategy.allocations[groupName];
            const allocation = allocationWithRebalancing.allocation;
            const symbols = Object.keys(allocation);

            if (symbols.length === 0) {
                errors.push(`${groupName}: No symbols defined`);
                return;
            }

            // Check for empty symbol names
            const hasInvalidSymbols = symbols.some(symbol => symbol.trim().length === 0);
            if (hasInvalidSymbols) {
                errors.push(`${groupName}: Contains empty symbol names`);
            }

            // Check weights sum to 100%
            const total = symbols.reduce((sum, symbol) => sum + allocation[symbol], 0);
            if (Math.abs(total - 1.0) >= 0.001) {
                errors.push(`${groupName}: Weights sum to ${(total * 100).toFixed(1)}%, should be 100%`);
            }
        });

        // Check fallback allocation exists
        if (!allocationGroups.includes(strategy.fallback_allocation)) {
            errors.push('Fallback allocation does not exist');
        }

        return { valid: errors.length === 0, errors };
    }, [strategy]);

    /**
     * Memoized boolean for simple validity checks.
     */
    const isValid = useMemo(() => validateStrategy().valid, [validateStrategy]);

    /**
     * Check for disconnected chains in the graph.
     */
    const hasDisconnectedChains = useCallback((edges: Array<{ source: string; target: string }>) => {
        return calculateDisconnectedChains(edges, strategy.allocations);
    }, [strategy.allocations]);

    return {
        validateStrategy,
        isValid,
        hasDisconnectedChains
    };
};
