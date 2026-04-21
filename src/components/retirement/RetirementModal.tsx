import React, { useState, useMemo, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'
import { runRetirementSimulation, type RetirementSimulationRequest, type RetirementSimulationResponse } from '../../services/api'
import { FormSection, LoadingSection, ResultsSection } from './sections'
import { DEFAULT_FORM_VALUES, DEFAULT_PORTFOLIO_ASSETS, RETIREMENT_PRESETS, getMonthlyEquivalent } from './constants'
import { buildPortfolio, validateForm, buildChartData } from './utils'
import type { ViewState, PortfolioAsset, RebalancingFrequency, CashflowFrequency } from './types'

export interface RetirementModalProps {
    isOpen: boolean
    onClose: () => void
}

const RetirementModalComponent: React.FC<RetirementModalProps> = ({ isOpen, onClose }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Form state - Client Information
    const [currentAge, setCurrentAge] = useState(DEFAULT_FORM_VALUES.currentAge)
    const [retirementAge, setRetirementAge] = useState(DEFAULT_FORM_VALUES.retirementAge)
    const [lifeExpectancy, setLifeExpectancy] = useState(DEFAULT_FORM_VALUES.lifeExpectancy)
    const [initialSavings, setInitialSavings] = useState(DEFAULT_FORM_VALUES.initialSavings)
    const [contributionAmount, setContributionAmount] = useState(DEFAULT_FORM_VALUES.contributionAmount)
    const [contributionFrequency, setContributionFrequency] = useState<CashflowFrequency>(DEFAULT_FORM_VALUES.contributionFrequency)
    const [spendingAmount, setSpendingAmount] = useState(DEFAULT_FORM_VALUES.spendingAmount)
    const [spendingFrequency, setSpendingFrequency] = useState<CashflowFrequency>(DEFAULT_FORM_VALUES.spendingFrequency)

    // Portfolio state
    const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>(
        DEFAULT_PORTFOLIO_ASSETS.map((a, i) => ({ ...a, id: `asset-${i}` }))
    )
    const [rebalancingFrequency, setRebalancingFrequency] = useState<RebalancingFrequency>(
        DEFAULT_FORM_VALUES.rebalancingFrequency
    )

    // Results state
    const [view, setView] = useState<ViewState>('form')
    const [results, setResults] = useState<RetirementSimulationResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Computed values
    const totalWeight = portfolioAssets.reduce((sum, a) => sum + a.weight, 0)
    const isWeightValid = Math.abs(totalWeight - 1.0) < 0.001

    const currentAgeNum = parseInt(currentAge) || 0
    const retirementAgeNum = parseInt(retirementAge) || 0
    const lifeExpectancyNum = parseInt(lifeExpectancy) || 0
    const yearsToRetirement = retirementAgeNum - currentAgeNum
    const yearsInRetirement = lifeExpectancyNum - retirementAgeNum

    // Build portfolio
    const portfolio = useMemo(() => buildPortfolio(portfolioAssets), [portfolioAssets])

    // Validation
    const formErrors = useMemo(() => validateForm(
        currentAgeNum, retirementAgeNum, lifeExpectancyNum, isWeightValid, portfolio, initialSavings
    ), [currentAgeNum, retirementAgeNum, lifeExpectancyNum, isWeightValid, portfolio, initialSavings])

    const canSubmit = formErrors.length === 0

    // Chart data
    const chartData = useMemo(() => {
        if (!results) return []
        return buildChartData(results, currentAgeNum, yearsToRetirement)
    }, [results, currentAgeNum, yearsToRetirement])

    // Portfolio management
    const handleAddAsset = useCallback(() => {
        if (portfolioAssets.length >= 10) return
        setPortfolioAssets(prev => [
            ...prev,
            { id: `asset-${Date.now()}`, symbol: '', weight: 0 }
        ])
    }, [portfolioAssets.length])

    const handleRemoveAsset = useCallback((id: string) => {
        setPortfolioAssets(prev => {
            if (prev.length <= 1) return prev
            return prev.filter(a => a.id !== id)
        })
    }, [])

    const handleUpdateSymbol = useCallback((id: string, symbol: string) => {
        setPortfolioAssets(prev => prev.map(a =>
            a.id === id ? { ...a, symbol: symbol.toUpperCase() } : a
        ))
    }, [])

    const handleUpdateWeight = useCallback((id: string, weightPercent: number) => {
        setPortfolioAssets(prev => prev.map(a =>
            a.id === id ? { ...a, weight: weightPercent / 100 } : a
        ))
    }, [])

    const handleLoadPreset = useCallback((presetName: string) => {
        const preset = RETIREMENT_PRESETS[presetName]
        if (!preset) return

        const assets = Object.entries(preset.allocation).map(([symbol, weight], idx) => ({
            id: `preset-${idx}-${Date.now()}`,
            symbol,
            weight
        }))
        setPortfolioAssets(assets)
    }, [])

    // Run simulation
    const handleRunSimulation = useCallback(async () => {
        if (!canSubmit) return

        setError(null)
        setView('loading')

        try {
            // Convert to monthly equivalents for the API
            const monthlyContribution = getMonthlyEquivalent(parseFloat(contributionAmount) || 0, contributionFrequency)
            const monthlySpending = getMonthlyEquivalent(parseFloat(spendingAmount) || 0, spendingFrequency)

            const request: RetirementSimulationRequest = {
                current_age: currentAgeNum,
                retirement_age: retirementAgeNum,
                life_expectancy: lifeExpectancyNum,
                initial_savings: parseFloat(initialSavings) || 0,
                monthly_contribution: monthlyContribution,
                monthly_spending: monthlySpending,
                portfolio,
                rebalancing: rebalancingFrequency,
                n_simulations: DEFAULT_FORM_VALUES.nSimulations
            }

            const response = await runRetirementSimulation(request)
            setResults(response)
            setView('results')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Simulation failed')
            setView('form')
        }
    }, [canSubmit, currentAgeNum, retirementAgeNum, lifeExpectancyNum, initialSavings, contributionAmount, contributionFrequency, spendingAmount, spendingFrequency, portfolio, rebalancingFrequency])

    const handleReset = useCallback(() => {
        setResults(null)
        setView('form')
        setError(null)
    }, [])

    // Handle close with reset
    const handleClose = useCallback(() => {
        handleReset()
        onClose()
    }, [handleReset, onClose])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 md:p-4">
            <div className={`border rounded-xl shadow-xl w-full max-w-5xl h-[98vh] md:h-[95vh] overflow-hidden flex flex-col ${isDark ? 'bg-black border-white/[0.08]' : 'bg-white border-gray-200'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}`}>
                            <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Retirement Analysis
                            </h1>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Monte Carlo portfolio simulation
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Method indicator */}
                        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${isDark
                            ? 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Block Bootstrap
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-black' : 'bg-gray-50/50'}`}>
                    {/* Error Display */}
                    {error && (
                        <div className={`mb-6 p-4 rounded-xl border ${isDark
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-red-50 border-red-200 text-red-700'
                            }`}>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Form View */}
                    {view === 'form' && (
                        <FormSection
                            isDark={isDark}
                            currentAge={currentAge}
                            setCurrentAge={setCurrentAge}
                            retirementAge={retirementAge}
                            setRetirementAge={setRetirementAge}
                            lifeExpectancy={lifeExpectancy}
                            setLifeExpectancy={setLifeExpectancy}
                            yearsToRetirement={yearsToRetirement}
                            yearsInRetirement={yearsInRetirement}
                            initialSavings={initialSavings}
                            setInitialSavings={setInitialSavings}
                            contributionAmount={contributionAmount}
                            setContributionAmount={setContributionAmount}
                            contributionFrequency={contributionFrequency}
                            setContributionFrequency={setContributionFrequency}
                            spendingAmount={spendingAmount}
                            setSpendingAmount={setSpendingAmount}
                            spendingFrequency={spendingFrequency}
                            setSpendingFrequency={setSpendingFrequency}
                            portfolioAssets={portfolioAssets}
                            onAddAsset={handleAddAsset}
                            onRemoveAsset={handleRemoveAsset}
                            onUpdateSymbol={handleUpdateSymbol}
                            onUpdateWeight={handleUpdateWeight}
                            onLoadPreset={handleLoadPreset}
                            totalWeight={totalWeight}
                            isWeightValid={isWeightValid}
                            rebalancingFrequency={rebalancingFrequency}
                            setRebalancingFrequency={setRebalancingFrequency}
                            formErrors={formErrors}
                            canSubmit={canSubmit}
                            onSubmit={handleRunSimulation}
                        />
                    )}

                    {/* Loading View */}
                    {view === 'loading' && (
                        <LoadingSection
                            isDark={isDark}
                            totalYears={lifeExpectancyNum - currentAgeNum}
                        />
                    )}

                    {/* Results View */}
                    {view === 'results' && results?.results && (
                        <ResultsSection
                            isDark={isDark}
                            results={results}
                            chartData={chartData}
                            currentAgeNum={currentAgeNum}
                            retirementAgeNum={retirementAgeNum}
                            lifeExpectancyNum={lifeExpectancyNum}
                            yearsToRetirement={yearsToRetirement}
                            yearsInRetirement={yearsInRetirement}
                            initialSavings={initialSavings}
                            contributionAmount={contributionAmount}
                            contributionFrequency={contributionFrequency}
                            spendingAmount={spendingAmount}
                            spendingFrequency={spendingFrequency}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}

export const RetirementModal = memo(RetirementModalComponent)
RetirementModal.displayName = 'RetirementModal'

export default RetirementModal

