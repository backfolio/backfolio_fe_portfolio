// ============================================================================
// API CONTRACT V3.0 - TYPE DEFINITIONS
// ============================================================================

// ----------------------------------------------------------------------------
// BACKTESTING TYPES
// ----------------------------------------------------------------------------

export interface Allocation {
    [symbol: string]: number; // symbol -> allocation percentage (0.0-1.0)
}

export interface SignalParams {
    type: 'Price' | 'SMA' | 'EMA' | 'RSI' | 'HV' | 'DD' | 'ROC' | 'BB' | 'MACD' | 'constant';
    // Backend requires uppercase for indicators (except 'constant')

    symbol?: string;  // Required for all except "constant"
    window?: number;  // Required for SMA, EMA, RSI, HV, DD, ROC, BB (not for Price or constant)
    value?: number;   // Required for "constant" type

    // BB-specific (Bollinger %B)
    std_dev?: number; // Standard deviation multiplier (default: 2.0)

    // MACD-specific
    fast?: number;    // Fast EMA period (default: 12)
    slow?: number;    // Slow EMA period (default: 26)
    signal?: number;  // Signal EMA period (default: 9)
    output?: 'histogram' | 'macd' | 'signal';  // Which value to return (default: histogram)
}

export interface Condition {
    left: SignalParams;
    comparison: '>' | '<' | '>=' | '<=' | '==';  // Backend requires 'comparison', not 'operator'
    right: SignalParams;
}

export interface CompositeCondition {
    op: 'AND' | 'OR';
    conditions: Array<Condition | CompositeCondition>;
}

export interface SwitchingCondition {
    name?: string;
    condition: Condition | CompositeCondition;
    target_allocation: string;
}

/**
 * CLEAN API V4.0 - Strategy type for API persistence
 * entry_condition is embedded in AllocationWithRebalancing
 */
export interface Strategy {
    allocations: {
        [groupName: string]: AllocationWithRebalancing;
    };
    fallback_allocation: string;
    allocation_order?: string[];
}

export interface BacktestConfig {
    start_date: string;
    end_date: string;
    initial_capital: number;
    rebalance_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    base_commission?: number;
    enable_risk_management?: boolean;
    stop_loss?: number | null;
    take_profit?: number | null;
    trailing_stop?: number | null;
    max_drawdown_limit?: number | null;
    volatility_exit_threshold?: number | null;
    target_volatility?: number | null;
    max_position_size?: number;
    min_position_size?: number;
    // New in v3.1: Cashflow System
    cashflow_amount?: number | null;
    cashflow_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | null;
    cashflow_start_date?: string | null;
    // New in v3.1: Allocation Switching Costs
    switch_allocation_cost?: number;
}

export interface BacktestRequest {
    strategy: Strategy;
    config: BacktestConfig;
}

// Metrics returned by backend calculate_metrics()
export interface BacktestMetrics {
    cagr: number;
    volatility: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    information_ratio: number;
    calmar_ratio: number;
    objective_score: number;
    max_drawdown: number;
    avg_drawdown: number;
    avg_recovery_days: number;
    value_at_risk: number;
    conditional_var: number;
    win_rate: number;
    profit_factor: number;
    cumulative_return: number;
    final_value: number;
    initial_capital: number;
}

// Actual backend response structure from backtest_analytics.py
export interface BacktestResult {
    success: boolean;
    backtest_id?: string;
    result: {
        is_valid: boolean;
        metrics: BacktestMetrics;

        // Logs - object format {date: value}
        portfolio_log: { [date: string]: number };
        allocation_log: { [date: string]: string };
        returns_log: { [date: string]: number };

        // Allocation summary - from summarize_allocation_periods()
        allocation_summary: Array<{
            allocation: string;
            start_date: string;
            end_date: string;
            start_balance: number;
            end_balance: number;
            pct_return: number;
            days: number;
        }>;

        // Risk metrics - from _calculate_risk_metrics()
        risk_metrics: {
            var_95: number;
            cvar_95: number;
            var_99: number;
            cvar_99: number;
            skewness: number;
            kurtosis: number;
            tail_ratio: number;
            max_consecutive_losses: number;
            volatility_clustering?: number;
        };

        // Benchmark comparison - from _calculate_benchmark_comparison()
        benchmark_comparison: {
            [symbol: string]: {
                alpha: number;
                beta: number;
                information_ratio: number;
                tracking_error: number;
                relative_return: number;
                // Benchmark performance metrics
                benchmark_cagr: number;
                benchmark_return: number;
                benchmark_volatility: number;
                benchmark_sharpe: number;
                benchmark_max_drawdown: number;
            };
        };

        // Transaction analysis - from _analyze_transactions()
        transaction_analysis: {
            total_transaction_costs: number;
            total_trades: number;
            total_turnover: number;
            avg_cost_per_trade: number;
            cost_as_pct_of_portfolio: number;
            turnover_ratio: number;
            trading_frequency: number;
        };

        // Cashflow analysis - from _analyze_cashflows()
        cashflow_analysis: {
            enabled: boolean;
            total_contributions: number;
            total_withdrawals: number;
            net_cashflow: number;
            num_cashflow_events: number;
            num_contributions?: number;
            num_withdrawals?: number;
            cashflow_frequency: string | null;
            avg_contribution: number;
            avg_withdrawal: number;
            cashflow_as_pct_of_final_value: number;
            money_weighted_return: number | null;
            cashflow_log: { [date: string]: number };
        };

        // Drawdown analysis - from _analyze_drawdowns()
        drawdown_analysis: {
            summary: {
                max_drawdown: number;
                avg_drawdown: number;
                num_drawdowns: number;
                avg_duration_days: number;
                avg_recovery_days: number | null;
            };
            periods: Array<{
                start_date: string;
                end_date: string;
                max_drawdown: number;
                duration_days: number;
                recovery_date: string | null;
                recovery_days: number | null;
            }>;
        };

        // Allocation efficiency - from _analyze_allocation_efficiency()
        allocation_efficiency: {
            allocation_changes: number;
            allocation_percentages: { [allocationName: string]: number };
            allocation_performance: {
                [allocationName: string]: {
                    total_return: number;
                    avg_daily_return: number;
                    volatility: number;
                };
            };
            switching_frequency: number;
        };

        // Strategy metadata - from _calculate_strategy_metadata()
        strategy_metadata: {
            estimated_annual_trades: number;
            estimated_annual_cost: number;
            recommended_capital: number;
            risk_level_score: number;
            complexity_score: number;
        };

        // Deployment checks - from _calculate_deployment_checks()
        deployment_checks: {
            is_deployable: boolean;
            warnings: string[];
            requirements: {
                min_capital: number;
                data_availability: string;
                execution_feasibility: string;
            };
        };

        // Historical analysis - from _calculate_historical_analysis()
        historical_analysis: {
            best_12_month_return: number;
            worst_12_month_return: number;
            win_streak_max: number;
            loss_streak_max: number;
            recovery_time_avg_days: number;
            monthly_returns: Array<{
                year: number;
                month: number;
                return: number;
            }>;
        };

        // Rolling metrics - from calculate_rolling_metrics()
        rolling_metrics: {
            [metricName: string]: {
                [date: string]: number | null;
            };
        };

        // Correlation matrix
        correlation_matrix: {
            [symbol: string]: {
                [symbol: string]: number;
            };
        };

        // Risk contribution
        risk_contribution: {
            [symbol: string]: number;
        };

        // Metadata
        rebalancing_frequency: string;
        execution_time: number;
        warnings: string[];
        errors: string[];
    };
}

