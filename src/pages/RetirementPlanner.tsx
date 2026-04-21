import { useState, useMemo, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import { FormSection } from '../components/retirement/sections'
import { ModeToggle } from '../components/retirement/components'
import { RetirementResultsModal } from '../components/retirement/RetirementResultsModal'
import { SafeWithdrawalResultsModal } from '../components/retirement/SafeWithdrawalResultsModal'
import {
    runRetirementSimulation,
    calculateSafeWithdrawal,
    type RetirementSimulationRequest,
    type RetirementSimulationResponse,
    type SafeWithdrawalRequest,
    type SafeWithdrawalResponse
} from '../services/api'
import { DEFAULT_FORM_VALUES, DEFAULT_PORTFOLIO_ASSETS, RETIREMENT_PRESETS, getMonthlyEquivalent } from '../components/retirement/constants'
import { buildPortfolio, validateForm, buildChartData, buildSafeWithdrawalChartData } from '../components/retirement/utils'
import type { PortfolioAsset, RebalancingFrequency, CashflowFrequency, PlannerMode } from '../components/retirement/types'

export default function RetirementPlanner() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Mode state
    const [mode, setMode] = useState<PlannerMode>('check')

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
    const [isLoading, setIsLoading] = useState(false)
    const [showResultsModal, setShowResultsModal] = useState(false)
    const [results, setResults] = useState<RetirementSimulationResponse | null>(null)
    const [safeWithdrawalResults, setSafeWithdrawalResults] = useState<SafeWithdrawalResponse | null>(null)
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

    // Chart data for safe withdrawal results
    const safeWithdrawalChartData = useMemo(() => {
        if (!safeWithdrawalResults?.simulation_results) return []
        return buildSafeWithdrawalChartData(safeWithdrawalResults, currentAgeNum, yearsToRetirement)
    }, [safeWithdrawalResults, currentAgeNum, yearsToRetirement])

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

    // Run simulation (Check My Plan mode)
    const handleRunSimulation = useCallback(async () => {
        if (!canSubmit) return

        setError(null)
        setIsLoading(true)
        setShowResultsModal(true)

        try {
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
            setIsLoading(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Simulation failed')
            setIsLoading(false)
            setShowResultsModal(false)
        }
    }, [canSubmit, currentAgeNum, retirementAgeNum, lifeExpectancyNum, initialSavings, contributionAmount, contributionFrequency, spendingAmount, spendingFrequency, portfolio, rebalancingFrequency])

    // Calculate safe withdrawal (Calculate My Budget mode)
    const handleCalculateBudget = useCallback(async () => {
        if (!canSubmit) return

        setError(null)
        setIsLoading(true)
        setShowResultsModal(true)

        try {
            const monthlyContribution = getMonthlyEquivalent(parseFloat(contributionAmount) || 0, contributionFrequency)

            const request: SafeWithdrawalRequest = {
                current_age: currentAgeNum,
                retirement_age: retirementAgeNum,
                life_expectancy: lifeExpectancyNum,
                initial_savings: parseFloat(initialSavings) || 0,
                monthly_contribution: monthlyContribution,
                portfolio,
                rebalancing: rebalancingFrequency,
                target_success_rates: [0.80, 0.90, 0.95]
            }

            const response = await calculateSafeWithdrawal(request)
            setSafeWithdrawalResults(response)
            setIsLoading(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Calculation failed')
            setIsLoading(false)
            setShowResultsModal(false)
        }
    }, [canSubmit, currentAgeNum, retirementAgeNum, lifeExpectancyNum, initialSavings, contributionAmount, contributionFrequency, portfolio, rebalancingFrequency])

    // Handle form submission based on mode
    const handleSubmit = useCallback(() => {
        if (mode === 'check') {
            handleRunSimulation()
        } else {
            handleCalculateBudget()
        }
    }, [mode, handleRunSimulation, handleCalculateBudget])

    const handleCloseResults = useCallback(() => {
        setShowResultsModal(false)
        setResults(null)
        setSafeWithdrawalResults(null)
    }, [])

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Retirement Analysis
                    </h1>
                    <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Monte Carlo simulation for retirement portfolio projections
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="mb-6">
                    <ModeToggle mode={mode} onChange={setMode} isDark={isDark} />
                </div>

                {/* Error Display */}
                {error && (
                    <div className={`mb-6 p-4 rounded-lg border ${isDark
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

                {/* Form */}
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
                    onSubmit={handleSubmit}
                    mode={mode}
                />

                {/* Disclaimer */}
                <div className={`mt-6 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p className="text-xs">
                        Results are probabilistic estimates. Past performance does not guarantee future results.
                    </p>
                </div>
            </div>

            {/* Results Modal - Check My Plan */}
            {mode === 'check' && (
                <RetirementResultsModal
                    isOpen={showResultsModal}
                    onClose={handleCloseResults}
                    isLoading={isLoading}
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
                />
            )}

            {/* Results Modal - Calculate My Budget */}
            {mode === 'calculate' && (
                <SafeWithdrawalResultsModal
                    isOpen={showResultsModal}
                    onClose={handleCloseResults}
                    isLoading={isLoading}
                    results={safeWithdrawalResults}
                    chartData={safeWithdrawalChartData}
                    currentAgeNum={currentAgeNum}
                    retirementAgeNum={retirementAgeNum}
                    lifeExpectancyNum={lifeExpectancyNum}
                    yearsToRetirement={yearsToRetirement}
                    yearsInRetirement={yearsInRetirement}
                    initialSavings={initialSavings}
                    contributionAmount={contributionAmount}
                    contributionFrequency={contributionFrequency}
                />
            )}
        </Layout>
    )
}
