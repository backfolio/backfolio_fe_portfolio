import { useMemo } from 'react'
import { BacktestResult, PortfolioDataPoint, ReturnsDataPoint, DrawdownDataPoint, AllocationDataPoint } from '../types/backtestResults'

/**
 * Custom hook to transform backtest API result into chart-ready data
 */
export const useBacktestChartData = (result: BacktestResult) => {
    const portfolioData = useMemo((): PortfolioDataPoint[] => {
        const portfolioLog = result?.result?.portfolio_log
        const allocationLog = result?.result?.allocation_log

        if (!portfolioLog) {
            console.warn('Portfolio log missing')
            return []
        }

        // Build sorted allocation entries for efficient single-pass merge
        let sortedAllocations: { date: string; time: number; allocation: string }[] = []
        if (allocationLog && typeof allocationLog === 'object' && !Array.isArray(allocationLog)) {
            sortedAllocations = Object.entries(allocationLog)
                .map(([date, allocation]) => ({
                    date,
                    time: new Date(date).getTime(),
                    allocation: allocation as string
                }))
                .sort((a, b) => a.time - b.time)
        }

        // Get portfolio entries as sorted array
        let portfolioEntries: { date: string; time: number; value: number }[]
        if (typeof portfolioLog === 'object' && !Array.isArray(portfolioLog)) {
            portfolioEntries = Object.entries(portfolioLog)
                .map(([date, value]) => ({
                    date,
                    time: new Date(date).getTime(),
                    value: value as number
                }))
                .sort((a, b) => a.time - b.time)
        } else if (Array.isArray(portfolioLog)) {
            portfolioEntries = portfolioLog.map(entry => ({
                date: entry.date,
                time: new Date(entry.date).getTime(),
                value: entry.value
            }))
        } else {
            console.warn('Portfolio log in unexpected format:', portfolioLog)
            return []
        }

        // Single pass: merge allocations into portfolio data efficiently O(n + m)
        let allocIdx = 0
        let currentAllocation: string | undefined

        return portfolioEntries.map(entry => {
            // Advance allocation pointer to find most recent allocation <= current date
            while (allocIdx < sortedAllocations.length &&
                sortedAllocations[allocIdx].time <= entry.time) {
                currentAllocation = sortedAllocations[allocIdx].allocation
                allocIdx++
            }

            return {
                date: entry.date,
                value: entry.value,
                allocation: currentAllocation
            }
        })
    }, [result])

    const returnsData = useMemo((): ReturnsDataPoint[] => {
        // Calculate returns from portfolio values
        if (portfolioData.length < 2) return []

        const returns: ReturnsDataPoint[] = []
        for (let i = 1; i < portfolioData.length; i++) {
            const prevValue = portfolioData[i - 1].value
            const currentValue = portfolioData[i].value
            const dailyReturn = ((currentValue - prevValue) / prevValue) * 100

            returns.push({
                date: portfolioData[i].date,
                return: dailyReturn
            })
        }

        return returns
    }, [portfolioData])

    const drawdownData = useMemo((): DrawdownDataPoint[] => {
        // Calculate drawdown from portfolio values
        // Backend returns drawdown_analysis.periods but not a full drawdown_history
        if (portfolioData.length === 0) {
            console.warn('No portfolio data to calculate drawdown')
            return []
        }

        const drawdowns: DrawdownDataPoint[] = []
        let peak = portfolioData[0].value

        for (const point of portfolioData) {
            // Update peak if we have a new high
            if (point.value > peak) {
                peak = point.value
            }

            // Calculate drawdown from peak (as percentage, negative values)
            const drawdown = peak > 0 ? ((point.value - peak) / peak) * 100 : 0

            drawdowns.push({
                date: point.date,
                drawdown: drawdown
            })
        }

        return drawdowns
    }, [portfolioData])

    const allocationData = useMemo((): AllocationDataPoint[] => {
        const allocationLog = result?.result?.allocation_log
        if (!allocationLog) {
            console.warn('Allocation log missing')
            return []
        }

        // Handle object format {date: allocation}
        if (typeof allocationLog === 'object' && !Array.isArray(allocationLog)) {
            return Object.entries(allocationLog)
                .map(([date, allocation]) => ({
                    date,
                    allocation: allocation as string
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }

        // Handle array format [{date, allocation}]
        if (Array.isArray(allocationLog)) {
            return allocationLog.map(entry => ({
                date: entry.date,
                allocation: entry.allocation
            }))
        }

        console.warn('Allocation log in unexpected format')
        return []
    }, [result])

    return {
        portfolioData,
        returnsData,
        drawdownData,
        allocationData
    }
}
