import React, { useState, useMemo } from 'react'
import { useTheme } from '../../../context/ThemeContext'

export interface Column<T> {
    key: keyof T | string
    label: string
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    render?: (value: any, row: T, index: number) => React.ReactNode
    sortValue?: (row: T) => number | string | null // Custom sort value extractor
    width?: string
}

interface SortableTableProps<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor: (row: T, index: number) => string | number
    emptyMessage?: string
    maxHeight?: string
    stickyHeader?: boolean
    compact?: boolean
    striped?: boolean
}

type SortDirection = 'asc' | 'desc' | null

export function SortableTable<T extends Record<string, any>>({
    data,
    columns,
    keyExtractor,
    emptyMessage = 'No data available',
    maxHeight,
    stickyHeader = true,
    compact = false,
    striped = true
}: SortableTableProps<T>) {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)

    const handleSort = (column: Column<T>) => {
        if (column.sortable === false) return

        const key = column.key as string

        if (sortColumn === key) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortDirection(null)
                setSortColumn(null)
            } else {
                setSortDirection('asc')
            }
        } else {
            setSortColumn(key)
            setSortDirection('asc')
        }
    }

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return data

        const column = columns.find(c => c.key === sortColumn)
        if (!column) return data

        return [...data].sort((a, b) => {
            let aValue: any
            let bValue: any

            // Use custom sortValue if provided
            if (column.sortValue) {
                aValue = column.sortValue(a)
                bValue = column.sortValue(b)
            } else {
                aValue = a[sortColumn as keyof T]
                bValue = b[sortColumn as keyof T]
            }

            // Handle null/undefined
            if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1
            if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1

            // Compare based on type
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }

            // String comparison
            const aStr = String(aValue).toLowerCase()
            const bStr = String(bValue).toLowerCase()
            if (sortDirection === 'asc') {
                return aStr.localeCompare(bStr)
            }
            return bStr.localeCompare(aStr)
        })
    }, [data, sortColumn, sortDirection, columns])

    const getSortIcon = (column: Column<T>) => {
        if (column.sortable === false) return null

        const key = column.key as string
        const isActive = sortColumn === key

        return (
            <span className={`inline-flex ml-1.5 transition-colors ${isActive
                ? isDark ? 'text-purple-400' : 'text-primary-600'
                : isDark ? 'text-gray-600' : 'text-gray-400'
                }`}>
                {isActive && sortDirection === 'asc' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                )}
                {isActive && sortDirection === 'desc' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
                {(!isActive || sortDirection === null) && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                )}
            </span>
        )
    }

    const getAlignClass = (align?: 'left' | 'center' | 'right') => {
        switch (align) {
            case 'center': return 'text-center'
            case 'right': return 'text-right'
            default: return 'text-left'
        }
    }

    if (data.length === 0) {
        return (
            <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {emptyMessage}
            </div>
        )
    }

    return (
        <div
            className="overflow-x-auto"
            style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
        >
            <table className="min-w-full text-sm">
                <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
                    <tr className={`border-b ${isDark
                        ? 'border-white/[0.1] bg-black'
                        : 'border-gray-200 bg-white'
                        }`}>
                        {columns.map((column) => (
                            <th
                                key={column.key as string}
                                onClick={() => handleSort(column)}
                                className={`${compact ? 'py-2 px-2' : 'py-3 px-3'} font-semibold ${getAlignClass(column.align)} ${column.sortable !== false ? 'cursor-pointer select-none' : ''
                                    } ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
                                style={column.width ? { width: column.width } : undefined}
                            >
                                <span className="inline-flex items-center">
                                    {column.label}
                                    {getSortIcon(column)}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, rowIndex) => (
                        <tr
                            key={keyExtractor(row, rowIndex)}
                            className={`border-b transition-colors ${isDark
                                ? `border-white/[0.05] hover:bg-white/[0.02] ${striped && rowIndex % 2 === 1 ? 'bg-white/[0.01]' : ''}`
                                : `border-gray-100 hover:bg-gray-50 ${striped && rowIndex % 2 === 1 ? 'bg-gray-50/50' : ''}`
                                }`}
                        >
                            {columns.map((column) => {
                                const value = row[column.key as keyof T]
                                return (
                                    <td
                                        key={column.key as string}
                                        className={`${compact ? 'py-2 px-2' : 'py-3 px-3'} ${getAlignClass(column.align)} ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        {column.render
                                            ? column.render(value, row, rowIndex)
                                            : String(value ?? '')}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

