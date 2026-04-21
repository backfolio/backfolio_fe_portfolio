import React, { useState } from 'react'

interface MetricTooltipProps {
    content: string
    children: React.ReactNode
    isDark: boolean
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({ content, children, isDark }) => {
    const [show, setShow] = useState(false)

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className={`absolute z-50 bottom-full mb-2 w-48 p-2.5 rounded-lg text-xs leading-relaxed shadow-xl border pointer-events-none ${isDark
                    ? 'bg-gray-900 text-gray-200 border-gray-700'
                    : 'bg-white text-gray-700 border-gray-200'
                    }`}
                    style={{
                        left: '50%',
                        transform: 'translateX(max(-50%, calc(-100% + 1rem)))',
                        maxWidth: 'min(12rem, calc(100vw - 6rem))',
                        marginLeft: '1rem'
                    }}>
                    {content}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-px border-6 border-transparent ${isDark ? 'border-t-gray-900' : 'border-t-white'
                        }`} />
                </div>
            )}
        </div>
    )
}