// ----------------------------------------------------------------------------
// FRONTEND STRATEGY BUILDER TYPES
// ----------------------------------------------------------------------------

export interface AllocationWithRebalancing {
    allocation: Allocation;
    rebalancing_frequency?: 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    // NEW: Entry condition for this portfolio in the linked-list chain
    // If present, portfolio is selected when condition evaluates to true
    // If absent, portfolio is a "stopping point" (always selected when reached)
    entry_condition?: Condition | CompositeCondition;
}

/**
 * @deprecated CLEAN API V4.0 - Use entry_condition in AllocationWithRebalancing instead
 * Kept for backwards compatibility during migration
 */
export interface SwitchingRule {
    name?: string;
    condition: Condition | CompositeCondition;
    target_allocation: string;
}

/**
 * @deprecated CLEAN API V4.0 - Use entry_condition in AllocationWithRebalancing instead
 * Kept for backwards compatibility during migration
 */
export interface AllocationRule {
    allocation: string;
    rules: string | string[];
}

// Canvas edge for visual representation of portfolio connections
export interface CanvasEdge {
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

// Canvas position for node layout
export interface CanvasPosition {
    x: number;
    y: number;
}

// Canvas viewport (pan + zoom)
export interface CanvasViewport {
    x: number;
    y: number;
    zoom: number;
}

/**
 * CLEAN API V4.0 - Strategy DSL
 * 
 * Key changes:
 * - entry_condition is embedded directly in each allocation (AllocationWithRebalancing)
 * - No more separate switching_logic or allocation_rules arrays
 * - allocation_order defines the linked-list traversal order
 * - Portfolios WITH entry_condition: selected when condition is true
 * - Portfolios WITHOUT entry_condition: "stopping point" (always selected when reached)
 */
export interface StrategyDSL {
    start_date: string;
    end_date: string;
    initial_capital: number;
    // Evaluation frequency - how often to check conditions for allocation switching (default: 'daily')
    evaluation_frequency?: 'daily' | 'weekly' | 'monthly';
    // Signal delay - days between signal evaluation and trade execution (default: 0)
    // 0 = Industry standard (MOC orders - execute at same close)
    // 1 = Conservative (execute next day)
    // 2 = Very conservative (execute 2 days later)
    signal_delay?: 0 | 1 | 2;
    // Cashflow System - periodic contributions/withdrawals
    cashflow_amount?: number | null;
    cashflow_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | null;
    // Allocations with embedded entry_condition (CLEAN API V4.0)
    allocations: {
        [groupName: string]: AllocationWithRebalancing;
    };
    fallback_allocation: string;
    // Linked-list traversal order - determines evaluation priority
    allocation_order?: string[];
    // Session-only rules (not saved to library) - for reuse within this strategy
    session_rules?: SwitchingRule[];
    // Canvas state - visual layout only
    canvas_edges?: CanvasEdge[];
    canvas_positions?: { [allocationName: string]: CanvasPosition };
    canvas_viewport?: CanvasViewport;
}

// ----------------------------------------------------------------------------
// STRATEGY MANAGEMENT TYPES
// ----------------------------------------------------------------------------

// Captured metrics from backtest at time of strategy save
export interface SavedStrategyMetrics {
    total_return: number | null;  // Cumulative return (percentage)
    cagr: number | null;  // Compound Annual Growth Rate
    sharpe_ratio: number | null;
    sortino_ratio: number | null;
    max_drawdown: number | null;  // Max drawdown (percentage, negative)
    volatility: number | null;
    calmar_ratio: number | null;
    win_rate: number | null;
    // Money-weighted return (IRR) - accounts for cashflows
    money_weighted_return: number | null;
    // Backtest period info
    backtest_start_date: string | null;
    backtest_end_date: string | null;
    initial_capital: number | null;
    final_value: number | null;
}

export interface SavedStrategy {
    strategy_id: string;
    user_id: string;
    name: string;
    version: number;
    strategy_dsl: Strategy;
    is_deployed: boolean;
    risk_level: 'defensive' | 'balanced' | 'aggressive';
    tags: string[];
    notes?: string;
    // Canvas state for visual layout persistence
    canvas_state?: CanvasState;
    // Captured metrics from backtest
    metrics?: SavedStrategyMetrics;
    // Cached full backtest result for instant viewing
    cached_backtest_result?: BacktestResult;
    cached_at?: string;
    created_at: string;
    updated_at: string;
}

// Canvas state for visual layout persistence
// CLEAN API V4.0: allocation_rules removed - entry_condition is now embedded in allocations
export interface CanvasState {
    edges: CanvasEdge[];
    positions: { [allocationName: string]: CanvasPosition };
    viewport?: CanvasViewport;
}

export interface CreateStrategyRequest {
    name: string;
    strategy_dsl: Strategy;
    version?: number;
    risk_level?: 'defensive' | 'balanced' | 'aggressive';
    tags?: string[];
    notes?: string;
    // Canvas state for visual layout persistence
    canvas_state?: CanvasState;
    // Captured metrics from backtest at time of save
    metrics?: SavedStrategyMetrics;
}

export interface CreateStrategyResponse {
    success: boolean;
    strategy_id: string;
    message: string;
}

export interface ListStrategiesParams {
    is_deployed?: boolean;
    risk_level?: 'defensive' | 'balanced' | 'aggressive';
    sort_by?: 'recent' | 'name' | 'return' | 'sharpe' | 'drawdown' | 'volatility' | 'cagr';
    limit?: number;
    offset?: number;
}

export interface ListStrategiesResponse {
    success: boolean;
    strategies: SavedStrategy[];
    total: number;
    page: number;
    pages: number;
}

export interface GetStrategyResponse {
    success: boolean;
    strategy: SavedStrategy;
}

export interface UpdateStrategyRequest {
    name?: string;
    tags?: string[];
    notes?: string;
    version_increment?: boolean;
    // Full strategy update fields
    strategy_dsl?: Strategy;
    canvas_state?: CanvasState;
    risk_level?: 'defensive' | 'balanced' | 'aggressive';
    // Updated metrics from new backtest
    metrics?: SavedStrategyMetrics;
}

export interface UpdateStrategyResponse {
    success: boolean;
    strategy_id: string;
    message: string;
    version: number;
}

export interface DuplicateStrategyResponse {
    success: boolean;
    new_strategy_id: string;
    name: string;
}

// ----------------------------------------------------------------------------
// DEPLOYMENT TYPES
// ----------------------------------------------------------------------------

export interface BrokerConfig {
    broker_name?: string;
    account_id?: string;
    api_key?: string;
    api_secret?: string;
    paper_trading?: boolean;
}

export interface BacktestMetricsForDeployment {
    cagr?: number;
    total_return?: number;
    sharpe_ratio?: number;
    max_drawdown?: number;
}

export interface MonteCarloForDeployment {
    median_return?: number;
    median_cagr?: number;
    p10_return?: number;
    p10_cagr?: number;
    p90_return?: number;
    p90_cagr?: number;
    num_simulations?: number;
}

export interface CreateDeploymentRequest {
    strategy_id: string;
    initial_capital?: number;
    broker_config?: BrokerConfig;
    backtest_metrics?: BacktestMetricsForDeployment;
    monte_carlo?: MonteCarloForDeployment;
}

export interface Deployment {
    deployment_id: string;
    user_id: string;
    strategy_id: string;
    strategy_name: string;
    status: 'active' | 'paused' | 'stopped';
    initial_capital: number;
    current_value: number;
    deployed_at: string;
    paused_at?: string | null;
    stopped_at?: string | null;
    broker_config?: BrokerConfig;
}

export interface CreateDeploymentResponse {
    success: boolean;
    deployment_id: string;
    message: string;
    status: 'active' | 'paused' | 'stopped';
}

export interface ListDeploymentsParams {
    status?: 'active' | 'paused' | 'stopped';
    limit?: number;
    offset?: number;
}

export interface ListDeploymentsResponse {
    success: boolean;
    deployments: Deployment[];
}

export interface GetDeploymentResponse {
    success: boolean;
    deployment: Deployment;
}

export interface UpdateDeploymentStatusRequest {
    status: 'active' | 'paused' | 'stopped';
}

export interface UpdateDeploymentStatusResponse {
    success: boolean;
    deployment_id: string;
    status: 'active' | 'paused' | 'stopped';
}

// ----------------------------------------------------------------------------
// PERFORMANCE & DASHBOARD TYPES
// ----------------------------------------------------------------------------

export interface PerformanceSnapshot {
    snapshot_id: string;
    deployment_id: string;
    timestamp: string;
    portfolio_value: number;
    daily_return: number;
    cumulative_return: number;
    current_allocation: Record<string, number>;
}

export interface GetPerformanceHistoryParams {
    days?: number;
}

export interface GetPerformanceHistoryResponse {
    success: boolean;
    deployment_id: string;
    performance_history: PerformanceSnapshot[];
    data_points: number;
}

export interface BacktestProjection {
    cagr?: number;
    total_return?: number;
    sharpe_ratio?: number;
    max_drawdown?: number;
    recorded_at?: string;
}

export interface DeploymentSummary {
    deployment_id: string;
    strategy_name: string;
    status: 'active' | 'paused' | 'stopped';
    current_value: number;
    deployed_at: string;
    latest_performance?: PerformanceSnapshot;
    backtest_projection?: BacktestProjection;
}

// ----------------------------------------------------------------------------
// RULE LIBRARY TYPES
// ----------------------------------------------------------------------------

export type RuleCategory = 'trend' | 'momentum' | 'volatility' | 'risk' | 'custom';

export interface SavedRule {
    id: string;
    name: string;
    description: string;
    condition: Condition | CompositeCondition;
    condition_summary: string;
    category: RuleCategory;
    tags: string[];
    usage_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateRuleRequest {
    name: string;
    description?: string;
    condition: Condition | CompositeCondition;
    category?: RuleCategory;
    tags?: string[];
}

export interface CreateRuleResponse {
    success: boolean;
    rule_id: string;
    name: string;
    created_at: string;
}

export interface ListRulesParams {
    category?: RuleCategory;
    search?: string;
    sort_by?: 'recent' | 'name' | 'usage';
    limit?: number;
    offset?: number;
}

export interface ListRulesResponse {
    success: boolean;
    rules: SavedRule[];
    total: number;
    limit: number;
    offset: number;
    page: number;
    pages: number;
}

export interface GetRuleResponse {
    success: boolean;
    rule: SavedRule;
}

export interface UpdateRuleRequest {
    name?: string;
    description?: string;
    condition?: Condition | CompositeCondition;
    category?: RuleCategory;
    tags?: string[];
}

export interface UpdateRuleResponse {
    success: boolean;
    rule_id: string;
    name: string;
    updated_at: string;
}

export interface DuplicateRuleResponse {
    success: boolean;
    new_rule_id: string;
    name: string;
}

// ----------------------------------------------------------------------------
// AI INSIGHTS TYPES
// ----------------------------------------------------------------------------

// Available optimization objectives:
// - sortino: Sortino ratio (only penalizes downside risk - recommended)
// - risk_adjusted_cagr: CAGR × (1 - max_dd) - balanced returns & drawdown
// - calmar: CAGR / Max Drawdown
// - cagr_sqrt_dd: CAGR / sqrt(max_dd) - softer drawdown penalty
// - balanced: Multi-factor score (CAGR + Sortino + Calmar + WinRate - DD)
// - sharpe: Sharpe ratio (penalizes all volatility)
// Optimization objectives organized by category:
// Risk-Adjusted: sortino, sharpe, risk_adjusted_cagr
// Growth-Focused: cagr, cagr_capped_dd, gain_to_pain
// Hybrid: calmar, cagr_sqrt_dd, sterling, balanced
// Legacy: profit_factor, ulcer_adjusted
export type OptimizationObjective =
    // Risk-adjusted
    | 'sortino'
    | 'sharpe'
    | 'risk_adjusted_cagr'
    // Growth-focused
    | 'cagr'
    | 'cagr_capped_dd'
    | 'gain_to_pain'
    // Hybrid
    | 'calmar'
    | 'cagr_sqrt_dd'
    | 'sterling'
    | 'balanced'
    // Legacy
    | 'profit_factor'
    | 'ulcer_adjusted';

export interface InsightsJobConfig {
    run_monte_carlo: boolean;
    run_optimization: boolean;
    run_validation: boolean;
    monte_carlo_simulations: number;
    projection_years: number;
    optimization_trials: number;
    optimization_objective: OptimizationObjective;
    validation_periods: number;
}

export interface InsightsProgress {
    step: 'pending' | 'monte_carlo' | 'optimization' | 'validation' | 'complete';
    percent: number;
    message: string;
}

export interface MonteCarloScenario {
    return?: number;
    cagr?: number;  // New: CAGR for multi-year simulations
    total_return?: number;  // New: total return over full period
    final_value?: number;  // New: final portfolio value
    value?: number;  // Legacy: final value
    probability: string;
    description?: string;
}

export interface MonteCarloResults {
    loss_probability: number;
    var_95: number;

