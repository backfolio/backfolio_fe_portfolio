import type { ChartDataPoint, PortfolioAsset } from './types'
import type { RetirementSimulationResponse, SafeWithdrawalResponse } from '../../services/api'
import { VALIDATION } from './constants'

/**
 * Format a number as currency
 */
export const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
}

/**
 * Build portfolio object from assets array
 */
export const buildPortfolio = (assets: PortfolioAsset[]): Record<string, number> => {
    const portfolio: Record<string, number> = {}
    assets.forEach(({ symbol, weight }) => {
        if (symbol.trim() && weight > 0) {
            portfolio[symbol.trim()] = weight
        }
    })
    return portfolio
}

/**
 * Validate form inputs
 */
export const validateForm = (
    currentAgeNum: number,
    retirementAgeNum: number,
    lifeExpectancyNum: number,
    isWeightValid: boolean,
    portfolio: Record<string, number>,
    initialSavings: string
): string[] => {
    const errors: string[] = []
    
    if (currentAgeNum < VALIDATION.minAge || currentAgeNum > VALIDATION.maxAge) {
        errors.push(`Current age must be ${VALIDATION.minAge}-${VALIDATION.maxAge}`)
    }
    if (retirementAgeNum < currentAgeNum) {
        errors.push('Retirement age cannot be before current age')
    }
    if (lifeExpectancyNum <= retirementAgeNum) {
        errors.push('Life expectancy must be after retirement')
    }
    if (lifeExpectancyNum > VALIDATION.maxLifeExpectancy) {
        errors.push(`Life expectancy cannot exceed ${VALIDATION.maxLifeExpectancy}`)
    }
    if (!isWeightValid) {
        errors.push('Portfolio weights must total 100%')
    }
    if (Object.keys(portfolio).length === 0) {
        errors.push('Add at least one asset')
    }
    const savings = parseFloat(initialSavings) || 0
    if (savings < 0) {
        errors.push('Savings cannot be negative')
    }
    
    return errors
}

/**
 * Transform API response to chart data
 */
export const buildChartData = (
    results: RetirementSimulationResponse,
    currentAgeNum: number,
    yearsToRetirement: number
): ChartDataPoint[] => {
    if (!results.results?.path_percentiles) return []

    const { years, percentiles } = results.results.path_percentiles
    return years.map((yearNum, i) => ({
        year: `Year ${yearNum}`,
        yearNum,
        age: currentAgeNum + yearNum,
        isRetirement: yearNum >= yearsToRetirement,
        p10: percentiles.p10[i],
        p25: percentiles.p25[i],
        p50: percentiles.p50[i],
        p75: percentiles.p75[i],
        p90: percentiles.p90[i],
    }))
}

/**
 * Transform Safe Withdrawal API response to chart data
 */
export const buildSafeWithdrawalChartData = (
    results: SafeWithdrawalResponse,
    currentAgeNum: number,
    yearsToRetirement: number
): ChartDataPoint[] => {
    if (!results.simulation_results?.path_percentiles) return []

    const { years, percentiles } = results.simulation_results.path_percentiles
    return years.map((yearNum, i) => ({
        year: `Year ${yearNum}`,
        yearNum,
        age: currentAgeNum + yearNum,
        isRetirement: yearNum >= yearsToRetirement,
        p10: percentiles.p10[i],
        p25: percentiles.p25[i],
        p50: percentiles.p50[i],
        p75: percentiles.p75[i],
        p90: percentiles.p90[i],
    }))
}
