// Monte Carlo Types and Interfaces

import type { MonteCarloResults, BacktestResult, StrategyDSL } from '../../../../types/strategy'

export interface MonteCarloTabProps {
    result: BacktestResult
    strategyName?: string
    strategyDsl?: StrategyDSL
}

export type ViewState = 'config' | 'progress' | 'results' | 'error'

export interface MCProgress {
    step: string
    percent: number
    message: string
}

export type CashflowFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null

export interface CashflowConfig {
    enabled: boolean
    amount: number
    frequency: CashflowFrequency
}

export interface ConfigSectionProps {
    isDark: boolean
    simulations: number
    onSimulationsChange: (n: number) => void
    projectionYears: number
    onProjectionYearsChange: (n: number) => void
    estimatedTime: string
    onStart: () => void
    isAuthenticated?: boolean
    onLogin?: () => void
    // Initial capital configuration
    initialCapital: number
    onInitialCapitalChange: (amount: number) => void
    defaultInitialCapital?: number  // From backtest result, shown as placeholder
    // Cashflow configuration
    cashflowConfig?: CashflowConfig
    onCashflowConfigChange?: (config: CashflowConfig) => void
}

export interface ProgressSectionProps {
    isDark: boolean
    progress: MCProgress
    onCancel: () => void
}

export interface ResultsSectionProps {
    isDark: boolean
    results: MonteCarloResults
    summary?: { headline: string; verdict: string; key_insights: string[] }
    onReset: () => void
}

export interface ErrorSectionProps {
    isDark: boolean
    error: string
    onRetry: () => void
}

export interface MetricCardProps {
    isDark: boolean
    label: string
    value: string
    subtext: string
    color: 'emerald' | 'red' | 'amber' | 'purple' | 'blue'
}

export interface AnalysisItemProps {
    isDark: boolean
    icon: React.ReactNode
    text: string
    color: 'emerald' | 'amber' | 'red' | 'purple' | 'blue' | 'cyan'
}

// Chart Props
export interface PortfolioDistributionChartProps {
    isDark: boolean
    distribution: { bins: number[]; bin_edges: number[] }
    initialCapital: number
    medianValue: number
    p10Value: number
    p90Value: number
    totalSimulations: number
}

export interface PathPercentilesData {
    percentiles: {
        p5: number[]
        p10: number[]
        p25: number[]
        p50: number[]
        p75: number[]
        p90: number[]
        p95: number[]
    }
    time_labels: string[]
    num_points: number
    initial_capital: number
    sample_paths?: number[][]
}

export interface PortfolioFanChartProps {
    isDark: boolean
    pathData: PathPercentilesData
    years: number
}

export interface InteractiveDistributionCurveProps {
    isDark: boolean
    p10: number
    median: number
    p90: number
    years: number
    initialCapital: number
    hoveredScenario: string | null
    setHoveredScenario: (scenario: string | null) => void
}

export interface CAGRDistributionBarChartProps {
    isDark: boolean
    distribution: { bins: number[]; bin_edges: number[] }
    p10: number
    median: number
    p90: number
    totalSimulations: number
    hoveredScenario: string | null
}

export interface AnnualReturnExpectationsProps {
    isDark: boolean
    p10: number
    median: number
    p90: number
    years: number
    initialCapital?: number
    cagrDistribution?: { bins: number[]; bin_edges: number[] }
    totalSimulations?: number
}

export type ReturnViewMode = 'cagr' | 'total' | 'value'

// Curve data point type
export interface CurvePoint {
    cagr: number
    cagrPercent: number
    probability: number
    percentile: number
    totalReturn: number
    finalValue: number
    isP10: boolean
    isMedian: boolean
    isP90: boolean
    isNegative: boolean
}