    // Legacy 1-year format
    expected_return_median?: number;
    expected_return_p10?: number;
    expected_return_p90?: number;
    worst_case_p1?: number;
    best_case_p99?: number;

    // New: CAGR for multi-year simulations
    cagr_median?: number;
    cagr_p10?: number;
    cagr_p90?: number;
    cagr_p1?: number;
    cagr_p99?: number;

    // Distribution of final portfolio values (focused on P2-P98 range)
    distribution: {
        bins: number[];
        bin_edges: number[];
    };

    // CAGR distribution (focused on P2-P98 range)
    cagr_distribution?: {
        bins: number[];
        bin_edges: number[];
    };

    scenarios: {
        // Old format
        bad_year?: MonteCarloScenario;
        great_year?: MonteCarloScenario;
        // New format
        pessimistic?: MonteCarloScenario;
        optimistic?: MonteCarloScenario;
        worst_case?: MonteCarloScenario;
        best_case?: MonteCarloScenario;
        // Both formats
        typical?: MonteCarloScenario;
    };

    // New: Drawdown analysis
    drawdown_analysis?: {
        median: number;
        p90: number;
        p95?: number;
        worst: number;
        description?: string;
    };

    // New: Drawdown probabilities
    drawdown_probabilities?: {
        prob_20pct_drawdown: number;
        prob_30pct_drawdown: number;
        prob_40pct_drawdown: number;
        prob_50pct_drawdown: number;
    };

