import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTickerSearch } from '../../../hooks/useTickerSearch'
import { useTheme } from '../../../context/ThemeContext'
import { StockSearchResult } from '../../../services/api'

interface TickerSearchInputProps {
    value: string
    onChange: (ticker: string) => void
    onSubmit?: (ticker: string) => void  // Called when Enter is pressed without selecting from dropdown
    placeholder?: string
    className?: string
    disabled?: boolean
    isDark?: boolean  // Override for theme detection (useful in white-label contexts)
}

/**
 * Input component with autocomplete dropdown for searching stocks/ETFs
 * 
 * Features:
 * - Debounced search as you type
 * - Dropdown with ticker suggestions
 * - Shows company name and exchange
 * - Supports keyboard navigation
 */
export function TickerSearchInput({
    value,
    onChange,
    onSubmit,
    placeholder = 'SYMBOL',
    className = '',
    disabled = false,
    isDark: isDarkProp,
}: TickerSearchInputProps) {
    const { theme } = useTheme()
    // Use prop if provided, otherwise fall back to global theme
    const isDark = isDarkProp !== undefined ? isDarkProp : theme === 'dark'

    const [inputValue, setInputValue] = useState(value)
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Update dropdown position when input position changes or on scroll
    useEffect(() => {
        const updatePosition = () => {
            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect()
                setDropdownPosition({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: Math.max(rect.width, 256) // min 256px (w-64)
                })
            }
        }

        if (isOpen) {
            updatePosition()
            // Listen to scroll and resize events to keep dropdown attached to input
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
            return () => {
                window.removeEventListener('scroll', updatePosition, true)
                window.removeEventListener('resize', updatePosition)
            }
        }
    }, [isOpen])

    const { setQuery, results, isLoading } = useTickerSearch({
        debounceMs: 250,
        minQueryLength: 1,
        maxResults: 10,
    })

    // Sync input value with prop
    useEffect(() => {
        setInputValue(value)
    }, [value])

    // Update search query when input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase()
        setInputValue(newValue)
        setQuery(newValue)
        setIsOpen(true)
        setHighlightedIndex(-1)

        // Also update parent with raw input (user might type exact ticker)
        onChange(newValue)
    }

    // Select a result from dropdown
    const handleSelect = (result: StockSearchResult, autoSubmit = false) => {
        setInputValue(result.ticker)
        onChange(result.ticker)
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()

        // If autoSubmit is true and onSubmit is provided, trigger it
        if (autoSubmit && onSubmit) {
            onSubmit(result.ticker)
        }
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle Enter key separately to support onSubmit callback
        if (e.key === 'Enter') {
            e.preventDefault()
            // If dropdown is open with results and something is highlighted, select it
            if (isOpen && results.length > 0 && highlightedIndex >= 0 && highlightedIndex < results.length) {
                handleSelect(results[highlightedIndex])
            } else if (onSubmit && inputValue.trim()) {
                // Otherwise, call onSubmit if provided (for "Add Stock" behavior)
                onSubmit(inputValue.trim())
            }
            return
        }

        if (!isOpen || results.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
                break
            case 'Escape':
                setIsOpen(false)
                setHighlightedIndex(-1)
                break
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const showDropdown = isOpen && (results.length > 0 || isLoading) && inputValue.length > 0

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                    if (inputValue.length > 0) {
                        setQuery(inputValue)
                        setIsOpen(true)
                    }
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={`${className} ${isDark
                        ? 'bg-white/[0.05] border-white/[0.12] text-white placeholder-gray-600'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                autoComplete="off"
                spellCheck={false}
            />

            {/* Dropdown - rendered via portal to avoid overflow clipping */}
            {showDropdown && createPortal(
                <div
                    ref={dropdownRef}
                    className={`fixed z-[9999] rounded-lg border shadow-xl overflow-hidden ${isDark
                            ? 'bg-slate-900 border-white/[0.15]'
                            : 'bg-white border-slate-200'
                        }`}
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                    }}
                >
                    {isLoading ? (
                        <div className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            <span className="inline-flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Searching...
                            </span>
                        </div>
                    ) : results.length === 0 ? (
                        <div className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            No results found
                        </div>
                    ) : (
                        <ul className="max-h-64 overflow-y-auto">
                            {results.map((result, index) => (
                                <li key={result.ticker}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(result, !!onSubmit)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        className={`w-full text-left px-3 py-2 transition-colors ${highlightedIndex === index
                                                ? isDark
                                                    ? 'bg-purple-500/20'
                                                    : 'bg-purple-50'
                                                : isDark
                                                    ? 'hover:bg-white/[0.05]'
                                                    : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-slate-900'
                                                        }`}>
                                                        {result.ticker}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${result.assetType === 'ETF'
                                                            ? isDark
                                                                ? 'bg-blue-500/20 text-blue-300'
                                                                : 'bg-blue-100 text-blue-700'
                                                            : isDark
                                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {result.assetType}
                                                    </span>
                                                </div>
                                                <div className={`text-[10px] truncate ${isDark ? 'text-gray-400' : 'text-slate-500'
                                                    }`}>
                                                    {result.name}
                                                </div>
                                            </div>
                                            <span className={`text-[10px] flex-shrink-0 ml-auto ${isDark ? 'text-gray-500' : 'text-slate-400'
                                                }`}>
                                                {result.exchange}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>,
                document.body
            )}
        </div>
    )
}

