import { memo, useCallback } from 'react'
import type { FormInputProps } from '../types'

// Format number with commas for display
const formatWithCommas = (value: string): string => {
    const num = value.replace(/[^\d]/g, '')
    if (!num) return ''
    return parseInt(num, 10).toLocaleString('en-US')
}

// Strip commas and return raw number string
const stripCommas = (value: string): string => {
    return value.replace(/,/g, '')
}

const FormInputComponent: React.FC<FormInputProps> = ({
    label,
    value,
    onChange,
    prefix,
    suffix,
    hint,
    type = 'text',
    isDark,
    formatCurrency = false
}) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value
        if (formatCurrency) {
            // Strip non-numeric, pass raw number to parent
            onChange(stripCommas(rawValue))
        } else {
            onChange(rawValue)
        }
    }, [onChange, formatCurrency])

    // Display formatted value if currency formatting is enabled
    const displayValue = formatCurrency ? formatWithCommas(value) : value

    return (
        <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
            </label>
            <div className="relative">
                {prefix && (
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {prefix}
                    </span>
                )}
                <input
                    type={type}
                    value={displayValue}
                    onChange={handleChange}
                    className={`w-full py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 text-sm ${prefix ? 'pl-8' : 'pl-3'
                        } ${suffix ? 'pr-12' : 'pr-3'} ${isDark
                            ? 'bg-white/[0.03] border-white/[0.1] text-white focus:ring-purple-500/50 focus:border-purple-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                />
                {suffix && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {suffix}
                    </span>
                )}
            </div>
            {hint && (
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{hint}</p>
            )}
        </div>
    )
}

export const FormInput = memo(FormInputComponent)
FormInput.displayName = 'FormInput'