    // New: Sharpe distribution
    sharpe_distribution?: {
        median: number;
        p10: number;
        p90: number;
    };

    // Metadata
    metadata?: {
        simulations_run: number;
        projection_years: number;
        projection_days: number;
        block_size_days?: number;
        historical_days_used?: number;
        assets_simulated?: string[];
        elapsed_seconds?: number;
        simulation_type?: string;
        description?: string;
        // Cashflow configuration used in simulation
        cashflow_amount?: number;
        cashflow_frequency?: string;
        has_cashflow?: boolean;
    };

    statistics?: {
        mean_return?: number;
        std_return?: number;
        mean_cagr?: number;
        std_cagr?: number;
        mean_total_return?: number;
        skewness?: number;
        kurtosis?: number;
        simulations_run?: number;
        simulations_completed?: number;
        years_per_simulation?: number;
        projection_days?: number;
        initial_capital?: number;
    };

    // Portfolio path percentiles for fan chart visualization
    path_percentiles?: {
        percentiles: {
            p5: number[];
            p10: number[];
            p25: number[];
            p50: number[];
            p75: number[];
            p90: number[];
            p95: number[];
        };
        time_labels: string[];
        num_points: number;
        initial_capital: number;
        sample_paths?: number[][];  // Optional sample paths for spaghetti plot
        description?: string;
    };

