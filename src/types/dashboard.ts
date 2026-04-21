export type UserTier = 'free' | 'pro' | 'premium'

// Portfolio types (for strategy management)
export interface PortfolioDeployedStrategy {
    id: string
    name: string
    status: 'active' | 'paused' | 'alert'
    lastAlert: string
    ytdPerformance: number
    backtestProjection: number
    alertsTriggered: number
    alertsExecuted: number
    alertsIgnored: number
    nextCheck: string
    currentAllocation: {
        symbol: string
        name: string
        percentage: number
        color: string
    }[]
    deployedDate: string
    runningDays: number
}

export interface SavedBacktest {
    id: string
    name: string
    version: number
    timestamp: string
    totalReturn: number | null
    cagr: number | null
    sharpeRatio: number | null
    maxDrawdown: number | null
    moneyWeightedReturn: number | null
    rules: string
    isDeployed: boolean
    riskLevel: 'aggressive' | 'defensive' | 'balanced'
    metrics?: {
        total_return: number | null
        cagr: number | null
        sharpe_ratio: number | null
        sortino_ratio: number | null
        max_drawdown: number | null
        volatility: number | null
        calmar_ratio: number | null
        win_rate: number | null
        money_weighted_return: number | null
        backtest_start_date: string | null
        backtest_end_date: string | null
        initial_capital: number | null
        final_value: number | null
    }
}

export interface ComparisonStrategy {
    id: string
    name: string
    type: 'backtest' | 'benchmark'
    metrics: {
        totalReturn: number
        cagr: number
        sharpeRatio: number
        maxDrawdown: number
        volatility: number
        winRate: number | null
        numberOfTrades: number | null
        avgTrade: number | null
        bestMonth: number
        worstMonth: number
    }
}

export interface PortfolioData {
    userTier: UserTier
    maxDeployedStrategies: number
    deployedStrategies: PortfolioDeployedStrategy[]
    savedBacktests: SavedBacktest[]
    comparisonStrategies: ComparisonStrategy[]
}
