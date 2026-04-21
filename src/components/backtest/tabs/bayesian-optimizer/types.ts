// AI Insights / Optimizer Types and Interfaces

import type { OptimizerStatusResponse, OptimizationResults, BacktestResult, StrategyDSL } from '../../../../types/strategy'

export interface CanvasState {
    edges: Array<{ source: string; target: string }>
    positions: { [key: string]: { x: number; y: number } }
    viewport?: { x: number; y: number; zoom: number }
}

// Persisted state interface (lifted to parent for tab switch persistence)
export interface OptimizerPersistedState {
    view: ViewState
    status: OptimizerStatusResponse | null
    error: string | null
}

export interface AIInsightsTabProps {
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

export type ViewState = 'config' | 'progress' | 'results' | 'error'

export type OptimizationObjective = 'sortino' | 'risk_adjusted_cagr' | 'calmar' | 'cagr_sqrt_dd' | 'balanced' | 'sharpe'

export interface OptimizerProgress {
    step: string
    percent: number
    message: string
}

// Section Props
export interface ConfigSectionProps {
    isDark: boolean
    optimizationTrials: number
    onOptimizationTrialsChange: (n: number) => void
    optimizationObjective: OptimizationObjective
    onOptimizationObjectiveChange: (obj: OptimizationObjective) => void
    estimatedTime: string
    onStart: () => void
}

export interface ProgressSectionProps {
    isDark: boolean
    status: OptimizerStatusResponse | null
    onCancel: () => void
}

export interface ResultsSectionProps {
    isDark: boolean
    results: OptimizationResults
    originalStrategy?: Record<string, any>
    canvasState?: CanvasState
    onReset: () => void
    onLoadStrategy?: (dsl: Record<string, any>) => void
}

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

