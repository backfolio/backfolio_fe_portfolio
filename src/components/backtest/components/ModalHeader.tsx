import React, { useState } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { handleExport } from '../utils/backtestFormatters'
import { BacktestResult } from '../types/backtestResults'
import { createShare } from '../../../services/api'
import type { StrategyDSL } from '../../../types/strategy'

interface ModalHeaderProps {
    result: BacktestResult
    portfolioData: any[]
    returnsData: any[]
    onClose: () => void
    onSaveStrategy?: () => void
    strategy?: StrategyDSL
    canvasState?: { edges: any[]; positions: Record<string, any> }
    strategyName?: string
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    result,
    portfolioData,
    returnsData,
    onClose,
    onSaveStrategy,
    strategy,
    canvasState,
    strategyName
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [isSharing, setIsSharing] = useState(false)
    const [shareCopied, setShareCopied] = useState(false)

    // Calculate date range and trading days from portfolio data
    const tradingDays = portfolioData.length
    let dateRange = ''
    if (tradingDays > 0) {
        const startDate = new Date(portfolioData[0].date)
        const endDate = new Date(portfolioData[tradingDays - 1].date)
        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }
        dateRange = `${formatDate(startDate)} — ${formatDate(endDate)}`
    }

    const handleShare = async () => {
        if (isSharing || !strategy) return

        setIsSharing(true)
        setShareCopied(false)

        try {
            const response = await createShare({
                strategy_dsl: strategy as unknown as Record<string, unknown>,
                canvas_state: canvasState as Record<string, unknown>,
            })

            if (response.success && response.share_url) {
                // Try to copy to clipboard
                let copied = false
                try {
                    await navigator.clipboard.writeText(response.share_url)
                    copied = true
                } catch (clipboardError) {
                    // Fallback for Safari: use a temporary textarea
                    try {
                        const textArea = document.createElement('textarea')
                        textArea.value = response.share_url
                        textArea.style.position = 'fixed'
                        textArea.style.left = '-9999px'
                        document.body.appendChild(textArea)
                        textArea.select()
                        const success = document.execCommand('copy')
                        document.body.removeChild(textArea)
                        copied = success
                    } catch (fallbackError) {
                        console.error('Fallback copy failed:', fallbackError)
                    }
                }

                if (copied) {
                    setShareCopied(true)
                    setTimeout(() => setShareCopied(false), 3000)
                } else {
                    // Safari fallback: prompt user to copy manually
                    window.prompt('Copy this share link:', response.share_url)
                }
            }
        } catch (error) {
            console.error('Share error:', error)
        } finally {
            setIsSharing(false)
        }
    }

    return (
        <div className={`relative px-4 md:px-8 py-4 md:py-5 border-b flex-shrink-0 ${isDark ? 'border-white/[0.08]' : 'border-gray-200'
            }`}>
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className={`text-lg md:text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            {strategyName ? (
                                <>
                                    <span className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{strategyName}</span>
                                    <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}> — </span>
                                    <span>Analysis</span>
                                </>
                            ) : (
                                'Portfolio Analysis'
                            )}
                        </h2>
                        <p className={`text-xs md:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {tradingDays.toLocaleString()} trading days{dateRange ? ` · ${dateRange}` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
                    {/* Share with Client Button - B2B focused */}
                    {strategy && (
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className={`px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-xl border rounded-lg md:rounded-xl transition-all duration-300 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium ${shareCopied
                                ? isDark
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : isDark
                                    ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.15] text-gray-300 hover:text-white'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                                } disabled:opacity-50`}>
                            {isSharing ? (
                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : shareCopied ? (
                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            )}
                            <span className="hidden sm:inline">{shareCopied ? 'Link Copied!' : 'Share with Client'}</span>
                            <span className="sm:hidden">{shareCopied ? 'Copied' : 'Share'}</span>
                        </button>
                    )}
                    {/* Save Strategy Button */}
                    {onSaveStrategy && (
                        <button
                            onClick={onSaveStrategy}
                            className={`px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-xl border rounded-lg md:rounded-xl transition-all duration-300 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium ${isDark
                                ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.15] text-gray-300 hover:text-white'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                                }`}>
                            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 0V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3m1 0h4m-4 0a2 2 0 01-2-2V4a2 2 0 012-2h4a2 2 0 012 2v3a2 2 0 01-2 2m-4 0V9" />
                            </svg>
                            <span className="hidden sm:inline">Save Strategy</span>
                            <span className="sm:hidden">Save</span>
                        </button>
                    )}
                    {/* Hidden for now - can be re-enabled later */}
                    {false && (
                        <>
                            <button
                                onClick={() => handleExport('csv', result, portfolioData, returnsData)}
                                className={`px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-xl border rounded-lg md:rounded-xl transition-all duration-300 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium ${isDark
                                    ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.15] text-gray-300 hover:text-white'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                                    }`}>
                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                CSV
                            </button>
                            <button
                                onClick={() => handleExport('json', result, portfolioData, returnsData)}
                                className={`px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-xl border rounded-lg md:rounded-xl transition-all duration-300 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium ${isDark
                                    ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.15] text-gray-300 hover:text-white'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                                    }`}>
                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                                JSON
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 backdrop-blur-xl rounded-lg md:rounded-xl transition-all duration-300 group border ${isDark
                            ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.15]'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                            }`}>
                        <svg className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