    // Cashflow-specific metrics (only present when cashflows are enabled)
    cashflow_metrics?: {
        cashflow_type: 'contribution' | 'withdrawal';
        amount_per_period: number;
        frequency: string;
        total_events: number;
        total_cashflow: number;
        years: number;
        summary: string;

        // Contribution-specific metrics
        total_invested?: number;
        total_contributions?: number;
        investment_multiple_median?: number;
        investment_multiple_p10?: number;
        investment_multiple_p90?: number;
        gain_median?: number;
        gain_p10?: number;
        gain_p90?: number;
        break_even_probability?: number;
        double_money_probability?: number;

        // Withdrawal-specific metrics
        initial_capital?: number;
        total_withdrawn?: number;
        success_rate?: number;
        ruin_probability?: number;
        ending_balance_median?: number;
        ending_balance_p10?: number;
        ending_balance_p90?: number;
        maintain_half_capital_probability?: number;

        // Common
        final_value_median?: number;
        final_value_p10?: number;
        final_value_p90?: number;
    };

    initial_capital?: number;
}

export interface OptimizationMetrics {
    sharpe_ratio: number;
    cagr: number;
    max_drawdown: number;
    calmar_ratio?: number;
}

export interface OptimizationParameterChange {
    name: string;
    original: number;
    optimized: number;
    percent_change?: number;
    description: string;
    // Rule and condition context for clearer UI
    rule_name?: string;
    rule_idx?: number;
    target_allocation?: string;
    condition?: string;  // Human-readable condition like "SPY SMA(200) > SPY Price"
}

export interface OptimizationDiagnosticIssue {
    type: 'flat_landscape' | 'limited_sensitivity' | 'low_variance';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
}

export interface OptimizationDiagnosticSuggestion {
    title: string;
    description: string;
}

export interface OptimizationDiagnostics {
    parameters_effective: boolean;
    issues: OptimizationDiagnosticIssue[];
    suggestions: OptimizationDiagnosticSuggestion[];
}

export interface OptimizationResults {
    success: boolean;
    error?: string;

    // Original strategy performance
    original: OptimizationMetrics;

    // Full period optimized performance (entire dataset)
    optimized: OptimizationMetrics;

    // Holdout validation performance
    optimized_holdout: OptimizationMetrics;

    // OOS validation metrics (new: simple holdout)
    oos_validation?: {
        method: string;
        train_ratio: number;
        train_period: string;
        oos_period: string;
        train_score: number;
        oos_score: number;
        decay: number;
        overfitting_score: number;
        is_robust: boolean;
        train_metrics?: OptimizationMetrics;
        oos_metrics?: OptimizationMetrics;
    };

    // Validation metrics (70/30 train/holdout + forward MC)
    validation: {
        method?: string;  // 'train_holdout_mc'
        train_ratio?: number;  // 0.7 = 70% train
        is_robust: boolean;  // True if both holdout and MC pass
        holdout_is_robust?: boolean;  // Holdout validation passed
        mc_is_robust?: boolean;  // Monte Carlo validation passed
        overfitting_score?: number;  // 0 = no overfit, 1 = complete overfit
        train_period?: string;
        holdout_period?: string;
        mc_period?: string;
    };

    // Holdout validation on pristine 30% data
    holdout_validation?: Record<string, unknown>;

    // Parameter changes
    parameter_changes: OptimizationParameterChange[];
    optimized_dsl: Record<string, any>;

    // Metadata
    metadata: {
        n_trials: number;
        elapsed_seconds: number;
    };

    // Trial history for visualization
    trial_history?: Array<{
        trial: number;
        params: Record<string, any>;
        sharpe: number;
        cagr: number;
        max_dd: number;
        score: number;
        is_best?: boolean;
    }>;

