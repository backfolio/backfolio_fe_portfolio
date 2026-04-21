import { StrategyDSL } from '../../types/strategy';

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
