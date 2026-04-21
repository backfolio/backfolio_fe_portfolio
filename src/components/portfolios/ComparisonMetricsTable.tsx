/**
 * ComparisonMetricsTable - Strategy Metrics Comparison Table
 * 
 * Displays a professional financial comparison table with metrics as columns
 * and strategies as rows - the industry-standard layout used by Bloomberg,
 * Morningstar, and other professional platforms. Features include:
 * - Sortable metric columns
 * - Best-in-class highlighting
 * - Grouped metric headers
 * - Color-coded values based on metric type
 * - Export to JSON/CSV for LLM analysis
 * 
 * @module components/portfolios/ComparisonMetricsTable
 */

import React, { memo, useState, useMemo, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'
import {
    type ComparisonStrategy,
    type SortDirection,
    getValidStrategies,
    findBestValues,
    isBestValue,
    formatMetricValue,
    getMetricColorClass,
    METRICS,
    METRIC_GROUPS,
} from './comparison'

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

/**
 * Build metrics data object for export
 */
const buildMetricsData = (strategies: ComparisonStrategy[]) => {
    const allMetricKeys = METRIC_GROUPS.flatMap(g => g.metrics.filter(k => METRICS[k]))
    
    return strategies.map(strategy => {
        const metricsObj: Record<string, number | string | null> = {
            strategy_name: strategy.name,
            strategy_type: strategy.type,
        }
        
        allMetricKeys.forEach(key => {
            const metric = METRICS[key]
            if (metric) {
                const value = metric.getValue(strategy.result)
                metricsObj[key] = value
            }
        })
        
        return metricsObj
    })
}

/**
 * Convert metrics data to CSV string
 */
const metricsToCSV = (strategies: ComparisonStrategy[]): string => {
    const allMetricKeys = METRIC_GROUPS.flatMap(g => g.metrics.filter(k => METRICS[k]))
    const headers = ['Strategy Name', 'Type', ...allMetricKeys.map(k => METRICS[k]?.label || k)]
    
    const rows = strategies.map(strategy => {
        const values = [
            strategy.name,
            strategy.type,
            ...allMetricKeys.map(key => {
                const metric = METRICS[key]
                if (!metric) return ''
                const value = metric.getValue(strategy.result)
                if (value === null || value === undefined) return ''
                // Return raw numeric value for CSV
                return typeof value === 'number' ? value.toString() : ''
            })
        ]
        // Escape values that might contain commas
        return values.map(v => v.includes(',') ? `"${v}"` : v).join(',')
    })
    
    return [headers.join(','), ...rows].join('\n')
}

/**
 * Download data as a file
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard with fallback
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)
        return success
    }
}

// =============================================================================
// TYPES
// =============================================================================

interface ComparisonMetricsTableProps {
    /** Strategies to compare */
    strategies: ComparisonStrategy[]
}

