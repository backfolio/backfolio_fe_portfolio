// Strategy Optimizer Configuration Constants

import type { ObjectiveOption, TrialOption, ConditionOption } from './types'

// Optimization objectives - ordered by recommendation
// Grouped: Risk-Adjusted → Growth-Focused → Hybrid
export const OPTIMIZATION_OBJECTIVES: ObjectiveOption[] = [
    // === RISK-ADJUSTED (Default) ===
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
    // === GROWTH-FOCUSED ===
    {
        value: 'cagr',
        label: 'Pure CAGR',
        description: 'Maximum growth',
        recommended: false,
        tooltip: 'Pure growth maximization - ignores drawdowns entirely. Use if you have iron stomach and long time horizon. Warning: may find volatile strategies with 50%+ drawdowns.'
    },
    {
        value: 'cagr_capped_dd',
        label: 'CAGR (DD Cap)',
        description: 'Growth with DD limit',
        recommended: false,
        tooltip: 'Maximize CAGR but heavily penalize if drawdown exceeds 30%. Best of both worlds: aggressive growth focus while avoiding catastrophic drawdowns.'
    },
    {
        value: 'gain_to_pain',
        label: 'Gain/Pain',
        description: 'Gains vs losses ratio',
        recommended: false,
        tooltip: 'Sum of all gains divided by sum of all losses. Higher is better. Focuses on total profit vs total pain, ignoring volatility timing.'
    },
    // === HYBRID ===
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
        value: 'sterling',
        label: 'Sterling',
        description: 'CAGR / Avg DD',
        recommended: false,
        tooltip: 'CAGR divided by average drawdown (not max). Less sensitive to one-time crashes than Calmar. Good middle ground between growth and consistency.'
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

// Trial options for allocations optimizer
export const ALLOCATIONS_TRIAL_OPTIONS: TrialOption[] = [
    { count: 30, label: 'Quick', description: 'Fast results' },
    { count: 50, label: 'Standard', description: 'Recommended' },
    { count: 100, label: 'Thorough', description: 'More precise' },
    { count: 250, label: 'Deep', description: 'Early stop' }
]

// Trial options for rules optimizer (more trials needed)
export const RULES_TRIAL_OPTIONS: TrialOption[] = [
    { count: 50, label: 'Quick', description: 'Fast discovery' },
    { count: 100, label: 'Standard', description: 'Recommended' },
    { count: 200, label: 'Thorough', description: 'Better rules' },
    { count: 500, label: 'Deep', description: 'Best rules' },
    { count: 2000, label: 'Exhaustive', description: 'Optimal rules' },
    { count: 5000, label: 'Ultra', description: 'Optimal rules' }
]

// Max conditions options for rules
export const MAX_CONDITIONS_OPTIONS: ConditionOption[] = [
    { value: 1, label: '1', description: 'Simplest' },
    { value: 2, label: '2', description: 'Balanced' },
    { value: 3, label: '3', description: 'Recommended' },
    { value: 4, label: '4', description: 'Complex' },
    { value: 5, label: '5', description: 'Max' }
]

/**
 * Get estimated optimization time for allocations
 */
export const getAllocationsOptimizationTime = (trials: number): string => {
    // ~0.3s per trial with optimizations + 5s for OOS validation + 8s for MC validation
    // For 250 trials, early stopping typically cuts time in half
    const effectiveTrials = trials > 100 ? Math.round(trials * 0.6) : trials
    const totalSeconds = Math.max(15, Math.round(effectiveTrials * 0.3) + 13) // +5s OOS, +8s MC
    if (totalSeconds >= 60) return `~${Math.round(totalSeconds / 60)}min`
    return `~${totalSeconds}s`
}

/**
 * Get estimated optimization time for rules (auto mode)
 * Auto mode tries multiple configurations (each portfolio as potential fallback)
 */
export const getRulesOptimizationTime = (trials: number, numPortfolios: number = 2): string => {
    // Auto mode tries each portfolio as fallback
    // For 2 portfolios: 2 configs, for 3+: N configs
    const numConfigs = numPortfolios > 2 ? numPortfolios : 2
    const totalSeconds = Math.max(40, Math.round(trials * 0.5 * numConfigs) + 20)
    if (totalSeconds >= 60) return `~${Math.round(totalSeconds / 60)}min`
    return `~${totalSeconds}s`
}

/**
 * Get estimated optimization time for full optimization (rules + allocations)
 */
export const getFullOptimizationTime = (rulesTrials: number, allocationsTrials: number): string => {
    const rulesSeconds = Math.max(15, Math.round(rulesTrials * 0.5) + 10)
    const allocationsSeconds = Math.max(10, Math.round(allocationsTrials * 0.3) + 5)
    const totalSeconds = rulesSeconds + allocationsSeconds
    if (totalSeconds >= 60) return `~${Math.round(totalSeconds / 60)}min`
    return `~${totalSeconds}s`
}

// Mode descriptions
export const MODE_INFO = {
    allocations: {
        title: 'Allocation Weights',
        shortDescription: 'Optimize asset weights within portfolios',
        longDescription: 'Optimize the weight distribution within each portfolio. For example, a 60/40 SPY/BND split could become 75/25 based on historical performance.',
        bestFor: 'Single portfolio with 2+ assets',
        requirements: 'At least one portfolio with multiple assets',
        validation: 'OOS holdout (80/20) + Monte Carlo simulation'
    },
    rules: {
        title: 'Switching Rules',
        shortDescription: 'Discover optimal portfolio switching logic',
        longDescription: 'Automatically discover optimal rules for switching between portfolios. Example: "Hold QQQ when RSI(14) > 50 AND Price > SMA(200), otherwise hold GLD"',
        bestFor: '2+ portfolios for tactical switching',
        requirements: 'At least 2 portfolios defined',
        validation: 'Walk-forward (3 windows) + Monte Carlo simulation'
    },
    full: {
        title: 'Full Optimization',
        shortDescription: 'Combined rules + allocation optimization',
        longDescription: 'First discovers optimal switching rules between portfolios, then optimizes the allocation weights within each portfolio. Most comprehensive but takes longer.',
        bestFor: 'Maximum optimization potential',
        requirements: '2+ portfolios with multiple assets',
        validation: 'Walk-forward + OOS holdout + Monte Carlo'
    }
}

// Validation method descriptions
export const VALIDATION_INFO = {
    walkForward: {
        title: 'Walk-Forward Validation',
        description: 'Tests the discovered rules on 3 out-of-sample windows of real historical data. Catches overfitting to specific market conditions.',
        tooltip: 'Uses anchored expanding windows: train on 2010-2018, test on 2018-2020, then train on 2010-2020, test on 2020-2022, etc. Critical for rules which are prone to curve-fitting.'
    },
    oosHoldout: {
        title: 'Out-of-Sample Holdout',
        description: 'Reserves 20% of data as unseen test set. Validates that optimized weights generalize beyond training period.',
        tooltip: 'Simple 80/20 split where optimization only sees 80% of data. The final 20% tests if improvements are real or just noise fitting.'
    },
    monteCarlo: {
        title: 'Monte Carlo Simulation',
        description: 'Runs 75 synthetic future scenarios over 10 years. Tests robustness to market uncertainty.',
        tooltip: 'Generates realistic future price paths based on historical return distributions. Checks if strategy remains profitable across many possible futures, not just the one historical path.'
    },
    overfittingScore: {
        title: 'Overfitting Score',
        description: 'Measures performance decay from training to out-of-sample. 0% = no overfit, 50%+ = concerning.',
        tooltip: 'Calculated as: 1 - (OOS_score / Train_score). If a strategy has Sharpe 2.0 in training but 1.0 out-of-sample, overfitting score is 50%.'
    }
}

