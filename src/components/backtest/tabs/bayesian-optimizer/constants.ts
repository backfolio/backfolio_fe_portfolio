// AI Insights / Optimizer Configuration Constants

import type { ObjectiveOption, TrialOption } from './types'

// Configuration options
export const OPTIMIZATION_TRIAL_OPTIONS: TrialOption[] = [
    { count: 30, label: 'Quick', description: 'Fast results' },
    { count: 50, label: 'Standard', description: 'Recommended' },
    { count: 100, label: 'Thorough', description: 'More precise' },
    { count: 250, label: 'Deep', description: 'Early stop' }
]

// Optimization objective options - ordered by recommendation
export const OPTIMIZATION_OBJECTIVES: ObjectiveOption[] = [
    {
        value: 'sortino',
        label: 'Sortino',
        description: 'Downside risk only',
        recommended: true,
        tooltip: 'Like Sharpe ratio, but only penalizes DOWNSIDE volatility. Upside volatility (big gains) is good, so why penalize it? Best all-around choice for most strategies.'
    },
    {
        value: 'risk_adjusted_cagr',
        label: 'Risk-Adj CAGR',
        description: 'CAGR × (1 - DD)',
        recommended: true,
        tooltip: 'Multiplies growth rate by drawdown survival factor. Example: 20% CAGR with 30% drawdown = 0.20 × 0.70 = 0.14 score. Naturally balances returns against risk of ruin.'
    },
    {
        value: 'calmar',
        label: 'Calmar',
        description: 'CAGR / Max DD',
        recommended: false,
        tooltip: 'Classic risk-adjusted metric: CAGR divided by worst drawdown. Good but very sensitive to a single bad drawdown event. A one-time crash can dominate the score.'
    },
    {
        value: 'cagr_sqrt_dd',
        label: 'Sqrt Calmar',
        description: 'Softer DD penalty',
        recommended: false,
        tooltip: 'CAGR / √(Max Drawdown). Softer penalty than Calmar - reducing DD from 40% to 20% is 1.4× better (not 2×). Use when you want growth focus with some risk control.'
    },
    {
        value: 'balanced',
        label: 'Balanced',
        description: 'Multi-factor score',
        recommended: false,
        tooltip: 'Weighted combination of CAGR (30%), Sortino (25%), Calmar (20%), Win Rate (15%), minus drawdown penalty. Jack of all trades, master of none.'
    },
    {
        value: 'sharpe',
        label: 'Sharpe',
        description: 'All volatility',
        recommended: false,
        tooltip: 'Penalizes ALL volatility equally - a +5% day is "bad" just like a -5% day. Tends to pick boring, low-return strategies. Usually not what you want.'
    }
]

/**
 * Get estimated optimization time based on trial count
 */
export const getOptimizationTime = (trials: number): string => {
    // ~0.3s per trial with optimizations + 5s for MC validation
    // For 250 trials, early stopping typically cuts time in half
    const effectiveTrials = trials > 100 ? Math.round(trials * 0.6) : trials  // Early stopping estimate
    const totalSeconds = Math.max(10, Math.round(effectiveTrials * 0.3) + 5)
    if (totalSeconds >= 60) return `~${Math.round(totalSeconds / 60)}min`
    return `~${totalSeconds}s`
}

