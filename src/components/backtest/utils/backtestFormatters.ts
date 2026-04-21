import { BacktestResult, PortfolioDataPoint, ReturnsDataPoint } from '../types/backtestResults'

/**
 * Format a numeric metric value with optional percentage formatting
 * Uses locale-aware thousand separators for better readability
 */
export const formatMetric = (
    value: number | undefined,
    isPercentage = false,
    decimals = 2
): string => {
    if (value === undefined || value === null || isNaN(value) || !isFinite(value)) return 'N/A'
    const formatted = value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
    return isPercentage ? `${formatted}%` : formatted
}

/**
 * Format a numeric value as currency
 */
export const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value) || !isFinite(value)) return 'N/A'
    return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
}

/**
 * Export backtest results in CSV or JSON format
 */
export const handleExport = (
    format: 'csv' | 'json',
    result: BacktestResult,
    portfolioData: PortfolioDataPoint[],
    returnsData: ReturnsDataPoint[]
): void => {
    if (format === 'json') {
        const dataStr = JSON.stringify(result, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
        const exportFileDefaultName = `backtest-results-${new Date().toISOString().split('T')[0]}.json`
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    } else {
        // CSV Export
        const csvRows = [
            ['Date', 'Portfolio Value', 'Daily Return (%)'],
            ...portfolioData.map((item, idx) => [
                item.date,
                item.value.toString(),
                returnsData[idx]?.return?.toString() || ''
            ])
        ]
        const csvContent = csvRows.map(row => row.join(',')).join('\n')
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
        const exportFileDefaultName = `backtest-results-${new Date().toISOString().split('T')[0]}.csv`
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }
}
