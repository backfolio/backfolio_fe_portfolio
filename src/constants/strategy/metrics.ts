// Preset strategy performance metrics (10-year backtest: 2015-2024)
// These metrics are displayed in the preset selection modal to help users choose
export const STRATEGY_PRESET_METRICS: Record<string, {
    cagr: number;       // Compound Annual Growth Rate (%)
    maxDrawdown: number; // Maximum Drawdown (%)
    sharpeRatio: number; // Risk-adjusted return
    sortino: number;     // Downside risk-adjusted return
}> = {
    // Static Portfolios
    'S&P 500 Index': {
        cagr: 13.42,
        maxDrawdown: 33.70,
        sharpeRatio: 0.80,
        sortino: 1.12,
    },
    'Classic 60/40 Portfolio': {
        cagr: 9.92,
        maxDrawdown: 23.95,
        sharpeRatio: 0.83,
        sortino: 1.15,
    },
    'Boglehead Three-Fund': {
        cagr: 9.31,
        maxDrawdown: 29.39,
        sharpeRatio: 0.68,
        sortino: 0.94,
    },
    'All Weather Portfolio': {
        cagr: 6.38,
        maxDrawdown: 23.24,
        sharpeRatio: 0.75,
        sortino: 1.05,
    },
    'Golden Butterfly': {
        cagr: 6.95,
        maxDrawdown: 20.83,
        sharpeRatio: 0.77,
        sortino: 1.07,
    },
    // Tactical Strategies (sorted by Sharpe Ratio, highest first)
    '3x Leveraged QQQ Tactical': {
        cagr: 52.08,
        maxDrawdown: 47.33,
        sharpeRatio: 1.10,
        sortino: 1.59,
    },
    'Mean Reversion Contrarian': {
        cagr: 14.31,
        maxDrawdown: 14.78,
        sharpeRatio: 1.15,
        sortino: 1.76,
    },
    'QQQ Volatility Momentum': {
        cagr: 15.20,
        maxDrawdown: 34.71,
        sharpeRatio: 0.90,
        sortino: 1.27,
    },
    'Permanent Portfolio Plus': {
        cagr: 6.97,
        maxDrawdown: 20.86,
        sharpeRatio: 0.88,
        sortino: 1.26,
    },
    'Sector Rotation Momentum': {
        cagr: 14.01,
        maxDrawdown: 29.12,
        sharpeRatio: 0.82,
        sortino: 1.15,
    },
    'Gary Antonacci Dual Momentum': {
        cagr: 8.82,
        maxDrawdown: 25.55,
        sharpeRatio: 0.75,
        sortino: 1.01,
    },
    'Volatility Harvester': {
        cagr: 8.35,
        maxDrawdown: 30.00,
        sharpeRatio: 0.65,
        sortino: 0.93,
    },
    'Paul Tudor Jones Trend System': {
        cagr: 9.32,
        maxDrawdown: 28.71,
        sharpeRatio: 0.63,
        sortino: 0.85,
    },
    'Endowment Model Lite': {
        cagr: 6.67,
        maxDrawdown: 24.41,
        sharpeRatio: 0.63,
        sortino: 0.87,
    },
    'Meb Faber Tactical Asset Allocation': {
        cagr: 4.86,
        maxDrawdown: 13.84,
        sharpeRatio: 0.62,
        sortino: 0.85,
    },
    'Larry Swedroe Coffee House': {
        cagr: 5.45,
        maxDrawdown: 21.90,
        sharpeRatio: 0.58,
        sortino: 0.79,
    },
    'Ray Dalio All Weather Adaptive': {
        cagr: 4.31,
        maxDrawdown: 25.91,
        sharpeRatio: 0.49,
        sortino: 0.70,
    },
};
