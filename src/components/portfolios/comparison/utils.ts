/**
 * Strategy Comparison Feature - Utility Functions
 * 
 * This file contains pure utility functions for data processing,
 * formatting, and chart data preparation.
 */

import type {
    ComparisonStrategy,
    PortfolioDataPoint,
    DrawdownDataPoint,
    MetricDefinition
} from './types'

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Format a number as currency with appropriate abbreviations
 * @example formatCurrency(1500000) => "$1.5M"
 * @example formatCurrency(25000) => "$25k"
 */
export const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}k`
    }
    return `$${value.toFixed(0)}`
}

/**
 * Format a metric value according to its definition
 */
export const formatMetricValue = (
    value: number | null | undefined,
    metric: MetricDefinition
): string => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
        return '—'
    }

    const decimals = metric.decimals ?? 2

    switch (metric.format) {
        case 'percent': {
            const pctValue = value * 100
            return `${pctValue >= 0 ? '+' : ''}${pctValue.toFixed(decimals)}%`
        }
        case 'currency':
            return `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })}`
        case 'ratio':
        case 'number':
        default:
            return value.toFixed(decimals)
    }
}

/**
 * Get a default date range (5 years ago to today)
 */
export const getDefaultDateRange = (): { startDate: string; endDate: string } => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 5)

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    }
}

// =============================================================================
// CHART DATA PREPARATION
// =============================================================================

/**
 * Prepare portfolio value chart data from comparison strategies
 * Merges all portfolio logs into a single dataset with columns for each strategy
 */
export const preparePortfolioChartData = (
    strategies: ComparisonStrategy[]
): PortfolioDataPoint[] => {
    // Collect all unique dates from all strategies
    const allDates = new Set<string>()
    strategies.forEach(s => {
        if (s.result?.result?.portfolio_log) {
            Object.keys(s.result.result.portfolio_log).forEach(d => allDates.add(d))
        }
    })

    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort()

    // Build data points
    return sortedDates.map(date => {
        const point: PortfolioDataPoint = { date }
        strategies.forEach((s, idx) => {
            if (s.result?.result?.portfolio_log) {
                point[`value_${idx}`] = s.result.result.portfolio_log[date] ?? null
            }
        })
        return point
    })
}

/**
 * Prepare drawdown chart data by calculating drawdown from peak for each strategy
 */
export const prepareDrawdownChartData = (
    portfolioData: PortfolioDataPoint[],
    strategies: ComparisonStrategy[]
): DrawdownDataPoint[] => {
    // Track running peak for each strategy
    const peaks: Record<number, number> = {}
    strategies.forEach((_, idx) => {
        peaks[idx] = 0
    })

    return portfolioData.map(point => {
        const ddPoint: DrawdownDataPoint = { date: point.date }

        strategies.forEach((_, idx) => {
            const value = point[`value_${idx}`]
            if (value !== null && value !== undefined) {
                // Update running peak
                peaks[idx] = Math.max(peaks[idx], value)
                // Calculate drawdown as percentage from peak
                const drawdown = peaks[idx] > 0
                    ? ((value - peaks[idx]) / peaks[idx]) * 100
                    : 0
                ddPoint[`drawdown_${idx}`] = drawdown
            }
        })

        return ddPoint
    })
}

/**
 * Sample data array for performance (keep every Nth point)
 * Always preserves first and last points
 */
export const sampleDataForPerformance = <T>(
    data: T[],
    maxPoints: number = 500
): T[] => {
    if (data.length <= maxPoints) return data

    const step = Math.ceil(data.length / maxPoints)
    return data.filter((_, i) =>
        i === 0 || // Keep first
        i === data.length - 1 || // Keep last
        i % step === 0 // Sample every Nth
    )
}

// =============================================================================
// METRICS UTILITIES
// =============================================================================

/**
 * Find the best value for each metric among compared strategies
 */
export const findBestValues = (
    strategies: ComparisonStrategy[],
    metrics: Record<string, MetricDefinition>
): Record<string, number> => {
    const best: Record<string, number> = {}

    Object.entries(metrics).forEach(([key, metric]) => {
        let bestVal = metric.higherIsBetter ? -Infinity : Infinity

        strategies.forEach(s => {
            if (!s.result || s.error) return

            const value = metric.getValue(s.result)
            if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
                return
            }

            // For drawdown/VaR metrics, less negative (closer to 0) is better
            const isNegativeMetric = key === 'max_drawdown' || key === 'var_95'

            if (metric.higherIsBetter || isNegativeMetric) {
                if (value > bestVal) bestVal = value
            } else {
                if (value < bestVal) bestVal = value
            }
        })

        best[key] = bestVal
    })

    return best
}

/**
 * Check if a value is the best for its metric
 */
export const isBestValue = (
    value: number | null | undefined,
    metricKey: string,
    bestValues: Record<string, number>
): boolean => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
        return false
    }

    const best = bestValues[metricKey]
    if (best === undefined || best === Infinity || best === -Infinity) {
        return false
    }

    return Math.abs(value - best) < 0.0001
}

/**
 * Get color class for a metric value based on its type and value
 */
export const getMetricColorClass = (
    value: number | null,
    metricKey: string,
    isDark: boolean
): string => {
    const defaultClass = isDark ? 'text-gray-300' : 'text-gray-700'

    if (value === null) return defaultClass

    // Risk metrics (more negative = worse)
    if (metricKey === 'max_drawdown' || metricKey === 'var_95') {
        if (value < -0.2) return 'text-red-500'
        if (value < -0.1) return 'text-orange-500'
        return isDark ? 'text-emerald-400' : 'text-emerald-600'
    }

    // Volatility (higher = worse)
    if (metricKey === 'volatility') {
        if (value > 0.25) return 'text-red-500'
        if (value > 0.15) return 'text-orange-500'
        return isDark ? 'text-emerald-400' : 'text-emerald-600'
    }

    // Default percentage metrics
    if (value >= 0) {
        return isDark ? 'text-emerald-400' : 'text-emerald-600'
    }
    return 'text-red-500'
}

// =============================================================================
// STRATEGY UTILITIES
// =============================================================================

/**
 * Check if all strategies have completed backtesting
 */
export const hasAllResults = (strategies: ComparisonStrategy[]): boolean => {
    return strategies.length > 0 &&
        strategies.every(s => s.result || s.error)
}

/**
 * Get strategies that have valid results (no errors)
 */
export const getValidStrategies = (
    strategies: ComparisonStrategy[]
): ComparisonStrategy[] => {
    return strategies.filter(s => s.result && !s.error)
}

