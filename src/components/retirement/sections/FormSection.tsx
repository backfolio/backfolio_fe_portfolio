import { memo, useState } from 'react'
import { TickerSearchInput } from '../../backtest/components/TickerSearchInput'
import { RETIREMENT_PRESETS, REBALANCING_OPTIONS, CASHFLOW_FREQUENCY_OPTIONS } from '../constants'
import type { CashflowFrequency } from '../types'
import type { FormSectionProps } from '../types'

const FormSectionComponent: React.FC<FormSectionProps> = ({
    isDark,
    mode = 'check',
    primaryColor,
    currentAge,
    setCurrentAge,
    retirementAge,
    setRetirementAge,
    lifeExpectancy,
    setLifeExpectancy,
    yearsToRetirement,
    yearsInRetirement,
    initialSavings,
    setInitialSavings,
    contributionAmount,
    setContributionAmount,
    contributionFrequency,
    setContributionFrequency,
    spendingAmount,
    setSpendingAmount,
    spendingFrequency,
    setSpendingFrequency,
    portfolioAssets,
    onAddAsset,
    onRemoveAsset,
    onUpdateSymbol,
    onUpdateWeight,
    onLoadPreset,
    totalWeight,
    isWeightValid,
    rebalancingFrequency,
    setRebalancingFrequency,
    formErrors,
    canSubmit,
    onSubmit
}) => {
    const [showPresets, setShowPresets] = useState(false)
    const isCheckMode = mode === 'check'

    // Frequency options with labels
    const frequencyLabels: Record<string, string> = {
        weekly: 'Weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        yearly: 'Yearly',
        none: 'Never'
    }

    const translatedFrequencyOptions = CASHFLOW_FREQUENCY_OPTIONS.map(opt => ({
        value: opt.value,
        label: frequencyLabels[opt.value]
    }))

    const translatedRebalanceOptions = REBALANCING_OPTIONS.map(opt => ({
        value: opt.value,
        label: frequencyLabels[opt.value]
    }))

    // Use primaryColor or default violet
    const accentColor = primaryColor || '#8b5cf6'

    return (
        <div className="space-y-8">
            {/* Your Journey Section */}
            <div className={`rounded-3xl overflow-hidden ${isDark
                ? 'bg-slate-900 border border-slate-800'
                : 'bg-white border border-slate-200 shadow-sm'
                }`}>

                {/* Section Header */}
                <div className="px-6 sm:px-10 pt-8 sm:pt-10">
                    <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Your Journey
                    </h2>
                    <p className={`text-base mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Define your timeline and financial goals
                    </p>
                </div>

                {/* Visual Timeline */}
                {(parseInt(currentAge) > 0 && parseInt(retirementAge) > parseInt(currentAge)) && (
                    <div className={`mx-6 sm:mx-10 mt-8 p-6 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <div className="flex items-center justify-between gap-4">
                            {/* Today */}
                            <div className="text-center flex-shrink-0">
                                <div
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-bold text-2xl sm:text-3xl shadow-lg"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {currentAge}
                                </div>
                                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Today
                                </p>
                            </div>

                            {/* Journey Line 1 */}
                            <div className="flex-1 relative">
                                <div className={`h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: yearsToRetirement > 0 ? `${Math.min((yearsToRetirement / (yearsToRetirement + yearsInRetirement)) * 100, 100)}%` : '50%',
                                            backgroundColor: accentColor
                                        }}
                                    />
                                </div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <span
                                        className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {yearsToRetirement} years to grow
                                    </span>
                                </div>
                            </div>

                            {/* Retirement */}
                            <div className="text-center flex-shrink-0">
                                <div
                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-2xl sm:text-3xl border-2 ${isDark
                                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                                        : 'border-emerald-500 text-emerald-600 bg-emerald-50'}`}
                                >
                                    {retirementAge}
                                </div>
                                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Retire
                                </p>
                            </div>

                            {/* Journey Line 2 */}
                            <div className="flex-1 relative">
                                <div className={`h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                    <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 text-white">
                                        {yearsInRetirement} years
                                    </span>
                                </div>
                            </div>

                            {/* End */}
                            <div className="text-center flex-shrink-0">
                                <div
                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-2xl sm:text-3xl ${isDark
                                        ? 'bg-slate-800 text-slate-500'
                                        : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {lifeExpectancy}
                                </div>
                                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Horizon
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Age Input Cards - Big Numbers Style */}
                <div className="px-6 sm:px-10 py-8 sm:py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        {/* Current Age Card */}
                        <div className={`group rounded-2xl p-6 transition-all duration-200 ${isDark
                            ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                            : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${accentColor}15` }}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        style={{ color: accentColor }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Current Age
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={currentAge}
                                    onChange={(e) => setCurrentAge(e.target.value)}
                                    placeholder="35"
                                    className={`w-full text-4xl sm:text-5xl font-bold py-2 px-0 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark
                                        ? 'text-white border-slate-600 focus:border-violet-500 placeholder:text-slate-700'
                                        : 'text-slate-900 border-slate-300 focus:border-violet-500 placeholder:text-slate-300'
                                        }`}
                                />
                                <span className={`absolute right-0 bottom-4 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    years
                                </span>
                            </div>
                        </div>

                        {/* Retirement Age Card */}
                        <div className={`group rounded-2xl p-6 transition-all duration-200 ${isDark
                            ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                            : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                    <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Retirement Age
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={retirementAge}
                                    onChange={(e) => setRetirementAge(e.target.value)}
                                    placeholder="65"
                                    className={`w-full text-4xl sm:text-5xl font-bold py-2 px-0 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark
                                        ? 'text-white border-slate-600 focus:border-emerald-500 placeholder:text-slate-700'
                                        : 'text-slate-900 border-slate-300 focus:border-emerald-500 placeholder:text-slate-300'
                                        }`}
                                />
                                <span className={`absolute right-0 bottom-4 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    years
                                </span>
                            </div>
                        </div>

                        {/* Planning Horizon Card */}
                        <div className={`group rounded-2xl p-6 transition-all duration-200 ${isDark
                            ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                            : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                    <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Planning Horizon
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={lifeExpectancy}
                                    onChange={(e) => setLifeExpectancy(e.target.value)}
                                    placeholder="90"
                                    className={`w-full text-4xl sm:text-5xl font-bold py-2 px-0 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark
                                        ? 'text-white border-slate-600 focus:border-blue-500 placeholder:text-slate-700'
                                        : 'text-slate-900 border-slate-300 focus:border-blue-500 placeholder:text-slate-300'
                                        }`}
                                />
                                <span className={`absolute right-0 bottom-4 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    years
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Section */}
            <div className={`rounded-3xl overflow-hidden ${isDark
                ? 'bg-slate-900 border border-slate-800'
                : 'bg-white border border-slate-200 shadow-sm'
                }`}>
                {/* Section Header */}
                <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6">
                    <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Your Finances
                    </h2>
                    <p className={`text-base mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        What you've saved and plan to save
                    </p>
                </div>

                {/* Financial Inputs - Big Money Cards */}
                <div className={`px-6 sm:px-10 pb-8 sm:pb-10 grid grid-cols-1 ${isCheckMode ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-6`}>
                    {/* Current Savings - Hero Card */}
                    <div className={`rounded-2xl p-6 sm:p-8 ${isDark
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        }`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <label className="text-sm font-medium text-white/80">
                                Current Savings
                            </label>
                        </div>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-white/60">$</span>
                            <input
                                type="text"
                                value={initialSavings ? parseInt(initialSavings.replace(/,/g, ''), 10).toLocaleString('en-US') : ''}
                                onChange={(e) => setInitialSavings(e.target.value.replace(/[^\d]/g, ''))}
                                placeholder="500,000"
                                className="w-full text-3xl sm:text-4xl font-bold py-2 pl-8 pr-0 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors text-white border-white/30 focus:border-white placeholder:text-white/30"
                            />
                        </div>
                        <p className="text-sm mt-3 text-white/60">
                            Total invested today
                        </p>
                    </div>

                    {/* Monthly Contribution */}
                    <div className={`rounded-2xl p-6 sm:p-8 ${isDark
                        ? 'bg-slate-800/50 border border-slate-700'
                        : 'bg-slate-50 border border-slate-200'
                        }`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                Contribution
                            </label>
                        </div>
                        <div className="flex items-end gap-3">
                            <div className="relative flex-1">
                                <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                                <input
                                    type="text"
                                    value={contributionAmount ? parseInt(contributionAmount.replace(/,/g, ''), 10).toLocaleString('en-US') : ''}
                                    onChange={(e) => setContributionAmount(e.target.value.replace(/[^\d]/g, ''))}
                                    placeholder="2,000"
                                    className={`w-full text-2xl sm:text-3xl font-bold py-2 pl-7 pr-0 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors ${isDark
                                        ? 'text-white border-slate-600 focus:border-emerald-500 placeholder:text-slate-700'
                                        : 'text-slate-900 border-slate-300 focus:border-emerald-500 placeholder:text-slate-300'
                                        }`}
                                />
                            </div>
                            <select
                                value={contributionFrequency}
                                onChange={(e) => setContributionFrequency(e.target.value as CashflowFrequency)}
                                className={`text-sm font-medium px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer mb-2 ${isDark
                                    ? 'bg-slate-800 border-slate-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-900'
                                    }`}
                            >
                                {translatedFrequencyOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value} className={isDark ? 'bg-slate-800' : ''}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className={`text-sm mt-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Until retirement
                        </p>
                    </div>

                    {/* Withdrawal / Calculate Info */}
                    {isCheckMode ? (
                        <div className={`rounded-2xl p-6 sm:p-8 ${isDark
                            ? 'bg-slate-800/50 border border-slate-700'
                            : 'bg-slate-50 border border-slate-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
                                    <svg className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </div>
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Withdrawal
                                </label>
                            </div>
                            <div className="flex items-end gap-3">
                                <div className="relative flex-1">
                                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                                    <input
                                        type="text"
                                        value={spendingAmount ? parseInt(spendingAmount.replace(/,/g, ''), 10).toLocaleString('en-US') : ''}
                                        onChange={(e) => setSpendingAmount(e.target.value.replace(/[^\d]/g, ''))}
                                        placeholder="5,000"
                                        className={`w-full text-2xl sm:text-3xl font-bold py-2 pl-7 pr-0 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors ${isDark
                                            ? 'text-white border-slate-600 focus:border-rose-500 placeholder:text-slate-700'
                                            : 'text-slate-900 border-slate-300 focus:border-rose-500 placeholder:text-slate-300'
                                            }`}
                                    />
                                </div>
                                <select
                                    value={spendingFrequency}
                                    onChange={(e) => setSpendingFrequency(e.target.value as CashflowFrequency)}
                                    className={`text-sm font-medium px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer mb-2 ${isDark
                                        ? 'bg-slate-800 border-slate-600 text-white'
                                        : 'bg-white border-slate-200 text-slate-900'
                                        }`}
                                >
                                    {translatedFrequencyOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value} className={isDark ? 'bg-slate-800' : ''}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className={`text-sm mt-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                In retirement
                            </p>
                        </div>
                    ) : (
                        <div className={`rounded-2xl p-6 sm:p-8 border-2 border-dashed ${isDark
                            ? 'border-violet-500/30 bg-violet-500/5'
                            : 'border-violet-300 bg-violet-50'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                                    <svg className={`w-6 h-6 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-base font-semibold ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>
                                        We'll Calculate This
                                    </p>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-violet-400/70' : 'text-violet-600/70'}`}>
                                        Based on your savings and goals, we will determine a safe withdrawal rate
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Portfolio Section */}
            <div className={`rounded-3xl overflow-hidden ${isDark
                ? 'bg-slate-900 border border-slate-800'
                : 'bg-white border border-slate-200 shadow-sm'
                }`}>
                <div className="px-6 sm:px-10 pt-8 sm:pt-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Portfolio Allocation
                            </h2>
                            <p className={`text-base mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Select your investment mix
                            </p>
                        </div>

                        {/* Preset dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPresets(!showPresets)}
                                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors flex items-center gap-2 ${isDark
                                    ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Load Preset
                            </button>

                            {showPresets && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowPresets(false)} />
                                    <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${isDark
                                        ? 'bg-slate-800 border-slate-700'
                                        : 'bg-white border-slate-200'
                                        }`}>
                                        <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Select a Template
                                            </p>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {Object.entries(RETIREMENT_PRESETS).map(([name, { allocation, description }]) => (
                                                <button
                                                    key={name}
                                                    onClick={() => {
                                                        onLoadPreset(name)
                                                        setShowPresets(false)
                                                    }}
                                                    className={`w-full text-left px-4 py-3 transition-colors ${isDark
                                                        ? 'hover:bg-slate-700'
                                                        : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                        {name}
                                                    </div>
                                                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {description}
                                                    </div>
                                                    <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {Object.entries(allocation).map(([sym, w]) => `${sym} ${Math.round(w * 100)}%`).join(' · ')}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Asset list */}
                <div className="px-6 sm:px-10 py-6 space-y-3">
                    {portfolioAssets.map((asset) => (
                        <div
                            key={asset.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl ${isDark
                                ? 'bg-slate-800/50 border border-slate-700'
                                : 'bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <div className="flex-1">
                                <TickerSearchInput
                                    value={asset.symbol}
                                    onChange={(symbol) => onUpdateSymbol(asset.id, symbol)}
                                    placeholder="Search ticker..."
                                    isDark={isDark}
                                    className={`w-full px-4 py-3 text-sm font-semibold border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${isDark
                                        ? 'bg-slate-900 border-slate-600 text-white'
                                        : 'bg-white border-slate-200 text-slate-900'
                                        }`}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={Math.round(asset.weight * 100) || ''}
                                    onChange={(e) => onUpdateWeight(asset.id, Number(e.target.value))}
                                    min={0}
                                    max={100}
                                    placeholder="0"
                                    className={`w-24 px-4 py-3 text-lg font-bold text-right border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark
                                        ? 'bg-slate-900 border-slate-600 text-white'
                                        : 'bg-white border-slate-200 text-slate-900'
                                        }`}
                                />
                                <span className={`text-lg font-semibold w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>%</span>
                            </div>
                            <button
                                onClick={() => onRemoveAsset(asset.id)}
                                disabled={portfolioAssets.length <= 1}
                                className={`p-2.5 rounded-xl transition-colors disabled:opacity-30 ${isDark
                                    ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                    : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={onAddAsset}
                        disabled={portfolioAssets.length >= 10}
                        className={`w-full py-4 rounded-2xl border-2 border-dashed text-sm font-semibold transition-colors disabled:opacity-30 ${isDark
                            ? 'border-slate-700 text-slate-500 hover:border-violet-500/30 hover:text-violet-400'
                            : 'border-slate-300 text-slate-500 hover:border-violet-300 hover:text-violet-600'
                            }`}
                    >
                        + Add Asset ({portfolioAssets.length}/10)
                    </button>
                </div>

                {/* Footer: Weight total + Rebalancing */}
                <div className={`mx-6 sm:mx-10 mb-8 sm:mb-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total:</span>
                        <span className={`text-3xl font-bold tabular-nums ${isWeightValid
                            ? (isDark ? 'text-violet-400' : 'text-violet-600')
                            : 'text-red-500'}`}>
                            {Math.round(totalWeight * 100)}%
                        </span>
                        {!isWeightValid && (
                            <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                                Must equal 100%
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Rebalance:</span>
                        <select
                            value={rebalancingFrequency}
                            onChange={(e) => setRebalancingFrequency(e.target.value as typeof rebalancingFrequency)}
                            className={`text-sm font-medium px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer ${isDark
                                ? 'bg-slate-800 border-slate-600 text-white'
                                : 'bg-white border-slate-200 text-slate-900'
                                }`}
                        >
                            {translatedRebalanceOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className={isDark ? 'bg-slate-800' : ''}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Validation errors */}
            {formErrors.length > 0 && (
                <div className={`p-5 rounded-2xl border ${isDark
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-amber-50 border-amber-200'
                    }`}>
                    <ul className={`text-sm space-y-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        {formErrors.map((err, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {err}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={onSubmit}
                disabled={!canSubmit}
                className={`w-full py-5 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-3 ${canSubmit
                    ? 'text-white shadow-lg hover:shadow-xl transform hover:scale-[1.01]'
                    : isDark
                        ? 'bg-slate-800 text-slate-500 border border-slate-700'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                style={canSubmit ? { backgroundColor: accentColor } : undefined}
            >
                {isCheckMode ? (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Simulation
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Calculate My Budget
                    </>
                )}
            </button>
        </div>
    )
}

export const FormSection = memo(FormSectionComponent)
FormSection.displayName = 'FormSection'
