import React, { memo } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'
import { LoadingSection, ResultsSection } from './sections'
import type { RetirementSimulationResponse } from '../../services/api'
import type { ChartDataPoint, CashflowFrequency } from './types'

export interface RetirementResultsModalProps {
    isOpen: boolean
    onClose: () => void
    isLoading: boolean
    results: RetirementSimulationResponse | null
    chartData: ChartDataPoint[]
    currentAgeNum: number
    retirementAgeNum: number
    lifeExpectancyNum: number
    yearsToRetirement: number
    yearsInRetirement: number
    initialSavings: string
    contributionAmount: string
    contributionFrequency: CashflowFrequency
    spendingAmount: string
    spendingFrequency: CashflowFrequency
    // Optional: Public calculator context for lead generation
    publicCalculatorContext?: {
        language: 'en'
        primaryColor: string
        firmName: string
        contactPageUrl?: string
        websiteUrl?: string
    }
}

const RetirementResultsModalComponent: React.FC<RetirementResultsModalProps> = ({
    isOpen,
    onClose,
    isLoading,
    results,
    chartData,
    currentAgeNum,
    retirementAgeNum,
    lifeExpectancyNum,
    yearsToRetirement,
    yearsInRetirement,
    initialSavings,
    contributionAmount,
    contributionFrequency,
    spendingAmount,
    spendingFrequency,
    publicCalculatorContext
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
            <div className={`rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col ${isDark ? 'bg-black border border-white/[0.15]' : 'bg-white border border-gray-200'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-200'}`}>
                    <div>
                        <h1 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {isLoading ? 'Running Simulation...' : 'Simulation Results'}
                        </h1>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {isLoading
                                ? 'Generating Monte Carlo scenarios'
                                : `${lifeExpectancyNum - currentAgeNum} year projection • Age ${currentAgeNum} to ${lifeExpectancyNum}`
                            }
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Schedule Consultation Button - Public Calculator Only */}
                        {!isLoading && publicCalculatorContext && (publicCalculatorContext.contactPageUrl || publicCalculatorContext.websiteUrl) && (
                            <a
                                href={publicCalculatorContext.contactPageUrl || publicCalculatorContext.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 text-xs font-semibold text-white hover:opacity-90 ${
                                    isDark 
                                        ? 'bg-indigo-500 hover:bg-indigo-400' 
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{publicCalculatorContext.language === 'fr' ? 'Prendre rendez-vous' : 'Schedule Consultation'}</span>
                            </a>
                        )}

                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${isDark
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
                <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isDark ? 'bg-black' : 'bg-gray-50/50'}`}>
                    {isLoading && (
                        <LoadingSection
                            isDark={isDark}
                            totalYears={lifeExpectancyNum - currentAgeNum}
                        />
                    )}

                    {!isLoading && results?.results && (
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
                            onReset={onClose}
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}

export const RetirementResultsModal = memo(RetirementResultsModalComponent)
RetirementResultsModal.displayName = 'RetirementResultsModal'

export default RetirementResultsModal

