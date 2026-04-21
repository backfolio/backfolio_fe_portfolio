import { StrategyDSL } from '../../types/strategy';

// Tactical (Rule-Based Switching) Strategy Presets
// Sorted by Sharpe Ratio (highest first)
// Note: V4 API - these are simplified versions. Actual rule logic should be implemented via entry_condition in allocations.
export const TACTICAL_STRATEGIES: Record<string, StrategyDSL> = {
    // High-risk leveraged strategy showcasing 3x leverage simulation with CASH-X
    '3x Leveraged QQQ Tactical': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Leveraged Growth': {
                allocation: { 'QQQ?L=3': 0.89, 'USMV': 0.06, 'SPY': 0.02, 'GLD': 0.01, 'QQQ': 0.01, 'TLT': 0.01 },
                rebalancing_frequency: 'none'
            },
            'Gold Defensive': {
                allocation: { 'GLD': 0.73, 'CASH-X': 0.26, 'SHY': 0.01 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'Gold Defensive'
    },
    'Mean Reversion Contrarian': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Oversold Opportunity': {
                allocation: { 'SPY': 0.80, 'QQQ': 0.20 },
                rebalancing_frequency: 'none'
            },
            'Overbought Caution': {
                allocation: { 'TLT': 0.50, 'GLD': 0.30, 'SHY': 0.20 },
                rebalancing_frequency: 'none'
            },
            'Neutral Market': {
                allocation: { 'SPY': 0.50, 'TLT': 0.30, 'GLD': 0.20 },
                rebalancing_frequency: 'monthly'
            }
        },
        fallback_allocation: 'Neutral Market'
    },
    'QQQ Volatility Momentum': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Tech Growth': {
                allocation: { 'QQQ': 0.70, 'TLT': 0.27, 'GLD': 0.03 },
                rebalancing_frequency: 'none'
            },
            'Gold Defensive': {
                allocation: { 'GLD': 0.85, 'CASH-X': 0.12, 'SHY': 0.03 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'Gold Defensive'
    },
    'Permanent Portfolio Plus': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Growth Tilt': {
                allocation: { 'VTI': 0.35, 'TLT': 0.25, 'GLD': 0.25, 'SHY': 0.15 },
                rebalancing_frequency: 'monthly'
            },
            'Classic Permanent': {
                allocation: { 'VTI': 0.25, 'TLT': 0.25, 'GLD': 0.25, 'SHY': 0.25 },
                rebalancing_frequency: 'quarterly'
            },
            'Defense Mode': {
                allocation: { 'TLT': 0.30, 'GLD': 0.35, 'SHY': 0.35 },
                rebalancing_frequency: 'monthly'
            }
        },
        fallback_allocation: 'Classic Permanent'
    },
    'Sector Rotation Momentum': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Tech Leadership': {
                allocation: { 'XLK': 0.40, 'XLC': 0.30, 'SPY': 0.30 },
                rebalancing_frequency: 'monthly'
            },
            'Defensive Sectors': {
                allocation: { 'XLU': 0.30, 'XLP': 0.30, 'XLV': 0.25, 'BND': 0.15 },
                rebalancing_frequency: 'monthly'
            },
            'Broad Market': {
                allocation: { 'SPY': 0.70, 'BND': 0.30 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Broad Market'
    },
    'Gary Antonacci Dual Momentum': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'US Equities': {
                allocation: { 'SPY': 1.0 },
                rebalancing_frequency: 'none'
            },
            'International Equities': {
                allocation: { 'EFA': 1.0 },
                rebalancing_frequency: 'none'
            },
            'Safe Haven Bonds': {
                allocation: { 'BND': 1.0 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'Safe Haven Bonds'
    },
    'Volatility Harvester': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Low Vol Opportunity': {
                allocation: { 'SPY': 0.50, 'QQQ': 0.30, 'EEM': 0.20 },
                rebalancing_frequency: 'monthly'
            },
            'Vol Spike Protection': {
                allocation: { 'TLT': 0.45, 'GLD': 0.30, 'SHY': 0.25 },
                rebalancing_frequency: 'weekly'
            },
            'Neutral Stance': {
                allocation: { 'SPY': 0.30, 'TLT': 0.30, 'GLD': 0.20, 'SHY': 0.20 },
                rebalancing_frequency: 'monthly'
            }
        },
        fallback_allocation: 'Neutral Stance'
    },
    'Paul Tudor Jones Trend System': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Full Risk-On': {
                allocation: { 'QQQ': 0.50, 'SPY': 0.30, 'EEM': 0.20 },
                rebalancing_frequency: 'monthly'
            },
            'Reduced Exposure': {
                allocation: { 'SPY': 0.30, 'TLT': 0.40, 'GLD': 0.30 },
                rebalancing_frequency: 'monthly'
            },
            'Capital Preservation': {
                allocation: { 'SHY': 0.60, 'GLD': 0.25, 'TLT': 0.15 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Capital Preservation'
    },
    'Endowment Model Lite': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Aggressive Endowment': {
                allocation: { 'VTI': 0.25, 'EFA': 0.15, 'EEM': 0.10, 'VNQ': 0.15, 'DBC': 0.10, 'TLT': 0.15, 'TIP': 0.10 },
                rebalancing_frequency: 'monthly'
            },
            'Conservative Endowment': {
                allocation: { 'VTI': 0.15, 'EFA': 0.10, 'VNQ': 0.10, 'TLT': 0.30, 'TIP': 0.20, 'SHY': 0.15 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Conservative Endowment'
    },
    'Meb Faber Tactical Asset Allocation': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Risk-On': {
                allocation: { 'SPY': 0.2, 'EFA': 0.2, 'VNQ': 0.2, 'DBC': 0.2, 'BND': 0.2 },
                rebalancing_frequency: 'monthly'
            },
            'Risk-Off': {
                allocation: { 'SHY': 1.0 },
                rebalancing_frequency: 'none'
            }
        },
        fallback_allocation: 'Risk-Off'
    },
    'Larry Swedroe Coffee House': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Defensive Tilt': {
                allocation: { 'BND': 0.50, 'VTI': 0.10, 'VTV': 0.10, 'VBR': 0.10, 'VNQ': 0.10, 'EFA': 0.10 },
                rebalancing_frequency: 'monthly'
            },
            'Core Coffee House': {
                allocation: { 'BND': 0.40, 'VTI': 0.10, 'VTV': 0.10, 'VBR': 0.10, 'VNQ': 0.10, 'EFA': 0.10, 'EEM': 0.10 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'Core Coffee House'
    },
    'Ray Dalio All Weather Adaptive': {
        start_date: '',
        end_date: '',
        initial_capital: 100000,
        evaluation_frequency: 'daily',
        allocations: {
            'Storm Mode': {
                allocation: { 'TLT': 0.55, 'IEF': 0.20, 'GLD': 0.15, 'DBC': 0.10 },
                rebalancing_frequency: 'monthly'
            },
            'All Seasons': {
                allocation: { 'SPY': 0.30, 'TLT': 0.40, 'IEF': 0.15, 'GLD': 0.075, 'DBC': 0.075 },
                rebalancing_frequency: 'quarterly'
            }
        },
        fallback_allocation: 'All Seasons'
    }
};
