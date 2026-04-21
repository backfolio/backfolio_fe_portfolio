// Preset rule templates
// Note: target_allocation will be set dynamically when rule is created
export const RULE_PRESETS = {
    'Golden Cross': {
        name: 'Golden Cross',
        condition: {
            left: { type: 'SMA', symbol: 'SPY', window: 50 },
            comparison: '>',
            right: { type: 'SMA', symbol: 'SPY', window: 200 }
        },
        description: 'Buy when 50-day SMA crosses above 200-day SMA'
    },
    'Death Cross': {
        name: 'Death Cross',
        condition: {
            left: { type: 'SMA', symbol: 'SPY', window: 50 },
            comparison: '<',
            right: { type: 'SMA', symbol: 'SPY', window: 200 }
        },
        description: 'Sell when 50-day SMA crosses below 200-day SMA'
    },
    'Price Above 200-Day Trend': {
        name: 'Price Above 200-Day Trend',
        condition: {
            left: { type: 'Price', symbol: 'SPY' },
            comparison: '>',
            right: { type: 'SMA', symbol: 'SPY', window: 200 }
        },
        description: 'Buy when price is above 200-day moving average'
    },
    'Price Below 200-Day Trend': {
        name: 'Price Below 200-Day Trend',
        condition: {
            left: { type: 'Price', symbol: 'SPY' },
            comparison: '<',
            right: { type: 'SMA', symbol: 'SPY', window: 200 }
        },
        description: 'Sell when price falls below 200-day moving average'
    },
    'RSI Overbought': {
        name: 'RSI Overbought',
        condition: {
            left: { type: 'RSI', symbol: 'SPY', window: 14 },
            comparison: '>',
            right: { type: 'constant', value: 70 }
        },
        description: 'Sell when RSI rises above 70 (overbought)'
    },
    'RSI Oversold': {
        name: 'RSI Oversold',
        condition: {
            left: { type: 'RSI', symbol: 'SPY', window: 14 },
            comparison: '<',
            right: { type: 'constant', value: 30 }
        },
        description: 'Buy when RSI drops below 30 (oversold)'
    },
    'EMA Bullish Crossover': {
        name: 'EMA Bullish Crossover',
        condition: {
            left: { type: 'EMA', symbol: 'SPY', window: 9 },
            comparison: '>',
            right: { type: 'EMA', symbol: 'SPY', window: 21 }
        },
        description: 'Buy when 9-day EMA crosses above 21-day EMA'
    },
    'EMA Bearish Crossover': {
        name: 'EMA Bearish Crossover',
        condition: {
            left: { type: 'EMA', symbol: 'SPY', window: 9 },
            comparison: '<',
            right: { type: 'EMA', symbol: 'SPY', window: 21 }
        },
        description: 'Sell when 9-day EMA crosses below 21-day EMA'
    },
    'High Volatility Breakout': {
        name: 'High Volatility Breakout',
        condition: {
            left: { type: 'HV', symbol: 'SPY', window: 20 },
            comparison: '>',
            right: { type: 'HV', symbol: 'SPY', window: 60 }
        },
        description: 'Trade when short-term volatility exceeds long-term volatility'
    },
    'Volatility Squeeze': {
        name: '🔒 Volatility Squeeze',
        condition: {
            left: { type: 'HV', symbol: 'SPY', window: 20 },
            comparison: '<',
            right: { type: 'HV', symbol: 'SPY', window: 60 }
        },
        description: 'Hold when market volatility is contracting'
    }
};
