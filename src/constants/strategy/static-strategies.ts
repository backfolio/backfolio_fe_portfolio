import { StrategyDSL } from '../../types/strategy';

// Static (Buy-and-Hold) Strategy Presets
export const STATIC_STRATEGIES: Record<string, StrategyDSL> = {
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
    }
};
