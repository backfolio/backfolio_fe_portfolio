import { StrategyDSL } from '../types/strategy';

// Preset allocation templates
export const ALLOCATION_PRESETS = {
    '60/40 Classic Portfolio': {
        'SPY': 0.6,
        'BND': 0.4
    },
    '80/20 Aggressive Growth': {
        'SPY': 0.8,
        'BND': 0.2
    },
    'All Weather Portfolio (Ray Dalio)': {
        'SPY': 0.3,
        'TLT': 0.4,
        'IEF': 0.15,
        'GLD': 0.08,
        'DBC': 0.07
    },
    'Boglehead Three-Fund': {
        'VTI': 0.55,
        'VXUS': 0.3,
        'BND': 0.15
    },
    'Golden Butterfly': {
        'VTI': 0.2,
        'SHY': 0.2,
        'TLT': 0.2,
        'GLD': 0.2,
        'IWN': 0.2
    },
    'Conservative Income': {
        'BND': 0.55,
        'SHY': 0.2,
        'SPY': 0.25
    },
    'Warren Buffett 90/10': {
        'SPY': 0.9,
        'SHY': 0.1
    },
    'Global Market Portfolio': {
        'VTI': 0.35,
        'VXUS': 0.25,
        'BND': 0.2,
        'BNDX': 0.15,
        'VNQ': 0.05
    },
    'Larry Swedroe Min Volatility': {
        'SPLV': 0.25,
        'USMV': 0.25,
        'EEMV': 0.25,
        'BND': 0.25
    },
    'Ivy Portfolio': {
        'VTI': 0.2,
        'VNQ': 0.2,
        'DBC': 0.2,
        'BND': 0.2,
        'VXUS': 0.2
    }
};

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
    },
    // TIER 1 Signals - Drawdown
    'Buy the Dip (10%)': {
        name: 'Buy the Dip (10%)',
        condition: {
            left: { type: 'DD', symbol: 'SPY', window: 50 },
            comparison: '<',
            right: { type: 'constant', value: -0.10 }
        },
        description: 'Buy when price falls 10%+ from 50-day high'
    },
    'Buy the Dip (20%)': {
        name: 'Buy the Dip (20%)',
        condition: {
            left: { type: 'DD', symbol: 'SPY', window: 50 },
            comparison: '<',
            right: { type: 'constant', value: -0.20 }
        },
        description: 'Buy when price falls 20%+ from 50-day high (major dip)'
    },
    // TIER 1 Signals - Rate of Change
    'Strong Momentum Up': {
        name: 'Strong Momentum Up',
        condition: {
            left: { type: 'ROC', symbol: 'SPY', window: 10 },
            comparison: '>',
            right: { type: 'constant', value: 5 }
        },
        description: 'Buy when 10-day momentum exceeds +5%'
    },
    'Momentum Breakdown': {
        name: 'Momentum Breakdown',
        condition: {
            left: { type: 'ROC', symbol: 'SPY', window: 10 },
            comparison: '<',
            right: { type: 'constant', value: -5 }
        },
        description: 'Sell when 10-day momentum falls below -5%'
    },
    // TIER 2 Signals - Bollinger %B
    'Bollinger Oversold': {
        name: 'Bollinger Oversold',
        condition: {
            left: { type: 'BB', symbol: 'SPY', window: 20 },
            comparison: '<',
            right: { type: 'constant', value: 0.2 }
        },
        description: 'Buy when price is near lower Bollinger Band (volatility-adjusted oversold)'
    },
    'Bollinger Overbought': {
        name: 'Bollinger Overbought',
        condition: {
            left: { type: 'BB', symbol: 'SPY', window: 20 },
            comparison: '>',
            right: { type: 'constant', value: 0.8 }
        },
        description: 'Sell when price is near upper Bollinger Band (volatility-adjusted overbought)'
    },
    // TIER 2 Signals - MACD
    'MACD Bullish': {
        name: 'MACD Bullish',
        condition: {
            left: { type: 'MACD', symbol: 'SPY', window: 12 },
            comparison: '>',
            right: { type: 'constant', value: 0 }
        },
        description: 'Buy when MACD histogram crosses above zero (bullish momentum)'
    },
    'MACD Bearish': {
        name: 'MACD Bearish',
        condition: {
            left: { type: 'MACD', symbol: 'SPY', window: 12 },
            comparison: '<',
            right: { type: 'constant', value: 0 }
        },
        description: 'Sell when MACD histogram crosses below zero (bearish momentum)'
    }
};