type SortableMetric = keyof typeof METRICS

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ComparisonMetricsTableComponent: React.FC<ComparisonMetricsTableProps> = ({ strategies }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // State
    const [sortMetric, setSortMetric] = useState<SortableMetric | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

    // Computed values
    const validStrategies = useMemo(() => getValidStrategies(strategies), [strategies])
    const bestValues = useMemo(() => findBestValues(validStrategies, METRICS), [validStrategies])

    // Show copy feedback temporarily
    const showFeedback = useCallback((message: string) => {
        setCopyFeedback(message)
        setTimeout(() => setCopyFeedback(null), 2000)
    }, [])

    // Export handlers
    const handleCopyJSON = useCallback(async () => {
        const data = buildMetricsData(validStrategies)
        const jsonString = JSON.stringify(data, null, 2)
        const success = await copyToClipboard(jsonString)
        showFeedback(success ? 'Copied JSON!' : 'Copy failed')
    }, [validStrategies, showFeedback])

    const handleCopyCSV = useCallback(async () => {
        const csvString = metricsToCSV(validStrategies)
        const success = await copyToClipboard(csvString)
        showFeedback(success ? 'Copied CSV!' : 'Copy failed')
    }, [validStrategies, showFeedback])

    const handleDownloadJSON = useCallback(() => {
        const data = buildMetricsData(validStrategies)
        const jsonString = JSON.stringify(data, null, 2)
        const timestamp = new Date().toISOString().split('T')[0]
        downloadFile(jsonString, `strategy-comparison-${timestamp}.json`, 'application/json')
    }, [validStrategies])

    const handleDownloadCSV = useCallback(() => {
        const csvString = metricsToCSV(validStrategies)
        const timestamp = new Date().toISOString().split('T')[0]
        downloadFile(csvString, `strategy-comparison-${timestamp}.csv`, 'text/csv')
    }, [validStrategies])

    // Sort strategies by selected metric
    const sortedStrategies = useMemo(() => {
        if (!sortMetric || !sortDirection) return validStrategies

        const metric = METRICS[sortMetric]
        if (!metric) return validStrategies

        return [...validStrategies].sort((a, b) => {
            const aVal = metric.getValue(a.result) ?? (sortDirection === 'desc' ? -Infinity : Infinity)
            const bVal = metric.getValue(b.result) ?? (sortDirection === 'desc' ? -Infinity : Infinity)
            return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
        })
    }, [validStrategies, sortMetric, sortDirection])

    // Event handlers
    const handleSort = (metricKey: SortableMetric) => {
        if (sortMetric === metricKey) {
            if (sortDirection === 'desc') {
                setSortDirection('asc')
            } else {
                setSortMetric(null)
                setSortDirection(null)
            }
        } else {
            setSortMetric(metricKey)
            setSortDirection('desc')
        }
    }

    // Empty state
    if (validStrategies.length === 0) {
        return (
            <div className={`backdrop-blur-xl border rounded-2xl p-8 text-center ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
                <div className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No results available for comparison
                </div>
            </div>
        )
    }

    return (
        <div className={`backdrop-blur-xl border rounded-2xl overflow-hidden ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <TableHeader 
                isDark={isDark}
                onCopyJSON={handleCopyJSON}
                onCopyCSV={handleCopyCSV}
                onDownloadJSON={handleDownloadJSON}
                onDownloadCSV={handleDownloadCSV}
                copyFeedback={copyFeedback}
            />

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        {/* Group Header Row */}
                        <tr className={isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}>
                            <th className={`sticky left-0 z-20 px-4 py-2 text-left border-r ${isDark ? 'bg-gray-900/90 border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`} />
                            {METRIC_GROUPS.map((group) => {
                                const groupMetrics = group.metrics.filter(key => METRICS[key])
                                return (
                                    <th
                                        key={group.name}
                                        colSpan={groupMetrics.length}
                                        className={`px-4 py-2 text-center text-xs font-bold uppercase tracking-wider border-r ${isDark ? 'text-purple-400 border-white/[0.1]' : 'text-purple-600 border-gray-200'}`}
                                    >
                                        {group.name}
                                    </th>
                                )
                            })}
                        </tr>

                        {/* Metric Header Row */}
                        <tr className={isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}>
                            <th className={`sticky left-0 z-20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r ${isDark ? 'text-gray-400 bg-gray-900/90 border-white/[0.1]' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                                Strategy
                            </th>
                            {METRIC_GROUPS.map((group) => {
                                const groupMetrics = group.metrics.filter(key => METRICS[key])
                                return (
                                    <React.Fragment key={group.name}>
                                        {groupMetrics.map((metricKey, metricIdx) => {
                                            const metric = METRICS[metricKey]

                                            const isLastInGroup = metricIdx === groupMetrics.length - 1

                                            return (
                                                <th
                                                    key={metricKey}
                                                    className={`px-3 py-3 text-center text-xs font-semibold min-w-[90px] ${isLastInGroup ? 'border-r' : ''} ${isDark ? `text-gray-300 ${isLastInGroup ? 'border-white/[0.1]' : ''}` : `text-gray-700 ${isLastInGroup ? 'border-gray-200' : ''}`}`}
                                                >
                                                    <button
                                                        onClick={() => handleSort(metricKey as SortableMetric)}
                                                        className={`flex flex-col items-center gap-1 w-full ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}
                                                        title={metric.description}
                                                    >
                                                        <span className="leading-tight">{metric.label}</span>
                                                        {sortMetric === metricKey && (
                                                            <span className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                                                {sortDirection === 'desc' ? '↓' : '↑'}
                                                            </span>
                                                        )}
                                                    </button>
                                                </th>
                                            )
                                        })}
                                    </React.Fragment>
                                )
                            })}
                        </tr>
                    </thead>

                    <tbody className={isDark ? 'divide-y divide-white/[0.05]' : 'divide-y divide-gray-100'}>
                        {sortedStrategies.map((strategy, strategyIdx) => (
                            <tr
                                key={strategy.id}
                                className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'} ${strategyIdx % 2 === 0 ? (isDark ? 'bg-white/[0.01]' : 'bg-gray-50/30') : ''}`}
                            >
                                {/* Strategy Name */}
                                <td className={`sticky left-0 z-10 px-4 py-3 border-r ${isDark ? 'bg-gray-900/90 border-white/[0.1]' : 'bg-white border-gray-200'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: strategy.color.stroke }}
                                        />
                                        <span className={`text-sm font-semibold truncate max-w-[140px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`} title={strategy.name}>
                                            {strategy.name}
                                        </span>
                                    </div>
                                </td>

                                {/* Metric Values */}
                                {METRIC_GROUPS.map((group) => {
                                    const groupMetrics = group.metrics.filter(key => METRICS[key])
                                    return (
                                        <React.Fragment key={group.name}>
                                            {groupMetrics.map((metricKey, metricIdx) => {
                                                const metric = METRICS[metricKey]

                                                const value = metric.getValue(strategy.result)
                                                const isTheBest = isBestValue(value, metricKey, bestValues)
                                                const colorClass = metric.format === 'percent'
                                                    ? getMetricColorClass(value, metricKey, isDark)
                                                    : isDark ? 'text-gray-300' : 'text-gray-700'
                                                const isLastInGroup = metricIdx === groupMetrics.length - 1

                                                return (
                                                    <td
                                                        key={metricKey}
                                                        className={`px-3 py-3 text-center text-sm font-medium ${colorClass} ${isLastInGroup ? 'border-r' : ''} ${isDark ? isLastInGroup ? 'border-white/[0.1]' : '' : isLastInGroup ? 'border-gray-200' : ''}`}
                                                    >
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {formatMetricValue(value, metric)}
                                                            {isTheBest && validStrategies.length > 1 && (
                                                                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Legend */}
            <TableFooter isDark={isDark} />
        </div>
    )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TableHeaderProps {
    isDark: boolean
    onCopyJSON: () => void
    onCopyCSV: () => void
    onDownloadJSON: () => void
    onDownloadCSV: () => void
    copyFeedback: string | null
}

const TableHeader: React.FC<TableHeaderProps> = ({ 
    isDark, 
    onCopyJSON, 
    onCopyCSV, 
    onDownloadJSON, 
    onDownloadCSV,
    copyFeedback 
}) => (
    <div className={`p-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 border rounded-xl ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Performance Metrics
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Side-by-side comparison • Click to sort
                    </p>
                </div>
            </div>
            
            {/* Export Actions */}
            <div className="flex items-center gap-2">
                {copyFeedback && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        {copyFeedback}
                    </span>
                )}
                
                {/* Copy Dropdown */}
                <div className="relative group">
                    <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                            ? 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] border border-white/[0.1]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className={`absolute right-0 mt-1 py-1 w-32 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${isDark
                        ? 'bg-gray-800 border border-white/[0.1]'
                        : 'bg-white border border-gray-200'
                    }`}>
                        <button
                            onClick={onCopyJSON}
                            className={`w-full px-3 py-1.5 text-left text-xs font-medium transition-colors ${isDark
                                ? 'text-gray-300 hover:bg-white/[0.05]'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Copy as JSON
                        </button>
                        <button
                            onClick={onCopyCSV}
                            className={`w-full px-3 py-1.5 text-left text-xs font-medium transition-colors ${isDark
                                ? 'text-gray-300 hover:bg-white/[0.05]'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Copy as CSV
                        </button>
                    </div>
                </div>
                
                {/* Download Dropdown */}
                <div className="relative group">
                    <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                            ? 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] border border-white/[0.1]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className={`absolute right-0 mt-1 py-1 w-36 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${isDark
                        ? 'bg-gray-800 border border-white/[0.1]'
                        : 'bg-white border border-gray-200'
                    }`}>
                        <button
                            onClick={onDownloadJSON}
                            className={`w-full px-3 py-1.5 text-left text-xs font-medium transition-colors ${isDark
                                ? 'text-gray-300 hover:bg-white/[0.05]'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Download JSON
                        </button>
                        <button
                            onClick={onDownloadCSV}
                            className={`w-full px-3 py-1.5 text-left text-xs font-medium transition-colors ${isDark
                                ? 'text-gray-300 hover:bg-white/[0.05]'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Download CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const TableFooter: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className={`p-4 border-t ${isDark ? 'border-white/[0.1] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Best in class • Click column headers to sort
                </span>
                <span className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>+</span>
                    Positive values
                </span>
                <span className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>−</span>
                    Risk indicators
                </span>
            </div>
        </div>
    </div>
)

// Memoize to prevent unnecessary re-renders
export const ComparisonMetricsTable = memo(ComparisonMetricsTableComponent, (prevProps, nextProps) => {
    return prevProps.strategies === nextProps.strategies
})
