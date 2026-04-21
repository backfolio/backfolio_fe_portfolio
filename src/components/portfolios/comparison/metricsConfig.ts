/**
 * Strategy Comparison Feature - Metrics Configuration
 * 
 * This file defines all available metrics for strategy comparison,
 * organized into logical groups. Each metric specifies how to extract
 * its value from a backtest result and how to display it.
 */

import type { BacktestResult } from '../../../types/strategy'
import type { MetricDefinition, MetricGroup } from './types'

// =============================================================================
// METRIC DEFINITIONS
// =============================================================================

/**
 * All available comparison metrics
 * 
 * Each metric defines:
 * - How to extract the value from BacktestResult
 * - How to format the value for display
 * - Whether higher or lower is better (for highlighting best values)
 */
export const METRICS: Record<string, MetricDefinition> = {
    // -------------------------------------------------------------------------
    // Performance Metrics
    // -------------------------------------------------------------------------
    ending_value: {
        key: 'ending_value',
        label: 'Ending Value',
        format: 'currency',
        higherIsBetter: true,
        description: 'Final portfolio value at end of backtest',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.final_value ?? null
    },

    cumulative_return: {
        key: 'cumulative_return',
        label: 'Total Return',
        format: 'percent',
        higherIsBetter: true,
        description: 'Total percentage return over the period',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.cumulative_return ?? null
    },

    cagr: {
        key: 'cagr',
        label: 'CAGR',
        format: 'percent',
        higherIsBetter: true,
        description: 'Compound Annual Growth Rate',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.cagr ?? null
    },

    mwrr: {
        key: 'mwrr',
        label: 'MWRR',
        format: 'percent',
        higherIsBetter: true,
        description: 'Money-Weighted Rate of Return (accounts for cashflows)',
        getValue: (r: BacktestResult | undefined) =>
            r?.result?.cashflow_analysis?.money_weighted_return ?? null
    },

    // -------------------------------------------------------------------------
    // Risk Metrics
    // -------------------------------------------------------------------------
    max_drawdown: {
        key: 'max_drawdown',
        label: 'Max Drawdown',
        format: 'percent',
        higherIsBetter: false, // Less negative is better
        description: 'Largest peak-to-trough decline',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.max_drawdown ?? null
    },

    volatility: {
        key: 'volatility',
        label: 'Volatility',
        format: 'percent',
        higherIsBetter: false, // Lower is better
        description: 'Annualized standard deviation of returns',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.volatility ?? null
    },

    var_95: {
        key: 'var_95',
        label: 'VaR (95%)',
        format: 'percent',
        higherIsBetter: false, // Less negative is better
        description: 'Value at Risk at 95% confidence',
        getValue: (r: BacktestResult | undefined) => r?.result?.risk_metrics?.var_95 ?? null
    },

    // -------------------------------------------------------------------------
    // Risk-Adjusted Metrics
    // -------------------------------------------------------------------------
    sharpe_ratio: {
        key: 'sharpe_ratio',
        label: 'Sharpe',
        format: 'ratio',
        decimals: 2,
        higherIsBetter: true,
        description: 'Risk-adjusted return (excess return per unit of volatility)',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.sharpe_ratio ?? null
    },

    sortino_ratio: {
        key: 'sortino_ratio',
        label: 'Sortino',
        format: 'ratio',
        decimals: 2,
        higherIsBetter: true,
        description: 'Risk-adjusted return using downside deviation',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.sortino_ratio ?? null
    },

    calmar_ratio: {
        key: 'calmar_ratio',
        label: 'Calmar',
        format: 'ratio',
        decimals: 2,
        higherIsBetter: true,
        description: 'CAGR divided by max drawdown',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.calmar_ratio ?? null
    },

    ulcer_index: {
        key: 'ulcer_index',
        label: 'Ulcer Index',
        format: 'ratio',
        decimals: 2,
        higherIsBetter: false, // Lower is better
        description: 'Measures downside volatility and drawdown duration',
        getValue: (r: BacktestResult | undefined) =>
            (r?.result?.risk_metrics as Record<string, number> | undefined)?.ulcer_index ?? null
    },

    upi: {
        key: 'upi',
        label: 'UPI',
        format: 'ratio',
        decimals: 2,
        higherIsBetter: true,
        description: 'Ulcer Performance Index (return / ulcer index)',
        getValue: (r: BacktestResult | undefined) => {
            const cagr = r?.result?.metrics?.cagr
            const ulcer = (r?.result?.risk_metrics as Record<string, number> | undefined)?.ulcer_index
            if (cagr !== undefined && cagr !== null && ulcer && ulcer > 0) {
                return cagr / ulcer
            }
            return null
        }
    },

    // -------------------------------------------------------------------------
    // Other Metrics
    // -------------------------------------------------------------------------
    beta: {
        key: 'beta',
        label: 'Beta',
        format: 'ratio',
        decimals: 2,
        higherIsBetter: false, // Neutral - depends on strategy goals
        description: 'Correlation with market benchmark',
        getValue: (r: BacktestResult | undefined) => {
            const benchmark = r?.result?.benchmark_comparison
            if (benchmark) {
                const firstBenchmark = Object.values(benchmark)[0]
                return firstBenchmark?.beta ?? null
            }
            return null
        }
    },

    win_rate: {
        key: 'win_rate',
        label: 'Win Rate',
        format: 'percent',
        higherIsBetter: true,
        description: 'Percentage of positive return days',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.win_rate ?? null
    },

    profit_factor: {
        key: 'profit_factor',
        label: 'Profit Factor',
        format: 'ratio',
        decimals: 2,
        higherIsBetter: true,
        description: 'Ratio of gross profits to gross losses',
        getValue: (r: BacktestResult | undefined) => r?.result?.metrics?.profit_factor ?? null
    },

    total_contributions: {
        key: 'total_contributions',
        label: 'Total Contributions',
        format: 'currency',
        higherIsBetter: false, // Neutral
        description: 'Total amount contributed during backtest',
        getValue: (r: BacktestResult | undefined) =>
            r?.result?.cashflow_analysis?.total_contributions ?? 0
    },
}

// =============================================================================
// METRIC GROUPS
// =============================================================================

/**
 * Metrics organized into logical display groups
 * Used to render collapsible sections in the comparison table
 */
export const METRIC_GROUPS: MetricGroup[] = [
    {
        name: 'Performance',
        metrics: ['ending_value', 'cumulative_return', 'cagr', 'mwrr']
    },
    {
        name: 'Risk',
        metrics: ['max_drawdown', 'volatility', 'var_95']
    },
    {
        name: 'Risk-Adjusted',
        metrics: ['sharpe_ratio', 'sortino_ratio', 'calmar_ratio', 'ulcer_index', 'upi']
    },
    {
        name: 'Other',
        metrics: ['beta', 'win_rate', 'profit_factor']
    }
]

/**
 * Get a metric definition by key
 */
export const getMetric = (key: string): MetricDefinition | undefined => {
    return METRICS[key]
}

/**
 * Get all metric keys
 */
export const getAllMetricKeys = (): string[] => {
    return Object.keys(METRICS)
}

