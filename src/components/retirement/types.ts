import type { RetirementSimulationResponse, SafeWithdrawalResponse } from '../../services/api'

// ==================== Core Types ====================

export type ViewState = 'form' | 'loading' | 'results'

export type PlannerMode = 'check' | 'calculate'

export type RebalancingFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type CashflowFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type ColorVariant = 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'cyan' | 'indigo'

// ==================== Mode Toggle Props ====================

export interface ModeToggleProps {
    mode: PlannerMode
    onChange: (mode: PlannerMode) => void
    isDark: boolean
}

// ==================== Portfolio Types ====================

export interface PortfolioAsset {
    id: string
    symbol: string
    weight: number // stored as decimal (0.6 = 60%)
}

export interface PortfolioPreset {
    allocation: Record<string, number>
    description: string
}

// ==================== Component Props ====================

export interface FormInputProps {
    label: string
    value: string
    onChange: (val: string) => void
    prefix?: string
    suffix?: string
    hint?: string
    type?: 'text' | 'number'
    isDark: boolean
    formatCurrency?: boolean // Auto-format with commas
}

export interface MetricCardProps {
    label: string
    value: string
    subtext?: string
    color: ColorVariant
    isDark: boolean
    icon?: React.ReactNode
}

export interface ScenarioCardProps {
    title: string
    subtitle: string
    value: string
    subValue?: string
    color: ColorVariant
    isDark: boolean
    isHighlighted?: boolean
    icon: React.ReactNode
}

export interface SuccessRateGaugeProps {
    rate: number
    isDark: boolean
    retirementAge: number
    lifeExpectancy: number
}

export interface RetirementTimelineProps {
    currentAge: number
    retirementAge: number
    lifeExpectancy: number
    contributionAmount: number
    contributionFrequency: CashflowFrequency
    spendingAmount: number
    spendingFrequency: CashflowFrequency
    isDark: boolean
}

export interface RetirementFanChartProps {
    chartData: ChartDataPoint[]
    isDark: boolean
    yearsToRetirement: number
    formatCurrency: (value: number) => string
}

// ==================== Chart Types ====================

export interface ChartDataPoint {
    year: string
    yearNum: number
    age: number
    isRetirement: boolean
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
}

export interface ChartTooltipPayload {
    payload: ChartDataPoint
}

// ==================== Section Props ====================

export interface FormSectionProps {
    isDark: boolean
    mode?: PlannerMode
    primaryColor?: string // Optional: for white-label calculators
    // Client info
    currentAge: string
    setCurrentAge: (val: string) => void
    retirementAge: string
    setRetirementAge: (val: string) => void
    lifeExpectancy: string
    setLifeExpectancy: (val: string) => void
    yearsToRetirement: number
    yearsInRetirement: number
    // Financial info
    initialSavings: string
    setInitialSavings: (val: string) => void
    contributionAmount: string
    setContributionAmount: (val: string) => void
    contributionFrequency: CashflowFrequency
    setContributionFrequency: (freq: CashflowFrequency) => void
    spendingAmount: string
    setSpendingAmount: (val: string) => void
    spendingFrequency: CashflowFrequency
    setSpendingFrequency: (freq: CashflowFrequency) => void
    // Portfolio
    portfolioAssets: PortfolioAsset[]
    onAddAsset: () => void
    onRemoveAsset: (id: string) => void
    onUpdateSymbol: (id: string, symbol: string) => void
    onUpdateWeight: (id: string, weight: number) => void
    onLoadPreset: (presetName: string) => void
    totalWeight: number
    isWeightValid: boolean
    rebalancingFrequency: RebalancingFrequency
    setRebalancingFrequency: (freq: RebalancingFrequency) => void
    // Validation
    formErrors: string[]
    canSubmit: boolean
    onSubmit: () => void
}

export interface LoadingSectionProps {
    isDark: boolean
    totalYears: number
}

export interface ResultsSectionProps {
    isDark: boolean
    results: RetirementSimulationResponse
    chartData: ChartDataPoint[]
    currentAgeNum: number
    retirementAgeNum: number
    lifeExpectancyNum: number
    yearsToRetirement: number
    yearsInRetirement: number
    initialSavings: string
    contributionAmount: string
    contributionFrequency: CashflowFrequency
    spendingAmount: string
    spendingFrequency: CashflowFrequency
    onReset: () => void
    // Optional: Public calculator context for lead generation
    publicCalculatorContext?: {
        primaryColor: string
        firmName: string
        contactPageUrl?: string
        websiteUrl?: string
    }
}

// ==================== Safe Withdrawal Results Props ====================

export interface SafeWithdrawalResultsProps {
    isDark: boolean
    results: SafeWithdrawalResponse
    chartData: ChartDataPoint[]
    currentAgeNum: number
    retirementAgeNum: number
    lifeExpectancyNum: number
    yearsToRetirement: number
    yearsInRetirement: number
    initialSavings: string
    contributionAmount: string
    contributionFrequency: CashflowFrequency
    onReset: () => void
    // Optional: Public calculator context for lead generation
    publicCalculatorContext?: {
        primaryColor: string
        firmName: string
        contactPageUrl?: string
        websiteUrl?: string
    }
}

