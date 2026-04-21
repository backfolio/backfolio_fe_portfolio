// Re-export from bayesian-optimizer module for backwards compatibility
// The component is now modularized in the bayesian-optimizer/ folder

export { AIInsightsTab } from './bayesian-optimizer'
export type {
    AIInsightsTabProps,
    ViewState,
    OptimizationObjective,
    OptimizerPersistedState,
    CanvasState
} from './bayesian-optimizer'
