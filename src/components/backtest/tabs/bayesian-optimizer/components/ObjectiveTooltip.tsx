import React, { useState } from 'react'
import type { ObjectiveTooltipProps } from '../types'

export const ObjectiveTooltip: React.FC<ObjectiveTooltipProps> = ({ children, content, isDark }) => {
    const [show, setShow] = useState(false)

    return (
        <div
            className="relative"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg text-xs leading-relaxed shadow-xl border pointer-events-none ${isDark
                    ? 'bg-gray-900 text-gray-200 border-gray-700'
                    : 'bg-white text-gray-700 border-gray-200'
                    }`}>
                    {content}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent ${isDark ? 'border-t-gray-900' : 'border-t-white'
                        }`} />
                </div>
            )}
        </div>
    )
}

