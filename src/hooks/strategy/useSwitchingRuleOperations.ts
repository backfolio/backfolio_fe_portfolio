import { useCallback, useRef, useEffect } from 'react';
import { StrategyDSL, Condition, CompositeCondition, SwitchingRule } from '../../types/strategy';

export interface UseEntryConditionOperationsReturn {
    setEntryCondition: (allocationName: string, condition: Condition | CompositeCondition) => void;
    removeEntryCondition: (allocationName: string) => void;
    updateEntryCondition: (allocationName: string, condition: Condition | CompositeCondition) => void;
    hasEntryCondition: (allocationName: string) => boolean;
    getEntryCondition: (allocationName: string) => Condition | CompositeCondition | undefined;
    // Session rule management
    addSessionRule: (rule: SwitchingRule) => void;
    removeSessionRule: (ruleName: string) => void;
    getSessionRules: () => SwitchingRule[];
}

/**
 * CLEAN API V4.0 - Entry Condition Operations
 * 
 * Manages entry_condition directly on allocations.
 * No more switching_logic or allocation_rules arrays.
 * 
 * - Each allocation can have an optional entry_condition
 * - Portfolios WITH entry_condition: selected when condition is true
 * - Portfolios WITHOUT entry_condition: "stopping point" (always selected when reached)
 */
export const useEntryConditionOperations = (
    strategy: StrategyDSL,
    updateStrategy: (s: StrategyDSL) => void
): UseEntryConditionOperationsReturn => {
    // Use a ref to always access the latest strategy
    const strategyRef = useRef(strategy);
    useEffect(() => {
        strategyRef.current = strategy;
    }, [strategy]);

    /**
     * Set or create entry_condition for an allocation
     */
    const setEntryCondition = useCallback((
        allocationName: string,
        condition: Condition | CompositeCondition
    ) => {
        const currentStrategy = strategyRef.current;
        const allocation = currentStrategy.allocations[allocationName];

        if (!allocation) {
            console.warn(`Allocation '${allocationName}' not found`);
            return;
        }

        updateStrategy({
            ...currentStrategy,
            allocations: {
                ...currentStrategy.allocations,
                [allocationName]: {
                    ...allocation,
                    entry_condition: condition
                }
            }
        });
    }, [updateStrategy]);

    /**
     * Remove entry_condition from an allocation (makes it a stopping point)
     */
    const removeEntryCondition = useCallback((allocationName: string) => {
        const currentStrategy = strategyRef.current;
        const allocation = currentStrategy.allocations[allocationName];

        if (!allocation) {
            console.warn(`Allocation '${allocationName}' not found`);
            return;
        }

        // Create new allocation without entry_condition
        const { entry_condition: _, ...allocationWithoutCondition } = allocation;

        updateStrategy({
            ...currentStrategy,
            allocations: {
                ...currentStrategy.allocations,
                [allocationName]: allocationWithoutCondition
            }
        });
    }, [updateStrategy]);

    /**
     * Update existing entry_condition (alias for setEntryCondition)
     */
    const updateEntryCondition = useCallback((
        allocationName: string,
        condition: Condition | CompositeCondition
    ) => {
        setEntryCondition(allocationName, condition);
    }, [setEntryCondition]);

    /**
     * Check if an allocation has an entry_condition
     */
    const hasEntryCondition = useCallback((allocationName: string): boolean => {
        const currentStrategy = strategyRef.current;
        const allocation = currentStrategy.allocations[allocationName];
        return allocation?.entry_condition !== undefined;
    }, []);

    /**
     * Get the entry_condition for an allocation
     */
    const getEntryCondition = useCallback((
        allocationName: string
    ): Condition | CompositeCondition | undefined => {
        const currentStrategy = strategyRef.current;
        return currentStrategy.allocations[allocationName]?.entry_condition;
    }, []);

    /**
     * Add a session-only rule (not saved to library) for reuse within this strategy
     */
    const addSessionRule = useCallback((rule: SwitchingRule) => {
        const currentStrategy = strategyRef.current;
        const existingRules = currentStrategy.session_rules || [];

        // Check if rule with this name already exists
        const existingIndex = existingRules.findIndex(r => r.name === rule.name);

        let newRules: SwitchingRule[];
        if (existingIndex >= 0) {
            // Update existing rule
            newRules = [...existingRules];
            newRules[existingIndex] = rule;
        } else {
            // Add new rule
            newRules = [...existingRules, rule];
        }

        updateStrategy({
            ...currentStrategy,
            session_rules: newRules
        });
    }, [updateStrategy]);

    /**
     * Remove a session rule by name
     */
    const removeSessionRule = useCallback((ruleName: string) => {
        const currentStrategy = strategyRef.current;
        const existingRules = currentStrategy.session_rules || [];

        updateStrategy({
            ...currentStrategy,
            session_rules: existingRules.filter(r => r.name !== ruleName)
        });
    }, [updateStrategy]);

    /**
     * Get all session rules
     */
    const getSessionRules = useCallback((): SwitchingRule[] => {
        const currentStrategy = strategyRef.current;
        return currentStrategy.session_rules || [];
    }, []);

    return {
        setEntryCondition,
        removeEntryCondition,
        updateEntryCondition,
        hasEntryCondition,
        getEntryCondition,
        addSessionRule,
        removeSessionRule,
        getSessionRules
    };
};

// Re-export with old name for gradual migration
export const useSwitchingRuleOperations = useEntryConditionOperations;
export type UseSwitchingRuleOperationsReturn = UseEntryConditionOperationsReturn;
