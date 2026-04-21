import React from 'react';
import { StrategyDSL } from '../../../types/strategy';

interface AdvancedSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    strategy: StrategyDSL;
    onUpdateStrategy: (strategy: StrategyDSL) => void;
    isDark: boolean;
}

/**
 * Modal for configuring advanced strategy settings
 * Extracted from StrategyCanvas for maintainability
 */
export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
    isOpen,
    onClose,
    strategy,
    onUpdateStrategy,
    isDark,
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-black/40'}`}
                onClick={onClose}
            />
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className={`rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border ${isDark
                    ? 'bg-black/95 backdrop-blur-xl border-white/[0.15]'
                    : 'bg-white border-slate-200'
                    }`}>
                    <div className="p-5">
                        {/* Header */}
                        <div className={`flex items-center justify-between mb-5 pb-4 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'
                            }`}>
                            <div>
                                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Strategy Settings
                                </h2>
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                    Configure backtest parameters
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-all ${isDark
                                    ? 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            {/* Date Range */}
                            <div className={`p-4 rounded-lg border ${isDark
                                ? 'bg-white/[0.02] border-white/[0.08]'
                                : 'bg-white border-slate-200'
                                }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Date Range
                                    </h3>
                                    <div className="relative group">
                                        <div className={`cursor-help ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className={`absolute right-0 top-full mt-2 w-64 p-2.5 rounded-lg text-xs leading-relaxed z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg ${isDark
                                            ? 'bg-slate-800 text-slate-300 border border-white/10'
                                            : 'bg-slate-900 text-slate-100'
                                            }`}>
                                            If no dates are selected, the backtest will use the entire available data range for your tickers.
                                            <div className={`absolute -top-1 right-3 w-2 h-2 rotate-45 ${isDark ? 'bg-slate-800 border-l border-t border-white/10' : 'bg-slate-900'}`} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Date validation check */}
                                    {strategy.start_date && strategy.end_date && strategy.start_date >= strategy.end_date && (
                                        <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${isDark
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                                            : 'bg-red-50 border border-red-200 text-red-700'
                                            }`}>
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span>Start date must be before end date</span>
                                        </div>
                                    )}

                                    {/* Start Date */}
                                    <div className="relative group/start">
                                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            Start Date <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={strategy.start_date}
                                            onChange={(e) => onUpdateStrategy({ ...strategy, start_date: e.target.value })}
                                            aria-label="Backtest start date"
                                            className={`w-full text-sm font-medium border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${isDark
                                                ? 'bg-black/40 border-white/[0.1] text-white focus:ring-purple-500/50 focus:border-purple-500/50'
                                                : 'bg-white border-slate-300 text-slate-900 focus:ring-purple-500 focus:border-purple-500'
                                                } ${strategy.start_date && strategy.end_date && strategy.start_date >= strategy.end_date
                                                    ? isDark ? 'border-red-500/50' : 'border-red-300'
                                                    : ''
                                                }`}
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div className="relative group/end">
                                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            End Date <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={strategy.end_date}
                                            onChange={(e) => onUpdateStrategy({ ...strategy, end_date: e.target.value })}
                                            aria-label="Backtest end date"
                                            className={`w-full text-sm font-medium border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${isDark
                                                ? 'bg-black/40 border-white/[0.1] text-white focus:ring-purple-500/50 focus:border-purple-500/50'
                                                : 'bg-white border-slate-300 text-slate-900 focus:ring-purple-500 focus:border-purple-500'
                                                } ${strategy.start_date && strategy.end_date && strategy.start_date >= strategy.end_date
                                                    ? isDark ? 'border-red-500/50' : 'border-red-300'
                                                    : ''
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Initial Capital */}
                            <div className={`p-4 rounded-lg border ${isDark
                                ? 'bg-white/[0.02] border-white/[0.08]'
                                : 'bg-white border-slate-200'
                                }`}>
                                <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Initial Capital
                                </h3>

                                <div className="relative">
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        $
                                    </div>
                                    <input
                                        type="number"
                                        value={strategy.initial_capital}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            // Allow 0 if there's positive cashflow configured
                                            const hasPositiveCashflow = (strategy.cashflow_amount ?? 0) > 0 && strategy.cashflow_frequency;
                                            const minValue = hasPositiveCashflow ? 0 : 1000;
                                            onUpdateStrategy({
                                                ...strategy,
                                                initial_capital: isNaN(value) ? minValue : Math.max(value, minValue)
                                            });
                                        }}
                                        className={`w-full text-sm font-semibold border rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${isDark
                                            ? 'bg-black/40 border-white/[0.1] text-white focus:ring-purple-500/50 focus:border-purple-500/50'
                                            : 'bg-white border-slate-300 text-slate-900 focus:ring-purple-500 focus:border-purple-500'
                                            }`}
                                        min={(strategy.cashflow_amount ?? 0) > 0 && strategy.cashflow_frequency ? "0" : "1000"}
                                        step="1000"
                                        placeholder="100000"
                                    />
                                </div>
                                <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                    Minimum: $1,000 {strategy.cashflow_amount && strategy.cashflow_amount > 0 ? '(or $0 with positive cashflow)' : ''}
                                </p>
                            </div>

                            {/* Cashflow System */}
                            <div className={`p-4 rounded-lg border ${isDark
                                ? 'bg-white/[0.02] border-white/[0.08]'
                                : 'bg-white border-slate-200'
                                }`}>
                                <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Periodic Cashflow
                                </h3>

                                <div className="space-y-3">
                                    {/* Cashflow Amount */}
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            Amount (negative for withdrawals)
                                        </label>
                                        <div className="relative">
                                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${(strategy.cashflow_amount ?? 0) < 0
                                                ? (isDark ? 'text-red-400' : 'text-red-600')
                                                : (isDark ? 'text-slate-400' : 'text-slate-500')
                                                }`}>
                                                $
                                            </div>
                                            <input
                                                type="number"
                                                value={strategy.cashflow_amount ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value === '' ? null : parseFloat(e.target.value);
                                                    onUpdateStrategy({
                                                        ...strategy,
                                                        cashflow_amount: value
                                                    });
                                                }}
                                                className={`w-full text-sm font-semibold border rounded-lg pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${isDark
                                                    ? 'bg-black/40 border-white/[0.1] text-white focus:ring-cyan-500/50 focus:border-cyan-500/50'
                                                    : 'bg-white border-slate-300 text-slate-900 focus:ring-cyan-500 focus:border-cyan-500'
                                                    }`}
                                                step="100"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Cashflow Frequency */}
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            Frequency
                                        </label>
                                        <select
                                            value={strategy.cashflow_frequency ?? ''}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? null : e.target.value as 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
                                                onUpdateStrategy({
                                                    ...strategy,
                                                    cashflow_frequency: value
                                                });
                                            }}
                                            className={`w-full text-sm font-semibold border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${isDark
                                                ? 'bg-black/40 border-white/[0.1] text-white focus:ring-cyan-500/50 focus:border-cyan-500/50'
                                                : 'bg-white border-slate-300 text-slate-900 focus:ring-cyan-500 focus:border-cyan-500'
                                                }`}
                                        >
                                            <option value="" className={isDark ? 'bg-slate-800' : ''}>None (disabled)</option>
                                            <option value="weekly" className={isDark ? 'bg-slate-800' : ''}>Weekly</option>
                                            <option value="monthly" className={isDark ? 'bg-slate-800' : ''}>Monthly</option>
                                            <option value="quarterly" className={isDark ? 'bg-slate-800' : ''}>Quarterly</option>
                                            <option value="semi-annually" className={isDark ? 'bg-slate-800' : ''}>Semi-Annually</option>
                                            <option value="annually" className={isDark ? 'bg-slate-800' : ''}>Annually</option>
                                        </select>
                                    </div>
                                </div>

                                <p className={`text-xs mt-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                    {(strategy.cashflow_amount ?? 0) > 0
                                        ? 'Contributions will be invested according to current allocation'
                                        : (strategy.cashflow_amount ?? 0) < 0
                                            ? 'Withdrawals will reduce positions proportionally'
                                            : 'Set amount and frequency to enable periodic cashflow'}
                                </p>
                            </div>

                            {/* Optional: Transaction Costs */}
                            <div className={`p-4 rounded-lg border ${isDark
                                ? 'bg-white/[0.02] border-white/[0.08]'
                                : 'bg-white border-slate-200'
                                }`}>
                                <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Transaction Costs
                                </h3>

                                <div className="relative">
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        $
                                    </div>
                                    <input
                                        type="number"
                                        value={(strategy as any).switch_allocation_cost || 0}
                                        onChange={(e) => onUpdateStrategy({ ...strategy, switch_allocation_cost: parseFloat(e.target.value) || 0 } as any)}
                                        className={`w-full text-sm font-semibold border rounded-lg pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${isDark
                                            ? 'bg-black/40 border-white/[0.1] text-white focus:ring-purple-500/50 focus:border-purple-500/50'
                                            : 'bg-white border-slate-300 text-slate-900 focus:ring-purple-500 focus:border-purple-500'
                                            }`}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                    Fee charged when switching allocations
                                </p>
                            </div>

                            {/* Evaluation Frequency */}
                            <div className={`p-4 rounded-lg border ${isDark
                                ? 'bg-white/[0.02] border-white/[0.08]'
                                : 'bg-white border-slate-200'
                                }`}>
                                <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Evaluation Frequency
                                </h3>

                                <select
                                    value={strategy.evaluation_frequency || 'daily'}
                                    onChange={(e) => onUpdateStrategy({
                                        ...strategy,
                                        evaluation_frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                                    })}
                                    className={`w-full text-sm font-semibold border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${isDark
                                        ? 'bg-black/40 border-white/[0.1] text-white focus:ring-purple-500/50 focus:border-purple-500/50'
                                        : 'bg-white border-slate-300 text-slate-900 focus:ring-purple-500 focus:border-purple-500'
                                        }`}
                                >
                                    <option value="daily" className={isDark ? 'bg-slate-800' : ''}>Daily</option>
                                    <option value="weekly" className={isDark ? 'bg-slate-800' : ''}>Weekly</option>
                                    <option value="monthly" className={isDark ? 'bg-slate-800' : ''}>Monthly</option>
                                </select>
                                <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                    Frequency at which switching conditions are evaluated
                                </p>
                            </div>

                            {/* Signal Delay */}
                            <div className={`p-4 rounded-lg border ${isDark
                                ? 'bg-white/[0.02] border-white/[0.08]'
                                : 'bg-white border-slate-200'
                                }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Trade Execution Delay
                                    </h3>
                                    <div className="relative group">
                                        <div className={`cursor-help ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className={`absolute right-0 top-full mt-2 w-72 p-3 rounded-lg text-xs leading-relaxed z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg ${isDark
                                            ? 'bg-slate-800 text-slate-300 border border-white/10'
                                            : 'bg-slate-900 text-slate-100'
                                            }`}>
                                            <p className="font-semibold mb-2">When are trades executed relative to signals?</p>
                                            <ul className="space-y-1.5">
                                                <li><span className="text-cyan-400">0 days (Default):</span> Industry standard. Signals evaluated at close, trade at same close (assumes MOC orders).</li>
                                                <li><span className="text-cyan-400">1 day:</span> Conservative. Signal at Day T close → trade at Day T+1 close.</li>
                                                <li><span className="text-cyan-400">2 days:</span> Very conservative. Useful for stress-testing execution delays.</li>
                                            </ul>
                                            <div className={`absolute -top-1 right-3 w-2 h-2 rotate-45 ${isDark ? 'bg-slate-800 border-l border-t border-white/10' : 'bg-slate-900'}`} />
                                        </div>
                                    </div>
                                </div>

                                <select
                                    value={strategy.signal_delay ?? 0}
                                    onChange={(e) => onUpdateStrategy({
                                        ...strategy,
                                        signal_delay: parseInt(e.target.value) as 0 | 1 | 2
                                    })}
                                    className={`w-full text-sm font-semibold border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${isDark
                                        ? 'bg-black/40 border-white/[0.1] text-white focus:ring-cyan-500/50 focus:border-cyan-500/50'
                                        : 'bg-white border-slate-300 text-slate-900 focus:ring-cyan-500 focus:border-cyan-500'
                                        }`}
                                >
                                    <option value={0} className={isDark ? 'bg-slate-800' : ''}>0 days - Same close (Industry Standard)</option>
                                    <option value={1} className={isDark ? 'bg-slate-800' : ''}>1 day - Next day execution</option>
                                    <option value={2} className={isDark ? 'bg-slate-800' : ''}>2 days - Delayed execution</option>
                                </select>
                                <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                    {(strategy.signal_delay ?? 0) === 0
                                        ? 'Signals trigger trades at the same close (most backtests use this)'
                                        : (strategy.signal_delay ?? 0) === 1
                                            ? 'Signals trigger trades the next day (more realistic for retail traders)'
                                            : 'Trades execute 2 days after signal (stress-test execution delays)'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`mt-5 pt-4 border-t ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                            <button
                                onClick={onClose}
                                className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${isDark
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