    // Diagnostics about optimization quality
    diagnostics?: OptimizationDiagnostics;

    // Monte Carlo validation on synthetic future data
    monte_carlo_validation?: {
        simulations: number;
        projection_years: number;
        cagr_median: number;
        cagr_p10: number;
        cagr_p90: number;
        loss_probability: number;
        max_drawdown_median: number;
        max_drawdown_p90: number;
        description: string;
        error?: string;
    };
}

export interface InsightsResults {
    monte_carlo?: MonteCarloResults;
    optimization?: OptimizationResults;
    validation?: Record<string, any>;    // Phase 1C
    summary?: {
        headline: string;
        verdict: 'low_risk' | 'moderate_risk' | 'high_risk' | 'speculative';
        key_insights: string[];
    };
}

export interface InsightsJob {
    job_id: string;
    strategy_id?: string;
    status: 'pending' | 'running' | 'complete' | 'failed' | 'cancelled';
    progress: InsightsProgress;
    config?: InsightsJobConfig;
    results?: InsightsResults;
    error?: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
}

export interface StartInsightsRequest {
    run_monte_carlo?: boolean;
    run_optimization?: boolean;
    run_validation?: boolean;
    monte_carlo_simulations?: number;
    // Years to project forward in Monte Carlo (5, 10, 20)
    projection_years?: number;
    // Optimization parameters
    optimization_trials?: number;  // Number of optimization trials (default: 50)
    optimization_objective?: OptimizationObjective;  // Metric to optimize (default: sortino)
    // Pass backtest result directly for immediate analysis (avoids cache lookup)
    backtest_result?: BacktestResult;
    // Force a new run, bypassing any cached results
    force_refresh?: boolean;
}

export interface StartInsightsResponse {
    success: boolean;
    job_id: string;
    status: string;
    estimated_seconds: number;
}

export interface InsightsStatusResponse extends InsightsJob {
    // Inherits all InsightsJob fields
}

export interface InsightsReportResponse {
    job_id: string;
    strategy_id: string;
    strategy_name: string;
    completed_at: string;
    results: InsightsResults;
    config: InsightsJobConfig;
}

export interface InsightsJobListResponse {
    success: boolean;
    jobs: Array<{
        job_id: string;
        status: string;
        progress: InsightsProgress;
        created_at: string;
        completed_at?: string;
        has_results: boolean;
    }>;
}

// ============================================================================
// STANDALONE MONTE CARLO (No saved strategy required)
// ============================================================================

export interface StartMonteCarloRequest {
    strategy_dsl: StrategyDSL | Record<string, unknown>;
    initial_capital?: number;  // Starting capital, default 100000
    n_simulations?: number;  // 50-1000, default 100
    projection_years?: number;  // 5, 10, or 20, default 10
    // Cashflow configuration for contributions/withdrawals
    cashflow_amount?: number;  // Amount per period (positive = contribution, negative = withdrawal)
    cashflow_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';  // How often cashflows occur
    force_refresh?: boolean;  // Force cache refresh when cashflow config changes
}

export interface StartMonteCarloResponse {
    success: boolean;
    job_id: string;
    status: 'pending' | 'complete';
    estimated_seconds?: number;
    // When cached, results are returned immediately
    cached?: boolean;
    results?: MonteCarloResults;
}

export interface MonteCarloStatusResponse {
    job_id: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
    progress: {
        percent: number;
        message: string;
    };
    results?: MonteCarloResults;
    error?: string;
}

// ============================================================================
// STANDALONE OPTIMIZER (No saved strategy required)
// ============================================================================

export interface StartOptimizerRequest {
    strategy_dsl: StrategyDSL | Record<string, unknown>;
    backtest_result: BacktestResult;
    optimization_trials?: number;  // 30-100, default 50
    optimization_objective?: OptimizationObjective;  // default 'sortino'
}

export interface StartOptimizerResponse {
    success: boolean;
    job_id: string;
    status: 'pending';
    estimated_seconds: number;
}

// Live metrics during optimization progress
export interface OptimizationBestMetrics {
    current_best: {
        sharpe: number;
        cagr: number;
        max_dd: number;
    } | null;
    current_rule?: string;
    best_score: number;
    baseline: {
        sharpe: number;
        cagr: number;
        max_dd: number;
        score: number;
    };
    trials_completed: number;
    total_trials: number;
}

export interface OptimizerStatusResponse {
    job_id: string;
    status: 'pending' | 'running' | 'complete' | 'failed' | 'not_found';
    progress: {
        percent: number;
        message: string;
        best_metrics?: OptimizationBestMetrics;
    };
    results?: OptimizationResults;
    error?: string;
}

// ============================================================================
// RULES OPTIMIZER TYPES (Discover switching rules between portfolios)
// ============================================================================

export type OptimizerMode = 'allocations' | 'rules' | 'full';

export interface RulesOptimizerPortfolioConfig {
    name: string;
    allocation: Record<string, number>;
    signal_ticker?: string;
    is_fallback?: boolean;
}

export interface StartRulesOptimizerRequest {
    strategy_dsl: StrategyDSL | Record<string, unknown>;
    backtest_result: BacktestResult;
    optimization_mode: 'auto' | 'two_portfolio' | 'multi_portfolio';

    // For two_portfolio mode
    signal_ticker?: string;
    default_portfolio?: string;
    active_portfolio?: string;

    // For multi_portfolio mode
    portfolios?: RulesOptimizerPortfolioConfig[];

