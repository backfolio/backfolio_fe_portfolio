/**
 * OnboardingModal - User type selection modal shown after first login.
 * 
 * Asks users: "How will you use Backfolio?"
 * - Personal Use: For individual investors managing their own portfolios
 * - Professional/Advisor: For financial advisors serving clients
 */

import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { UserType } from '../../services/api'

interface OnboardingModalProps {
    isOpen: boolean
    onComplete: (userType: UserType) => Promise<void>
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
    const [selectedType, setSelectedType] = useState<UserType>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!selectedType) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onComplete(selectedType)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
            setIsSubmitting(false)
        }
    }

    const options = [
        {
            type: 'personal' as const,
            title: 'Personal Use',
            description: 'I want to analyze and manage my own investment portfolios',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            features: [
                'Build and backtest portfolio strategies',
                'Run Monte Carlo simulations',
                'Track deployed strategies with alerts',
            ],
        },
        {
            type: 'advisor' as const,
            title: 'Financial Advisor',
            description: 'I work with clients and need professional analysis tools',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            features: [
                'Retirement planning with Monte Carlo',
                'Generate branded PDF reports',
                'Share analysis with clients',
            ],
        },
    ]

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome to Backfolio
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        How will you be using Backfolio?
                    </p>
                </div>

                {/* Options */}
                <div className="px-8 py-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {options.map((option) => (
                            <button
                                key={option.type}
                                onClick={() => setSelectedType(option.type)}
                                className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                                    selectedType === option.type
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                                }`}
                            >
                                {/* Selection indicator */}
                                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    selectedType === option.type
                                        ? 'border-purple-500 bg-purple-500'
                                        : 'border-gray-300 dark:border-slate-600'
                                }`}>
                                    {selectedType === option.type && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                                    selectedType === option.type
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                    {option.icon}
                                </div>

                                {/* Content */}
                                <h3 className={`text-lg font-semibold mb-1 ${
                                    selectedType === option.type
                                        ? 'text-purple-700 dark:text-purple-300'
                                        : 'text-gray-900 dark:text-white'
                                }`}>
                                    {option.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {option.description}
                                </p>

                                {/* Features */}
                                <ul className="space-y-2">
                                    {option.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-500">
                                            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                selectedType === option.type ? 'text-purple-500' : 'text-gray-400'
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        ))}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            You can change this later in settings
                        </p>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedType || isSubmitting}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                selectedType && !isSubmitting
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}

export default OnboardingModal

