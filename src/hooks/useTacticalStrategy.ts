import { StrategyDSL } from '../types/strategy';
import { DEFAULT_DSL } from '../constants/strategy';
import {
    useStrategyState,
    useAllocationOperations,
    useSwitchingRuleOperations,
    useStrategyValidation,
    useBacktestBuilder
} from './strategy';

/**
 * Composable hook for tactical investment strategy management.
 * 
 * Composes smaller, focused hooks:
 * - useStrategyState: Core state management with debounced JSON parsing
 * - useAllocationOperations: Allocation CRUD operations
 * - useSwitchingRuleOperations: Switching rule CRUD operations
 * - useStrategyValidation: Validation logic
 * - useBacktestBuilder: API request building
 */
export const useTacticalStrategy = (defaultStrategy: StrategyDSL = DEFAULT_DSL) => {
    // Core state management (with debounced JSON parsing via useDeferredValue)
    const state = useStrategyState(defaultStrategy);

    // Allocation CRUD operations
    const allocations = useAllocationOperations(
        state.strategy,
        state.updateStrategy,
        state.setNewAllocationName,
        state.setShowNewAllocationForm
    );

    // Switching rule CRUD operations
    const rules = useSwitchingRuleOperations(
        state.strategy,
        state.updateStrategy
    );

    // Validation logic (with memoized results)
    const validation = useStrategyValidation(state.strategy);

    // API request building
    const backtest = useBacktestBuilder(state.strategy, state.backtestConfig);

    return {
        // State
        dslText: state.dslText,
        strategy: state.strategy,
        activeTab: state.activeTab,
        showNewAllocationForm: state.showNewAllocationForm,
        newAllocationName: state.newAllocationName,
        backtestConfig: state.backtestConfig,
        strategyLoadVersion: state.strategyLoadVersion,

        // Setters
        setActiveTab: state.setActiveTab,
        setShowNewAllocationForm: state.setShowNewAllocationForm,
        setNewAllocationName: state.setNewAllocationName,
        setBacktestConfig: state.setBacktestConfig,

        // Handlers
        handleDslChange: state.handleDslChange,
        updateStrategy: state.updateStrategy,
        resetStrategy: state.resetStrategy,
        loadStrategyFromTemplate: state.loadStrategyFromTemplate,
        formatJSON: state.formatJSON,

        // Allocation operations
        addAllocation: allocations.addAllocation,
        addAllocationWithAssets: allocations.addAllocationWithAssets,
        deleteAllocation: allocations.deleteAllocation,
        duplicateAllocation: allocations.duplicateAllocation,
        renameAllocation: allocations.renameAllocation,
        updateAllocation: allocations.updateAllocation,
        removeSymbolFromAllocation: allocations.removeSymbolFromAllocation,

        // Entry condition operations (CLEAN API V4.0)
        setEntryCondition: rules.setEntryCondition,
        removeEntryCondition: rules.removeEntryCondition,
        updateEntryCondition: rules.updateEntryCondition,
        hasEntryCondition: rules.hasEntryCondition,
        getEntryCondition: rules.getEntryCondition,

        // Session rule management
        addSessionRule: rules.addSessionRule,
        removeSessionRule: rules.removeSessionRule,
        getSessionRules: rules.getSessionRules,

        // Validation
        validateStrategy: validation.validateStrategy,
        isValid: validation.isValid,
        hasDisconnectedChains: validation.hasDisconnectedChains,

        // API integration
        buildBacktestRequest: backtest.buildBacktestRequest
    };
};

// Re-export individual hooks for granular usage
export {
    useStrategyState,
    useAllocationOperations,
    useSwitchingRuleOperations,
    useStrategyValidation,
    useBacktestBuilder
} from './strategy';

// Re-export utility functions
export {
    normalizeStrategy,
    calculateDisconnectedChains,
    generateUniqueName
} from './strategy';
