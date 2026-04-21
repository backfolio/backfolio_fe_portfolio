// Strategy Optimizer Types and Interfaces
// Unified optimizer supporting: allocations, rules, or both

import type {
    OptimizerStatusResponse,
    OptimizationResults,
    BacktestResult,
    StrategyDSL,
    RulesOptimizerStatusResponse,
    RulesOptimizerResults,
    OptimizationObjective,
} from '../../../../types/strategy'

// Optimization mode types
export type OptimizerMode = 'allocations' | 'rules' | 'full';
export type ViewState = 'config' | 'progress' | 'results' | 'error';

// Canvas state for preserving layout
export interface CanvasState {
    edges: Array<{ source: string; target: string }>
    positions: { [key: string]: { x: number; y: number } }
    viewport?: { x: number; y: number; zoom: number }
}

// Persisted state interface (for tab switch persistence)
export interface OptimizerPersistedState {
    view: ViewState
    mode: OptimizerMode
    allocationsStatus: OptimizerStatusResponse | null
    rulesStatus: RulesOptimizerStatusResponse | null
    error: string | null
}

// Main tab props
export interface StrategyOptimizerTabProps {
    result: BacktestResult
    strategyId?: string | null
    strategyName?: string
    strategyDsl?: StrategyDSL | Record<string, any>
    originalStrategy?: Record<string, any>
    canvasState?: CanvasState
    onLoadStrategy?: (dsl: Record<string, any>) => void
    persistedState?: OptimizerPersistedState
    onStateChange?: (state: OptimizerPersistedState) => void
}

// Mode selector props
export interface ModeSelectorProps {
    isDark: boolean
    selectedMode: OptimizerMode
    onModeChange: (mode: OptimizerMode) => void
    strategyInfo: StrategyInfo
}

// Strategy analysis info (for smart mode detection)
export interface StrategyInfo {
    numPortfolios: number
    portfolioNames: string[]
    hasMultipleAssets: boolean  // At least one portfolio has 2+ assets
    hasSwitchingLogic: boolean
    canOptimizeAllocations: boolean
    canOptimizeRules: boolean
    recommendedMode: OptimizerMode
    recommendation: string
}

// Section Props - Allocations
export interface AllocationsConfigSectionProps {
    isDark: boolean
    optimizationTrials: number
    onOptimizationTrialsChange: (n: number) => void
    optimizationObjective: OptimizationObjective
    onOptimizationObjectiveChange: (obj: OptimizationObjective) => void
    estimatedTime: string
    onStart: () => void
    isAuthenticated?: boolean
    onLogin?: () => void
}

export interface AllocationsResultsSectionProps {
    isDark: boolean
    results: OptimizationResults
    originalStrategy?: Record<string, any>
    canvasState?: CanvasState
    onReset: () => void
    onLoadStrategy?: (dsl: Record<string, any>) => void
}

// Section Props - Rules (Auto mode - simplified)
export interface RulesConfigSectionProps {
    isDark: boolean
    strategyInfo: StrategyInfo
    // Optimization options
    maxConditions: 1 | 2 | 3 | 4 | 5
    onMaxConditionsChange: (n: 1 | 2 | 3 | 4 | 5) => void
    complexityPenalty: number  // 0-10% penalty per additional condition
    onComplexityPenaltyChange: (p: number) => void
    nTrials: number
    onNTrialsChange: (n: number) => void
    objective: OptimizationObjective
    onObjectiveChange: (obj: OptimizationObjective) => void
    estimatedTime: string
    onStart: () => void
    isAuthenticated?: boolean
    onLogin?: () => void
}

export interface RulesResultsSectionProps {
    isDark: boolean
    results: RulesOptimizerResults
    originalStrategy?: Record<string, any>
    canvasState?: CanvasState
    onReset: () => void
    onLoadStrategy?: (dsl: Record<string, any>) => void
}

// Shared progress section props
export interface ProgressSectionProps {
    isDark: boolean
    mode: OptimizerMode
    allocationsStatus: OptimizerStatusResponse | null
    rulesStatus: RulesOptimizerStatusResponse | null
    onCancel: () => void
}

// Error section props
export interface ErrorSectionProps {
    isDark: boolean
    error: string
    onRetry: () => void
}

// Component Props
export interface ObjectiveTooltipProps {
    children: React.ReactNode
    content: string
    isDark: boolean
}

export interface ObjectiveOption {
    value: OptimizationObjective
    label: string
    description: string
    recommended: boolean
    tooltip: string
}

export interface TrialOption {
    count: number
    label: string
    description: string
}

export interface ConditionOption {
    value: 1 | 2 | 3 | 4 | 5
    label: string
    description: string
}