// Default DSL strategy
export const DEFAULT_DSL: StrategyDSL = {
    start_date: "",
    end_date: "",
    initial_capital: 10000,
    evaluation_frequency: 'daily',  // How often to check conditions for allocation switching
    cashflow_amount: null,  // No cashflow by default
    cashflow_frequency: null,
    allocations: {},
    fallback_allocation: ""
};

// Example tactical strategy with allocation_rules
export const TACTICAL_EXAMPLE_STRATEGY: StrategyDSL = {
    start_date: "2020-01-01",
    end_date: "2024-12-31",
    initial_capital: 10000,
    evaluation_frequency: 'daily',  // Check conditions daily
    allocations: {
        "SPY_100": {
            allocation: {
                "SPY": 1.0
            },
            rebalancing_frequency: "none"  // Buy and hold - no rebalancing
        },
        "DEFENSIVE": {
            allocation: {
                "BND": 0.6,
                "CASH-X": 0.4
            },
            rebalancing_frequency: "monthly"  // Rebalance monthly to maintain 60/40
        }
    },
    fallback_allocation: "DEFENSIVE"
};

// Strategy Presets - Complete strategies ready to backtest
// Includes both static (buy-and-hold) and tactical (rule-based) strategies
export const STRATEGY_PRESETS: Record<string, StrategyDSL> = {
    // ============================================
    // STATIC PORTFOLIOS (Buy-and-Hold)
    // ============================================
    'S&P 500 Index': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'S&P 500': {
                allocation: { 'SPY': 1.0 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'S&P 500'
    },
    'Classic 60/40 Portfolio': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Balanced': {
                allocation: { 'SPY': 0.6, 'BND': 0.4 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Balanced'
    },
    'Boglehead Three-Fund': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Three-Fund': {
                allocation: { 'VTI': 0.50, 'VXUS': 0.30, 'BND': 0.20 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Three-Fund'
    },
    'All Weather Portfolio': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'All Weather': {
                allocation: { 'SPY': 0.30, 'TLT': 0.40, 'IEF': 0.15, 'GLD': 0.075, 'DBC': 0.075 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'All Weather'
    },
    'Golden Butterfly': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Golden Butterfly': {
                allocation: { 'VTI': 0.20, 'IWN': 0.20, 'TLT': 0.20, 'SHY': 0.20, 'GLD': 0.20 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Golden Butterfly'
    },
    // ============================================
    // TACTICAL STRATEGIES (Rule-Based Switching)
    // Sorted by Sharpe Ratio (highest first)
    // ============================================
    // High-risk leveraged strategy showcasing 3x leverage simulation with CASH-X
    '3x Leveraged QQQ Tactical': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Leveraged Growth': {
                allocation: { 'QQQ?L=3': 0.89, 'USMV': 0.06, 'SPY': 0.02, 'GLD': 0.01, 'QQQ': 0.01, 'TLT': 0.01 },
                rebalancing_frequency: 'none',
                entry_condition: {
                    op: 'OR',
                    conditions: [
                        {
                            op: 'AND',
                            conditions: [
                                {
                                    left: { type: 'Price', symbol: 'QQQ' },
                                    comparison: '>=',
                                    right: { type: 'SMA', symbol: 'QQQ', window: 200 }
                                },
                                {
                                    left: { type: 'HV', symbol: 'QQQ', window: 20 },
                                    comparison: '<',
                                    right: { type: 'constant', value: 28 }
                                }
                            ]
                        },
                        {
                            left: { type: 'RSI', symbol: 'QQQ', window: 10 },
                            comparison: '<',
                            right: { type: 'constant', value: 32 }
                        }
                    ]
                }
            },
            'Gold Defensive': {
                allocation: { 'GLD': 0.73, 'CASH-X': 0.26, 'SHY': 0.01 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'Gold Defensive',
        allocation_order: ['Leveraged Growth', 'Gold Defensive']
    },
    'Mean Reversion Contrarian': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Oversold Opportunity': {
                allocation: { 'SPY': 0.80, 'QQQ': 0.20 },
                rebalancing_frequency: 'none',
                entry_condition: {
                    left: { type: 'RSI', symbol: 'SPY', window: 5 },
                    comparison: '<',
                    right: { type: 'constant', value: 25 }
                }
            },
            'Overbought Caution': {
                allocation: { 'TLT': 0.50, 'GLD': 0.30, 'SHY': 0.20 },
                rebalancing_frequency: 'none',
                entry_condition: {
                    left: { type: 'RSI', symbol: 'SPY', window: 5 },
                    comparison: '>',
                    right: { type: 'constant', value: 80 }
                }
            },
            'Neutral Market': {
                allocation: { 'SPY': 0.50, 'TLT': 0.30, 'GLD': 0.20 },
                rebalancing_frequency: 'monthly'
            }
        },
        fallback_allocation: 'Neutral Market',
        allocation_order: ['Oversold Opportunity', 'Overbought Caution', 'Neutral Market']
    },
    'QQQ Volatility Momentum': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Tech Growth': {
                allocation: { 'QQQ': 0.70, 'TLT': 0.27, 'GLD': 0.03 },
                rebalancing_frequency: 'none',
                entry_condition: {
                    op: 'OR',
                    conditions: [
                        {
                            op: 'AND',
                            conditions: [
                                {
                                    left: { type: 'Price', symbol: 'QQQ' },
                                    comparison: '>=',
                                    right: { type: 'SMA', symbol: 'QQQ', window: 200 }
                                },
                                {
                                    left: { type: 'HV', symbol: 'QQQ', window: 20 },
                                    comparison: '<',
                                    right: { type: 'constant', value: 28 }
                                }
                            ]
                        },
                        {
                            left: { type: 'RSI', symbol: 'QQQ', window: 10 },
                            comparison: '<',
                            right: { type: 'constant', value: 32 }
                        }
                    ]
                }
            },
            'Gold Defensive': {
                allocation: { 'GLD': 0.85, 'CASH-X': 0.12, 'SHY': 0.03 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'Gold Defensive',
        allocation_order: ['Tech Growth', 'Gold Defensive']
    },
    'Permanent Portfolio Plus': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Growth Tilt': {
                allocation: { 'VTI': 0.35, 'TLT': 0.25, 'GLD': 0.25, 'SHY': 0.15 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'RSI', symbol: 'SPY', window: 14 },
                    comparison: '<',
                    right: { type: 'constant', value: 65 }
                }
            },
            'Defense Mode': {
                allocation: { 'TLT': 0.30, 'GLD': 0.35, 'SHY': 0.35 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'RSI', symbol: 'SPY', window: 14 },
                    comparison: '>',
                    right: { type: 'constant', value: 75 }
                }
            },
            'Classic Permanent': {
                allocation: { 'VTI': 0.25, 'TLT': 0.25, 'GLD': 0.25, 'SHY': 0.25 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Classic Permanent',
        allocation_order: ['Growth Tilt', 'Defense Mode', 'Classic Permanent']
    },
    'Sector Rotation Momentum': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Tech Leadership': {
                allocation: { 'XLK': 0.40, 'XLC': 0.30, 'SPY': 0.30 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'Price', symbol: 'XLK' },
                    comparison: '>',
                    right: { type: 'SMA', symbol: 'XLK', window: 50 }
                }
            },
            'Defensive Sectors': {
                allocation: { 'XLU': 0.30, 'XLP': 0.30, 'XLV': 0.25, 'BND': 0.15 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'Price', symbol: 'SPY' },
                    comparison: '<',
                    right: { type: 'SMA', symbol: 'SPY', window: 200 }
                }
            },
            'Broad Market': {
                allocation: { 'SPY': 0.70, 'BND': 0.30 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Broad Market',
        allocation_order: ['Tech Leadership', 'Defensive Sectors', 'Broad Market']
    },
    'Gary Antonacci Dual Momentum': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'US Equities': {
                allocation: { 'SPY': 1.0 },
                rebalancing_frequency: 'none',
                entry_condition: {
                    left: { type: 'Price', symbol: 'SPY' },
                    comparison: '>',
                    right: { type: 'SMA', symbol: 'SPY', window: 200 }
                }
            },
            'International Equities': {
                allocation: { 'EFA': 1.0 },
                rebalancing_frequency: 'none',
                entry_condition: {
                    left: { type: 'Price', symbol: 'EFA' },
                    comparison: '>',
                    right: { type: 'SMA', symbol: 'EFA', window: 200 }
                }
            },
            'Safe Haven Bonds': {
                allocation: { 'BND': 1.0 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'Safe Haven Bonds',
        allocation_order: ['US Equities', 'International Equities', 'Safe Haven Bonds']
    },
    'Volatility Harvester': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Low Vol Opportunity': {
                allocation: { 'SPY': 0.50, 'QQQ': 0.30, 'EEM': 0.20 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'HV', symbol: 'SPY', window: 20 },
                    comparison: '<',
                    right: { type: 'constant', value: 15 }
                }
            },
            'Vol Spike Protection': {
                allocation: { 'TLT': 0.45, 'GLD': 0.30, 'SHY': 0.25 },
                rebalancing_frequency: 'weekly',
                entry_condition: {
                    left: { type: 'HV', symbol: 'SPY', window: 20 },
                    comparison: '>',
                    right: { type: 'constant', value: 35 }
                }
            },
            'Neutral Stance': {
                allocation: { 'SPY': 0.30, 'TLT': 0.30, 'GLD': 0.20, 'SHY': 0.20 },
                rebalancing_frequency: 'monthly'
            }
        },
        fallback_allocation: 'Neutral Stance',
        allocation_order: ['Low Vol Opportunity', 'Vol Spike Protection', 'Neutral Stance']
    },
    'Paul Tudor Jones Trend System': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Full Risk-On': {
                allocation: { 'QQQ': 0.50, 'SPY': 0.30, 'EEM': 0.20 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    op: 'AND',
                    conditions: [
                        {
                            left: { type: 'Price', symbol: 'SPY' },
                            comparison: '>',
                            right: { type: 'SMA', symbol: 'SPY', window: 200 }
                        },
                        {
                            left: { type: 'Price', symbol: 'SPY' },
                            comparison: '>',
                            right: { type: 'SMA', symbol: 'SPY', window: 50 }
                        }
                    ]
                }
            },
            'Reduced Exposure': {
                allocation: { 'SPY': 0.30, 'TLT': 0.40, 'GLD': 0.30 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'Price', symbol: 'SPY' },
                    comparison: '<',
                    right: { type: 'SMA', symbol: 'SPY', window: 200 }
                }
            },
            'Capital Preservation': {
                allocation: { 'SHY': 0.60, 'GLD': 0.25, 'TLT': 0.15 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Capital Preservation',
        allocation_order: ['Full Risk-On', 'Reduced Exposure', 'Capital Preservation']
    },
    'Endowment Model Lite': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Aggressive Endowment': {
                allocation: { 'VTI': 0.25, 'EFA': 0.15, 'EEM': 0.10, 'VNQ': 0.15, 'DBC': 0.10, 'TLT': 0.15, 'TIP': 0.10 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    op: 'AND',
                    conditions: [
                        {
                            left: { type: 'Price', symbol: 'SPY' },
                            comparison: '>',
                            right: { type: 'SMA', symbol: 'SPY', window: 200 }
                        },
                        {
                            left: { type: 'HV', symbol: 'SPY', window: 20 },
                            comparison: '<',
                            right: { type: 'constant', value: 25 }
                        }
                    ]
                }
            },
            'Conservative Endowment': {
                allocation: { 'VTI': 0.15, 'EFA': 0.10, 'VNQ': 0.10, 'TLT': 0.30, 'TIP': 0.20, 'SHY': 0.15 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Conservative Endowment',
        allocation_order: ['Aggressive Endowment', 'Conservative Endowment']
    },
    'Meb Faber Tactical Asset Allocation': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Risk-On': {
                allocation: { 'SPY': 0.2, 'EFA': 0.2, 'VNQ': 0.2, 'DBC': 0.2, 'BND': 0.2 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'Price', symbol: 'SPY' },
                    comparison: '>',
                    right: { type: 'SMA', symbol: 'SPY', window: 200 }
                }
            },
            'Risk-Off': {
                allocation: { 'SHY': 1.0 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'Risk-Off',
        allocation_order: ['Risk-On', 'Risk-Off']
    },
    'Larry Swedroe Coffee House': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Defensive Tilt': {
                allocation: { 'BND': 0.50, 'VTI': 0.10, 'VTV': 0.10, 'VBR': 0.10, 'VNQ': 0.10, 'EFA': 0.10 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'Price', symbol: 'SPY' },
                    comparison: '<',
                    right: { type: 'SMA', symbol: 'SPY', window: 200 }
                }
            },
            'Core Coffee House': {
                allocation: { 'BND': 0.40, 'VTI': 0.10, 'VTV': 0.10, 'VBR': 0.10, 'VNQ': 0.10, 'EFA': 0.10, 'EEM': 0.10 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Core Coffee House',
        allocation_order: ['Defensive Tilt', 'Core Coffee House']
    },
    'Ray Dalio All Weather Adaptive': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Storm Mode': {
                allocation: { 'TLT': 0.55, 'IEF': 0.20, 'GLD': 0.15, 'DBC': 0.10 },
                rebalancing_frequency: 'monthly',
                entry_condition: {
                    left: { type: 'HV', symbol: 'SPY', window: 20 },
                    comparison: '>',
                    right: { type: 'constant', value: 30 }
                }
            },
            'All Seasons': {
                allocation: { 'SPY': 0.30, 'TLT': 0.40, 'IEF': 0.15, 'GLD': 0.075, 'DBC': 0.075 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'All Seasons',
        allocation_order: ['Storm Mode', 'All Seasons']
    }
};

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