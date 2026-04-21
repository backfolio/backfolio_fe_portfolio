// Strategy hooks - modular, composable hooks for strategy management
export { useStrategyState } from './useStrategyState';
export type { UseStrategyStateReturn } from './useStrategyState';

export { useAllocationOperations } from './useAllocationOperations';
export type { UseAllocationOperationsReturn } from './useAllocationOperations';

export { useSwitchingRuleOperations } from './useSwitchingRuleOperations';
export type { UseSwitchingRuleOperationsReturn } from './useSwitchingRuleOperations';

export { useStrategyValidation } from './useStrategyValidation';
export type { UseStrategyValidationReturn, ValidationResult } from './useStrategyValidation';

export { useBacktestBuilder } from './useBacktestBuilder';
export type { UseBacktestBuilderReturn, BacktestRequest } from './useBacktestBuilder';

// Utility functions
export {
    normalizeStrategy,
    calculateDisconnectedChains,
    generateUniqueName
} from './strategyUtils';
