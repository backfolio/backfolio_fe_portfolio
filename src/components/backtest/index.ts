// Backtest component exports
export { default as BacktestResultsPanel } from './BacktestResultsPanel';
export { default as BacktestResultsModal } from './BacktestResultsModal';
export { StrategyCanvas } from './StrategyCanvas';
export { StrategyRulesPanel } from './StrategyRulesPanel';
export { AllocationNode } from './nodes/AllocationNode';
export { RuleEdge } from './edges/RuleEdge';

// Reusable component exports
export { MetricCard } from './components/MetricCard';
export { StrategyLegend } from './components/StrategyLegend';
export { PortfolioChart } from './components/PortfolioChart';
export { ReturnsChart } from './components/ReturnsChart';
export { DrawdownChart } from './components/DrawdownChart';

// Hook exports
export { useBacktestChartData } from './hooks/useBacktestChartData';

// Utility exports
export { formatMetric, formatCurrency, handleExport } from './utils/backtestFormatters';

// Constants exports
export { STRATEGY_COLORS } from './constants/chartColors';

// Type exports
export type {
    BacktestResult,
    BacktestResultsModalProps,
    StrategyColor,
    PortfolioDataPoint,
    ReturnsDataPoint,
    DrawdownDataPoint,
    AllocationDataPoint,
    TabType
} from './types/backtestResults';