    // Common options
    n_trials?: number;          // 50-200, default 100
    max_conditions?: 1 | 2 | 3 | 4 | 5; // default 3
    complexity_penalty?: number; // 0-10%, default 2%
    objective?: OptimizationObjective;
}

export interface StartRulesOptimizerResponse {
    success: boolean;
    job_id: string;
    status: 'pending';
    estimated_seconds: number;
}

export interface DiscoveredRule {
    human_readable: string;     // "QQQ RSI(14) > 50 AND QQQ Price > SMA(200) OR QQQ HV(20) < 25%"
    complexity: number;
    conditions: string[];
    // New: supports mixed AND/OR logic with PEMDAS precedence
    operators: ('AND' | 'OR')[];  // Operators between conditions: ['AND', 'OR'] for 3 conditions
    expression: string;           // Full expression: "Rule_C0 AND Rule_C1 OR Rule_C2"
    has_mixed_logic: boolean;     // True if operators contains both AND and OR
    dsl_rules: SwitchingCondition[];  // Individual rules for switching_logic
    // Legacy: kept for backward compatibility
    logic?: 'AND' | 'OR';
    dsl?: SwitchingCondition;
}

export interface BaselineMetrics {
    name: string;
    description?: string;
    sharpe_ratio: number;
    sortino_ratio: number;
    cagr: number;
    max_drawdown: number;
    score: number;
    is_winner?: boolean;
}

export interface RulesOptimizerResults {
    success: boolean;
    improved: boolean;
    optimization_type: 'switching_rules' | 'multi_portfolio_rules';

    // The discovered rule (two_portfolio mode)
    discovered_rule?: DiscoveredRule;

    // All discovered rules (multi_portfolio mode)
    discovered_rules?: Record<string, {
        human_readable: string;
        complexity: number;
        logic: 'AND' | 'OR';
        signal_ticker: string;
        dsl: SwitchingCondition;
        is_useful: boolean;
        is_used: boolean;
    }>;

    // Winning strategy info (multi_portfolio mode)
    winning_strategy?: {
        type: 'baseline' | 'rules';
        name: string;
        rules_used: string[];
        rule_order: string[];
        is_simple: boolean;
        recommendation: string;
    };

    // Baselines for comparison
    baselines: Record<string, BaselineMetrics>;

    // Legacy baseline fields (two_portfolio mode)
    baseline_default?: BaselineMetrics;
    baseline_active?: BaselineMetrics;

    // Optimized strategy metrics
    optimized: {
        sharpe_ratio: number;
        sortino_ratio: number;
        cagr: number;
        max_drawdown: number;
        score: number;
    };

    // Improvement analysis
    improvement: {
        vs_default?: number;
        vs_active?: number;
        vs_balanced?: number;
        vs_best_baseline?: number;
        beats_default?: boolean;
        beats_active?: boolean;
        beats_balanced?: boolean;
        beats_all_baselines?: boolean;
        beats_both?: boolean;
        rules_helped?: boolean;
    };

    // Holdout validation (pristine 30% data never seen during training)
    holdout_validation?: {
        method: string;  // 'block_bootstrap_holdout'
        holdout_period: string;
        holdout_metrics: {
            sharpe_ratio: number;
            cagr: number;
            max_drawdown: number;
            sortino_ratio: number;
        };
        holdout_score: number;
        training_median_score: number;
        overfitting_score: number;
        is_robust: boolean;
    };

    // Forward Monte Carlo validation (synthetic future projection)
    monte_carlo_validation?: {
        simulations: number;
        projection_years: number;
        baseline?: Record<string, number>;
        optimized?: {
            cagr_median: number;
            cagr_p10?: number;
            cagr_p90?: number;
            sharpe_median: number;
            max_drawdown_median?: number;
            loss_probability: number;
        };
        improvement?: {
            sharpe_delta: number;
            cagr_delta: number;
        };
        is_robust: boolean;
        error?: string;
    };

    // Combined validation (70/30 holdout + forward MC)
    validation: {
        method: 'train_holdout_mc';
        train_ratio?: number;
        is_robust: boolean;
        holdout_is_robust?: boolean;  // Holdout validation passed
        mc_is_robust?: boolean;  // Monte Carlo validation passed
        overfitting_score?: number;  // 0 = no overfit, 1 = complete overfit
        holdout_score?: number;  // Score on holdout data
        train_period?: string;
        holdout_period?: string;
    };

    // Ready-to-use optimized DSL
    optimized_dsl: Record<string, unknown>;

    // Portfolio name mapping (two_portfolio mode)
    portfolio_mapping?: {
        default: string;
        active: string;
    };

    // Metadata
    metadata: {
        n_trials: number;
        n_trials_per_portfolio?: number;
        total_trials?: number;
        elapsed_seconds: number;
        signal_ticker?: string;
        default_portfolio?: string[];
        rules_portfolio?: string[];
        portfolios?: string[];
        fallback_portfolio?: string;
        objective: string;
        max_conditions: number;
    };

    // Top trials for visualization
    trial_history?: Array<{
        trial: number;
        score: number;
        complexity: number;
        rule: string;
        sharpe?: number;
        cagr?: number;
        max_dd?: number;
    }>;

