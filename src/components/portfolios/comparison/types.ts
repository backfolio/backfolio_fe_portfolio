/**
 * Strategy Comparison Feature - Type Definitions
 * 
 * This file contains all TypeScript types and interfaces used across
 * the strategy comparison components.
 */

import type { SavedStrategy, BacktestResult } from '../../../types/strategy'

// =============================================================================
// CONSTANTS
// =============================================================================

/** Maximum number of strategies that can be compared at once */
export const MAX_STRATEGIES = 12

/** Color palette for strategy visualization (12 colors for MAX_STRATEGIES) */
export const STRATEGY_COLORS = [
    { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.1)', name: 'Purple' },
    { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.1)', name: 'Cyan' },
    { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)', name: 'Amber' },
    { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)', name: 'Emerald' },
    { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.1)', name: 'Rose' },
    { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.1)', name: 'Indigo' },
    { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.1)', name: 'Pink' },
    { stroke: '#14b8a6', fill: 'rgba(20, 184, 166, 0.1)', name: 'Teal' },
    { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.1)', name: 'Orange' },
    { stroke: '#84cc16', fill: 'rgba(132, 204, 22, 0.1)', name: 'Lime' },
    { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.1)', name: 'Violet' },
    { stroke: '#0ea5e9', fill: 'rgba(14, 165, 233, 0.1)', name: 'Sky' },
] as const

export type StrategyColor = typeof STRATEGY_COLORS[number]

// =============================================================================
// CORE TYPES
// =============================================================================

/** Type of strategy being compared */
export type StrategyType = 'saved' | 'template' | 'benchmark' | 'stock'

/** Rebalancing frequency options */
export type RebalanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

/** Strategy selection state for comparison */
export interface ComparisonStrategy {
    /** Unique identifier for the strategy */
    id: string
    /** Display name */
    name: string
    /** Source type of the strategy */
    type: StrategyType
    /** Assigned color for visualization */
    color: StrategyColor
    /** Backtest result (populated after running comparison) */
    result?: BacktestResult
    /** Loading state during backtest */
    loading?: boolean
    /** Error message if backtest failed */
    error?: string
    /** Original saved strategy data (for 'saved' type) */
    strategy?: SavedStrategy
    /** Template preset key (for 'template' type) */
    templateKey?: string
    /** Rebalancing frequency for template strategies (default: yearly) */
    rebalanceFrequency?: RebalanceFrequency
    /** Ticker symbol (for 'stock' type) */
    ticker?: string
}

/** Cashflow frequency options */
export type CashflowFrequency = 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually'

/** Configuration for running comparisons */
export interface ComparisonConfig {
    /** Start date for backtests (YYYY-MM-DD) */
    startDate: string
    /** End date for backtests (YYYY-MM-DD) */
    endDate: string
    /** Initial portfolio capital */
    initialCapital: number
    /** Periodic cashflow amount (positive = contribution, negative = withdrawal) */
    cashflowAmount?: number | null
    /** How often cashflow occurs */
    cashflowFrequency?: CashflowFrequency | null
}

// =============================================================================
// CHART DATA TYPES
// =============================================================================

/** Data point for portfolio value chart */
export interface PortfolioDataPoint {
    date: string
    [key: `value_${number}`]: number | null
}

/** Data point for drawdown chart */
export interface DrawdownDataPoint {
    date: string
    [key: `drawdown_${number}`]: number | null
}

// =============================================================================
// METRICS TYPES
// =============================================================================

/** Format type for metric display */
export type MetricFormat = 'percent' | 'currency' | 'number' | 'ratio'

/** Definition of a comparison metric */
export interface MetricDefinition {
    /** Unique key identifier */
    key: string
    /** Display label */
    label: string
    /** Display format type */
    format: MetricFormat
    /** Number of decimal places (default: 2) */
    decimals?: number
    /** Whether higher values are better for this metric */
    higherIsBetter: boolean
    /** Tooltip description */
    description?: string
    /** Function to extract value from backtest result */
    getValue: (result: BacktestResult | undefined) => number | null
}

/** Group of related metrics */
export interface MetricGroup {
    /** Group name */
    name: string
    /** Metric keys in this group */
    metrics: string[]
}

/** Sort direction for metrics table */
export type SortDirection = 'asc' | 'desc' | null

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

/** Processed template strategy for display */
export interface TemplateStrategy {
    id: string
    name: string
    allocation: Record<string, number>
}

