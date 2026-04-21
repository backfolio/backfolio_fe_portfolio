// Backtest API Result Types
// Import standard types from strategy.ts to avoid duplication
import type { BacktestResult, StrategyDSL } from '../../../types/strategy'

// Re-export BacktestResult for components that import from here
export type { BacktestResult } from '../../../types/strategy'

// Modal props interface
export interface BacktestResultsModalProps {
    result: BacktestResult | null
    onClose: () => void
    strategy?: StrategyDSL // Optional for backward compatibility - uses DSL format from frontend
    onOptimizedStrategy?: (optimizedStrategy: StrategyDSL) => void // Callback when user accepts optimized strategy
}

export interface StrategyColor {
    stroke: string
    fill: string
    stopColor: string
}

export interface PortfolioDataPoint {
    date: string
    value: number
    allocation?: string // Current portfolio allocation at this date
}

export interface ReturnsDataPoint {
    date: string
    return: number
}

export interface DrawdownDataPoint {
    date: string
    drawdown: number
}

export interface AllocationDataPoint {
    date: string
    allocation: string
}

export type TabType = 'overview' | 'charts' | 'returns' | 'analytics' | 'allocations' | 'monte_carlo' | 'insights' | 'live_status'