    // Diagnostics
    diagnostics?: {
        rule_effective: boolean;
        issues: Array<{
            type: string;
            severity: 'info' | 'warning' | 'critical';
            title: string;
            description: string;
        }>;
        suggestions: Array<{
            type: string;
            title: string;
            description: string;
        }>;
    };
}

export interface RulesOptimizerStatusResponse {
    job_id: string;
    status: 'pending' | 'running' | 'complete' | 'failed' | 'not_found';
    progress: {
        percent: number;
        message: string;
        best_metrics?: OptimizationBestMetrics;
    };
    results?: RulesOptimizerResults;
    error?: string;
}

// ============================================================================
// FULL OPTIMIZER TYPES (Rules + Allocations sequential optimization)
// ============================================================================

export interface StartFullOptimizerRequest {
    strategy_dsl: StrategyDSL | Record<string, unknown>;
    backtest_result: BacktestResult;
    // Rules optimization options
    n_rules_trials?: number;          // 50-200, default 100
    max_conditions?: 1 | 2 | 3 | 4 | 5;  // default 3
    complexity_penalty?: number;       // 0-10%, default 2%
    // Allocations optimization options
    n_allocations_trials?: number;     // 30-100, default 50
    // Common options
    objective?: OptimizationObjective;
}

export interface StartFullOptimizerResponse {
    success: boolean;
    job_id: string;
    status: 'pending';
    estimated_seconds: number;
}

export interface FullOptimizerResults {
    success: boolean;
    improved: boolean;
    optimization_type: 'full_strategy';

    // Phase 1: Rules Discovery results
    phase1_rules?: {
        success: boolean;
        improved: boolean;
        discovered_rule?: DiscoveredRule;
        discovered_rules?: Record<string, {
            human_readable: string;
            complexity: number;
            logic: 'AND' | 'OR';
            signal_ticker: string;
            is_useful: boolean;
            is_used: boolean;
        }>;
        winning_strategy?: {
            type: 'baseline' | 'rules';
            name: string;
            rules_used: string[];
            rule_order: string[];
            is_simple: boolean;
            recommendation: string;
        };
        baselines?: Record<string, BaselineMetrics>;
        optimized?: {
            sharpe_ratio: number;
            sortino_ratio: number;
            cagr: number;
            max_drawdown: number;
            score: number;
        };
        improvement?: {
            vs_default?: number;
            vs_active?: number;
            vs_balanced?: number;
            beats_all_baselines?: boolean;
        };
        validation?: {
            method: string;
            train_ratio?: number;
            is_robust: boolean;
            holdout_is_robust?: boolean;
            mc_is_robust?: boolean;
            overfitting_score?: number;
            holdout_score?: number;
            train_period?: string;
            holdout_period?: string;
        };
        holdout_validation?: Record<string, unknown>;
        monte_carlo_validation?: Record<string, unknown>;
    };

    // Phase 2: Allocation Optimization results
    phase2_allocations?: {
        success: boolean;
        improved: boolean;
        skipped?: boolean;
        reason?: string;
        original?: {
            sharpe_ratio: number;
            cagr: number;
            max_drawdown: number;
        };
        // Full period optimized performance (entire dataset)
        optimized?: {
            sharpe_ratio: number;
            cagr: number;
            max_drawdown: number;
        };
        parameter_changes?: Array<{
            name: string;
            allocation: string;
            original: string;
            optimized: string;
            percent_change: number;
            description: string;
        }>;
        validation?: {
            method?: string;
            train_ratio?: number;
            is_robust: boolean;
            holdout_is_robust?: boolean;
            mc_is_robust?: boolean;
            overfitting_score?: number;
            train_period?: string;
            holdout_period?: string;
        };
        holdout_validation?: Record<string, unknown>;
        monte_carlo_validation?: {
            simulations: number;
            projection_years: number;
            original?: Record<string, number>;
            optimized?: Record<string, number>;
            improvement?: Record<string, number>;
            is_robust: boolean;
        };
    };

    // Final optimized DSL
    optimized_dsl: Record<string, unknown>;

    // Summary
    summary: {
        rules_discovered: boolean;
        rules_improved: boolean;
        allocations_improved: boolean;
        total_improvement: 'significant' | 'moderate' | 'none';
        recommendation: string;
    };

    // Metadata
    metadata: {
        n_rules_trials: number;
        n_allocations_trials: number;
        max_conditions: number;
        objective: string;
        elapsed_seconds: number;
        num_portfolios: number;
        has_multi_asset_portfolio: boolean;
    };
}

export interface FullOptimizerStatusResponse {
    job_id: string;
    status: 'pending' | 'running' | 'complete' | 'failed' | 'not_found';
    progress: {
        percent: number;
        message: string;
        phase: 'rules' | 'allocations' | 'complete';
        best_metrics?: OptimizationBestMetrics;
    };
    results?: FullOptimizerResults;
    error?: string;
}

// ============================================================================
// DEPLOYMENT EVALUATION TYPES (Strategy Monitoring)
// ============================================================================

export interface DeploymentEvaluation {
    id: string;
    deployment_id: string;
    evaluation_date: string;
    evaluated_at: string;
    previous_allocation: string;
    current_allocation: string;
    allocation_changed: boolean;
    rebalance_needed: boolean;
    action_summary: string;
    execution_status: 'pending' | 'executed' | 'skipped' | 'expired';
    user_acknowledged: boolean;
    current_allocation_weights?: Record<string, number>;
    previous_allocation_weights?: Record<string, number>;
    triggered_rules?: string[];
}

export interface GetEvaluationHistoryParams {
    limit?: number;
    include_no_action?: boolean;
}

export interface GetEvaluationHistoryResponse {
    success: boolean;
    deployment_id: string;
    evaluations: DeploymentEvaluation[];
    count: number;
}