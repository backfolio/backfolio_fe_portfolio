import type { PortfolioPreset, RebalancingFrequency, CashflowFrequency } from './types'

// ==================== Rebalancing Options ====================

export const REBALANCING_OPTIONS: { value: RebalancingFrequency; label: string; description: string }[] = [
    { value: 'none', label: 'None (Buy & Hold)', description: 'No rebalancing' },
    { value: 'monthly', label: 'Monthly', description: 'Rebalance monthly' },
    { value: 'quarterly', label: 'Quarterly', description: 'Rebalance quarterly' },
    { value: 'yearly', label: 'Yearly', description: 'Rebalance annually' },
]

// ==================== Cashflow Frequency Options ====================

export const CASHFLOW_FREQUENCY_OPTIONS: { value: CashflowFrequency; label: string; monthlyMultiplier: number }[] = [
    { value: 'weekly', label: 'Weekly', monthlyMultiplier: 52 / 12 },
    { value: 'monthly', label: 'Monthly', monthlyMultiplier: 1 },
    { value: 'quarterly', label: 'Quarterly', monthlyMultiplier: 1 / 3 },
    { value: 'yearly', label: 'Yearly', monthlyMultiplier: 1 / 12 },
]

export const getMonthlyEquivalent = (amount: number, frequency: CashflowFrequency): number => {
    const option = CASHFLOW_FREQUENCY_OPTIONS.find(o => o.value === frequency)
    return amount * (option?.monthlyMultiplier ?? 1)
}

// ==================== Portfolio Presets ====================

export const RETIREMENT_PRESETS: Record<string, PortfolioPreset> = {
    'Conservative 40/60': {
        allocation: { 'SPY': 0.4, 'BND': 0.6 },
        description: '40% stocks, 60% bonds - lower volatility'
    },
    'Balanced 60/40': {
        allocation: { 'SPY': 0.6, 'BND': 0.4 },
        description: 'Classic balanced portfolio'
    },
    'Growth 80/20': {
        allocation: { 'SPY': 0.8, 'BND': 0.2 },
        description: '80% stocks, 20% bonds - higher growth potential'
    },
    'Three-Fund Portfolio': {
        allocation: { 'VTI': 0.50, 'VXUS': 0.30, 'BND': 0.20 },
        description: 'US stocks, international, bonds'
    },
    'Target Date Conservative': {
        allocation: { 'VTI': 0.35, 'VXUS': 0.15, 'BND': 0.35, 'SHY': 0.15 },
        description: 'Near-retirement allocation'
    },
    'Income Focused': {
        allocation: { 'BND': 0.35, 'VYM': 0.30, 'TLT': 0.20, 'SHY': 0.15 },
        description: 'Dividend and bond income'
    },
    'All Weather': {
        allocation: { 'SPY': 0.30, 'TLT': 0.40, 'IEF': 0.15, 'GLD': 0.075, 'DBC': 0.075 },
        description: 'Ray Dalio inspired - all conditions'
    },
}

// ==================== Default Form Values ====================

export const DEFAULT_FORM_VALUES = {
    currentAge: '',
    retirementAge: '',
    lifeExpectancy: '',
    initialSavings: '',
    contributionAmount: '',
    contributionFrequency: 'monthly' as CashflowFrequency,
    spendingAmount: '',
    spendingFrequency: 'monthly' as CashflowFrequency,
    rebalancingFrequency: 'quarterly' as RebalancingFrequency,
    nSimulations: 100,
}

export const DEFAULT_PORTFOLIO_ASSETS = [
    { id: 'asset-1', symbol: 'SPY', weight: 0.6 },
    { id: 'asset-2', symbol: 'BND', weight: 0.4 },
]

// ==================== Validation Constants ====================

export const VALIDATION = {
    minAge: 18,
    maxAge: 100,
    maxLifeExpectancy: 120,
    maxAssets: 10,
}

