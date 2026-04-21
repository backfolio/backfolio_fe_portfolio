import React from 'react'
import type { ConfigSectionProps, CashflowFrequency } from '../types'
import { SIMULATION_MODES, PROJECTION_PERIODS } from '../constants'
import { AnalysisItem, TrendUpIcon, TargetIcon, TrendDownIcon, ChartIcon, CurrencyIcon, ScaleIcon } from '../components'
import { useUserLimits } from '../../../../../hooks/useUserLimits'

// Lock icon for premium features
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)

// Cashflow frequency options
const CASHFLOW_FREQUENCIES: { value: CashflowFrequency; label: string; description: string }[] = [
    { value: 'weekly', label: 'Weekly', description: '52×/year' },
    { value: 'monthly', label: 'Monthly', description: '12×/year' },
    { value: 'quarterly', label: 'Quarterly', description: '4×/year' },
    { value: 'yearly', label: 'Yearly', description: '1×/year' }
]

export const ConfigSection: React.FC<ConfigSectionProps> = ({
    isDark,
    simulations,
    onSimulationsChange,
    projectionYears,
    onProjectionYearsChange,
    estimatedTime,
    onStart,
    isAuthenticated = true,
    onLogin,
    initialCapital,
    onInitialCapitalChange,
    defaultInitialCapital,
    cashflowConfig,
    onCashflowConfigChange
}) => {
    const limits = useUserLimits()

    const handleSimulationSelect = (count: number, requiresAuth: boolean) => {
        if (requiresAuth && !isAuthenticated) {
            // Don't change selection, prompt login
            onLogin?.()
        } else {
            onSimulationsChange(count)
        }
    }

    // Handle cashflow toggle
    const handleCashflowToggle = () => {
        if (!onCashflowConfigChange) return
        onCashflowConfigChange({
            enabled: !cashflowConfig?.enabled,
            amount: cashflowConfig?.amount || 500,
            frequency: cashflowConfig?.frequency || 'monthly'
        })
    }

    // Handle cashflow amount change
    const handleCashflowAmountChange = (amount: number) => {
        if (!onCashflowConfigChange) return
        onCashflowConfigChange({
            enabled: cashflowConfig?.enabled ?? false,
            amount,
            frequency: cashflowConfig?.frequency || 'monthly'
        })
    }

    // Handle cashflow frequency change
    const handleCashflowFrequencyChange = (frequency: CashflowFrequency) => {
        if (!onCashflowConfigChange) return
        onCashflowConfigChange({
            enabled: cashflowConfig?.enabled ?? false,
            amount: cashflowConfig?.amount || 500,
            frequency
        })
    }

    return (
        <div className="space-y-6">
            {/* What is Monte Carlo? - Elegant Info Card */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div className="space-y-3">
                        <h3 className={`font-bold ${isDark ? 'text-gray-200' : 'text-slate-900'}`}>
                            What is Monte Carlo Simulation?
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            <strong>A backtest shows you what happened.</strong> But the future won't be exactly like the past.
                            Monte Carlo simulation answers the real question: <em>"What could happen?"</em>
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            We generate hundreds of realistic future scenarios based on your strategy's historical behavior—each with different
                            market conditions, volatility patterns, and return sequences. This reveals the <strong>range of possible outcomes</strong>,
                            so you can see not just the average case, but also worst-case scenarios and the probability of reaching your goals.
                        </p>
                        <div className={`flex items-start gap-2 pt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                <strong className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>Smart sampling:</strong> We use advanced statistical techniques to ensure each simulation
                                covers a unique slice of the probability space—not random guesses, but scientifically optimized scenarios that provide
                                maximum insight with fewer simulations.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Settings - Premium Card */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark
                ? 'bg-white/[0.02] border-white/[0.08]'
                : 'bg-white border-gray-200'
                }`}>
                <h3 className={`font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Simulation Settings
                </h3>

                {/* Projection Period */}
                <div className="mb-6">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Projection Period
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {PROJECTION_PERIODS.map(period => (
                            <button
                                key={period.years}
                                onClick={() => onProjectionYearsChange(period.years)}
                                className={`relative overflow-hidden p-3 rounded-xl text-center transition-all duration-300 border ${projectionYears === period.years
                                    ? isDark
                                        ? 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/40 ring-1 ring-indigo-500/30'
                                        : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-300 ring-1 ring-indigo-200'
                                    : isDark
                                        ? 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12]'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                {projectionYears === period.years && (
                                    <div className={`absolute inset-0 ${isDark
                                        ? 'bg-gradient-to-t from-indigo-500/5 to-transparent'
                                        : 'bg-gradient-to-t from-indigo-100/50 to-transparent'
                                        }`} />
                                )}
                                <div className={`relative font-bold ${projectionYears === period.years
                                    ? isDark ? 'text-indigo-300' : 'text-indigo-700'
                                    : isDark ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                    {period.years}y
                                </div>
                                <div className={`relative text-[10px] mt-0.5 ${projectionYears === period.years
                                    ? isDark ? 'text-indigo-400/70' : 'text-indigo-600/70'
                                    : isDark ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                    {period.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Simulation Count */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Number of Simulations
                        </label>
                        <div className="group relative">
                            <svg className={`w-3.5 h-3.5 cursor-help ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${isDark
                                ? 'bg-gray-800 border border-gray-700 text-gray-300'
                                : 'bg-white border border-gray-200 text-gray-600 shadow-lg'
                                }`}>
                                <p className="font-medium mb-1">Smart Sampling Enabled</p>
                                <p className="text-[11px] leading-relaxed opacity-80">
                                    Our advanced sampling algorithms ensure optimal coverage of the probability space. 75 simulations provide accuracy comparable to 150+ random simulations.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {SIMULATION_MODES.map(simMode => {
                            const isOverLimit = simMode.count > limits.max_monte_carlo_sims
                            const isLocked = isOverLimit || (simMode.requiresAuth && !isAuthenticated)
                            const isSelected = !isLocked && simulations === simMode.count

                            return (
                                <button
                                    key={simMode.count}
                                    onClick={() => handleSimulationSelect(simMode.count, simMode.requiresAuth)}
                                    className={`relative overflow-hidden p-3 rounded-xl text-center transition-all duration-300 border ${isLocked
                                        ? isDark
                                            ? 'bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.1]'
                                            : 'bg-gray-100/50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                        : isSelected
                                            ? isDark
                                                ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/40 ring-1 ring-purple-500/30'
                                                : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 ring-1 ring-purple-200'
                                            : isDark
                                                ? 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12]'
                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                        }`}
                                >
                                    {isSelected && !isLocked && (
                                        <div className={`absolute inset-0 ${isDark
                                            ? 'bg-gradient-to-t from-purple-500/5 to-transparent'
                                            : 'bg-gradient-to-t from-purple-100/50 to-transparent'
                                            }`} />
                                    )}
                                    <div className={`relative font-bold flex items-center justify-center gap-1 ${isLocked
                                        ? isDark ? 'text-gray-500' : 'text-gray-400'
                                        : isSelected
                                            ? isDark ? 'text-purple-300' : 'text-purple-700'
                                            : isDark ? 'text-gray-200' : 'text-gray-700'
                                        }`}>
                                        {isLocked && <LockIcon className="w-3 h-3" />}
                                        {simMode.count}
                                    </div>
                                    <div className={`relative text-[10px] mt-0.5 ${isLocked
                                        ? isDark ? 'text-gray-600' : 'text-gray-400'
                                        : isSelected
                                            ? isDark ? 'text-purple-400/70' : 'text-purple-600/70'
                                            : isDark ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                        {simMode.label}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Initial Capital Configuration */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark
                ? 'bg-white/[0.02] border-white/[0.08]'
                : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark
                        ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20'
                        : 'bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200'
                        }`}>
                        <svg className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Starting Capital
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Initial portfolio value for the simulation
                        </p>
                    </div>
                </div>

                {/* Capital Input */}
                <div>
                    <div className={`relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                        <input
                            type="number"
                            value={initialCapital}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                onInitialCapitalChange(Math.max(0, value))
                            }}
                            className={`w-full pl-7 pr-4 py-3 rounded-xl border text-base font-medium transition-all ${isDark
                                ? 'bg-white/[0.03] border-white/[0.1] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30'
                                : 'bg-gray-50 border-gray-200 focus:border-amber-300 focus:ring-1 focus:ring-amber-200'
                                }`}
                            placeholder={defaultInitialCapital?.toLocaleString() || '100,000'}
                            min="0"
                            step="1000"
                        />
                    </div>
                    {defaultInitialCapital && defaultInitialCapital !== initialCapital && (
                        <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Backtest used: ${defaultInitialCapital.toLocaleString()}
                            </p>
                            <button
                                onClick={() => onInitialCapitalChange(defaultInitialCapital)}
                                className={`text-xs font-medium transition-colors ${isDark
                                    ? 'text-amber-400 hover:text-amber-300'
                                    : 'text-amber-600 hover:text-amber-700'
                                    }`}
                            >
                                Reset to backtest value
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {[10000, 25000, 50000, 100000, 250000, 500000, 1000000].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => onInitialCapitalChange(amount)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${initialCapital === amount
                                ? isDark
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-amber-100 text-amber-700 border border-amber-300'
                                : isDark
                                    ? 'bg-white/[0.02] text-gray-400 border border-white/[0.08] hover:bg-white/[0.05]'
                                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            {amount >= 1000000 ? `$${amount / 1000000}M` : `$${amount / 1000}k`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cashflow Configuration - Optional */}
            {onCashflowConfigChange && (
                <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark
                    ? 'bg-white/[0.02] border-white/[0.08]'
                    : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark
                                ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20'
                                : 'bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-200'
                                }`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Simulate Cashflows
                                </h3>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Model periodic contributions or withdrawals
                                </p>
                            </div>
                        </div>
                        {/* Toggle Switch */}
                        <button
                            onClick={handleCashflowToggle}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${cashflowConfig?.enabled
                                ? isDark ? 'bg-teal-500' : 'bg-teal-600'
                                : isDark ? 'bg-white/10' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${cashflowConfig?.enabled ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Cashflow Settings - Only shown when enabled */}
                    {cashflowConfig?.enabled && (
                        <div className="space-y-4 pt-2">
                            {/* Amount Input */}
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Amount per Period
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className={`relative flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$</span>
                                        <input
                                            type="number"
                                            value={Math.abs(cashflowConfig.amount)}
                                            onChange={(e) => {
                                                const absValue = Math.abs(parseFloat(e.target.value) || 0)
                                                const sign = cashflowConfig.amount < 0 ? -1 : 1
                                                handleCashflowAmountChange(absValue * sign)
                                            }}
                                            className={`w-full pl-7 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${isDark
                                                ? 'bg-white/[0.03] border-white/[0.1] focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30'
                                                : 'bg-gray-50 border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200'
                                                }`}
                                            placeholder="500"
                                            min="0"
                                            step="100"
                                        />
                                    </div>
                                    {/* Contribution/Withdrawal Toggle */}
                                    <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-white/[0.1]' : 'border-gray-200'}`}>
                                        <button
                                            onClick={() => handleCashflowAmountChange(Math.abs(cashflowConfig.amount))}
                                            className={`px-3 py-2 text-xs font-medium transition-colors ${cashflowConfig.amount >= 0
                                                ? isDark
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                : isDark
                                                    ? 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05]'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            +Add
                                        </button>
                                        <button
                                            onClick={() => handleCashflowAmountChange(-Math.abs(cashflowConfig.amount))}
                                            className={`px-3 py-2 text-xs font-medium transition-colors ${cashflowConfig.amount < 0
                                                ? isDark
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-red-100 text-red-700'
                                                : isDark
                                                    ? 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05]'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            −Withdraw
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Frequency Selection */}
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Frequency
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CASHFLOW_FREQUENCIES.map((freq) => (
                                        <button
                                            key={freq.value}
                                            onClick={() => handleCashflowFrequencyChange(freq.value)}
                                            className={`p-2.5 rounded-xl text-center transition-all duration-200 border ${cashflowConfig.frequency === freq.value
                                                ? isDark
                                                    ? 'bg-teal-500/20 border-teal-500/40 ring-1 ring-teal-500/30'
                                                    : 'bg-teal-50 border-teal-300 ring-1 ring-teal-200'
                                                : isDark
                                                    ? 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className={`text-xs font-semibold ${cashflowConfig.frequency === freq.value
                                                ? isDark ? 'text-teal-300' : 'text-teal-700'
                                                : isDark ? 'text-gray-200' : 'text-gray-700'
                                                }`}>
                                                {freq.label}
                                            </div>
                                            <div className={`text-[10px] mt-0.5 ${cashflowConfig.frequency === freq.value
                                                ? isDark ? 'text-teal-400/70' : 'text-teal-600/70'
                                                : isDark ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                {freq.description}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary Info */}
                            <div className={`flex items-center gap-2 p-3 rounded-xl ${cashflowConfig.amount >= 0
                                ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                                : isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                                }`}>
                                <svg className={`w-4 h-4 flex-shrink-0 ${cashflowConfig.amount >= 0
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span className={`text-xs ${cashflowConfig.amount >= 0
                                    ? isDark ? 'text-emerald-300' : 'text-emerald-700'
                                    : isDark ? 'text-red-300' : 'text-red-700'
                                    }`}>
                                    {cashflowConfig.amount >= 0 ? 'Contributing' : 'Withdrawing'}{' '}
                                    <strong>${Math.abs(cashflowConfig.amount).toLocaleString()}</strong>{' '}
                                    {cashflowConfig.frequency} over {projectionYears} years
                                    {' '}= <strong>${(Math.abs(cashflowConfig.amount) * (cashflowConfig.frequency === 'weekly' ? 52 : cashflowConfig.frequency === 'monthly' ? 12 : cashflowConfig.frequency === 'quarterly' ? 4 : 1) * projectionYears).toLocaleString()}</strong> total
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Analysis Includes - Premium Grid */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark
                ? 'bg-white/[0.02] border-white/[0.08]'
                : 'bg-white border-gray-200'
                }`}>
                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Analysis Includes
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <AnalysisItem
                        isDark={isDark}
                        icon={<TrendUpIcon />}
                        text={`Expected CAGR range over ${projectionYears} years`}
                        color="emerald"
                    />
                    <AnalysisItem
                        isDark={isDark}
                        icon={<TargetIcon />}
                        text={`Probability of loss after ${projectionYears} years`}
                        color="amber"
                    />
                    <AnalysisItem
                        isDark={isDark}
                        icon={<TrendDownIcon />}
                        text="Maximum drawdown risk analysis"
                        color="red"
                    />
                    <AnalysisItem
                        isDark={isDark}
                        icon={<ChartIcon />}
                        text="Portfolio outcome distribution"
                        color="purple"
                    />
                    <AnalysisItem
                        isDark={isDark}
                        icon={<CurrencyIcon />}
                        text="Final portfolio value scenarios"
                        color="blue"
                    />
                    <AnalysisItem
                        isDark={isDark}
                        icon={<ScaleIcon />}
                        text="Risk-adjusted return metrics"
                        color="cyan"
                    />
                </div>
            </div>

            {/* Start Button - Premium Gradient */}
            <div className="space-y-3">
                <button
                    onClick={onStart}
                    className={`group relative w-full py-4 px-5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${isDark
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
                        : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35'
                        }`}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <svg className="w-5 h-5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="relative">Run {simulations} × {projectionYears}-Year Simulations</span>
                </button>

                <div className={`flex items-center justify-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Estimated time: <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{estimatedTime}</span></span>
                </div>

            </div>
        </div>
    )
}
