import React, { useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Strategy, Allocation, CanvasPosition } from '../../types/strategy'

interface StrategyFlowPreviewProps {
    strategy: Strategy
    fallbackAllocation: string
    className?: string
    // Canvas positions to determine visual order (left-to-right by x position)
    canvasPositions?: { [allocationName: string]: CanvasPosition }
}

// Color palette for allocation slices - vibrant, distinctive colors
const ALLOCATION_COLORS = [
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#EC4899', // Pink
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
]

// Mini donut chart component
const MiniDonut: React.FC<{
    allocation: Allocation
    name: string
    isFallback: boolean
    size?: number
    isDark: boolean
}> = ({ allocation, name, isFallback, size = 56, isDark }) => {
    const entries = Object.entries(allocation).filter(([, val]) => val > 0)
    const total = entries.reduce((sum, [, val]) => sum + val, 0)

    // Calculate SVG arc paths
    const center = size / 2
    const outerRadius = (size / 2) - 2
    const innerRadius = outerRadius * 0.55

    let currentAngle = -90 // Start from top

    const arcs = entries.map(([symbol, value], index) => {
        const percentage = total > 0 ? (value / total) : 0
        const angle = percentage * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        currentAngle = endAngle

        // Convert angles to radians
        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180

        // Calculate arc points
        const x1 = center + outerRadius * Math.cos(startRad)
        const y1 = center + outerRadius * Math.sin(startRad)
        const x2 = center + outerRadius * Math.cos(endRad)
        const y2 = center + outerRadius * Math.sin(endRad)
        const x3 = center + innerRadius * Math.cos(endRad)
        const y3 = center + innerRadius * Math.sin(endRad)
        const x4 = center + innerRadius * Math.cos(startRad)
        const y4 = center + innerRadius * Math.sin(startRad)

        const largeArc = angle > 180 ? 1 : 0

        // Special case: single asset (full circle)
        if (entries.length === 1) {
            return (
                <g key={symbol}>
                    <circle
                        cx={center}
                        cy={center}
                        r={outerRadius}
                        fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={innerRadius}
                        fill={isDark ? '#1a1a2e' : '#ffffff'}
                    />
                </g>
            )
        }

        const path = `
            M ${x1} ${y1}
            A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
            Z
        `

        return (
            <path
                key={symbol}
                d={path}
                fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}
                className="transition-opacity duration-200"
            />
        )
    })

    // Truncate name for display
    const displayName = name.length > 10 ? name.slice(0, 9) + '…' : name

    return (
        <div className="relative group flex flex-col items-center">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className={`transition-transform duration-200 hover:scale-105 ${isFallback ? 'ring-2 ring-offset-2 rounded-full' : ''} ${isFallback
                    ? isDark ? 'ring-purple-500/60 ring-offset-[#0f0f1a]' : 'ring-purple-500/60 ring-offset-white'
                    : ''
                    }`}
            >
                {arcs}
            </svg>

            {/* Allocation name label */}
            <div className={`mt-1.5 text-[10px] font-medium text-center max-w-[60px] truncate ${isFallback
                ? isDark ? 'text-purple-400' : 'text-purple-600'
                : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {displayName}
            </div>

            {/* Fallback indicator star */}
            {isFallback && (
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${isDark ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white'
                    }`}>
                    ★
                </div>
            )}

            {/* Tooltip on hover */}
            <div className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none ${isDark ? 'bg-gray-800 text-white border border-white/10 shadow-xl' : 'bg-white text-gray-900 border border-gray-200 shadow-lg'
                }`}>
                <div className={`font-medium mb-1 ${isFallback ? 'text-purple-400' : ''}`}>
                    {name} {isFallback && '(Default)'}
                </div>
                <div className="space-y-0.5">
                    {entries.slice(0, 4).map(([symbol, value], idx) => (
                        <div key={symbol} className="flex items-center gap-1.5">
                            <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }}
                            />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{symbol}</span>
                            <span className="font-medium">{Math.round(value * 100)}%</span>
                        </div>
                    ))}
                    {entries.length > 4 && (
                        <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            +{entries.length - 4} more
                        </div>
                    )}
                </div>
                {/* Tooltip arrow */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 -mt-1 ${isDark ? 'bg-gray-800 border-r border-b border-white/10' : 'bg-white border-r border-b border-gray-200'
                    }`} />
            </div>
        </div>
    )
}

// Arrow connector component
const FlowArrow: React.FC<{
    hasRule: boolean
    ruleName?: string
    isDark: boolean
    index: number
}> = ({ hasRule, ruleName, isDark, index }) => {
    // Use unique IDs per arrow to avoid SVG marker conflicts
    const arrowId = `arrowhead-${index}`

    return (
        <div className="relative flex items-start group" style={{ marginTop: '18px' }}>
            {/* Arrow line */}
            <svg width="40" height="20" viewBox="0 0 40 20" className="flex-shrink-0">
                <defs>
                    <marker
                        id={arrowId}
                        markerWidth="6"
                        markerHeight="4"
                        refX="5"
                        refY="2"
                        orient="auto"
                    >
                        <polygon
                            points="0 0, 6 2, 0 4"
                            fill={hasRule
                                ? (isDark ? '#a78bfa' : '#8b5cf6')
                                : (isDark ? '#4b5563' : '#9ca3af')
                            }
                        />
                    </marker>
                </defs>
                <path
                    d="M 2 10 L 32 10"
                    stroke={hasRule
                        ? (isDark ? '#a78bfa' : '#8b5cf6')
                        : (isDark ? '#4b5563' : '#9ca3af')
                    }
                    strokeWidth={hasRule ? "2" : "1.5"}
                    strokeDasharray={hasRule ? "none" : "3 2"}
                    fill="none"
                    markerEnd={`url(#${arrowId})`}
                />
            </svg>

            {/* Rule indicator dot */}
            {hasRule && (
                <>
                    <div className={`absolute left-1/2 top-[10px] -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-500'
                        }`} />

                    {/* Rule tooltip */}
                    {ruleName && (
                        <div className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none ${isDark ? 'bg-purple-900/90 text-purple-200 border border-purple-500/30' : 'bg-purple-50 text-purple-800 border border-purple-200'
                            }`}>
                            {ruleName}
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 -mt-0.5 ${isDark ? 'bg-purple-900/90 border-r border-b border-purple-500/30' : 'bg-purple-50 border-r border-b border-purple-200'
                                }`} />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export const StrategyFlowPreview: React.FC<StrategyFlowPreviewProps> = ({
    strategy,
    fallbackAllocation,
    className = '',
    canvasPositions
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Build the flow structure
    // CLEAN API V4.0: entry_condition is embedded in allocations
    const flowData = useMemo(() => {
        const allocations = strategy.allocations || {}
        const allocationNames = Object.keys(allocations)

        // Build a map of connections based on which allocations have entry_conditions
        const connections = new Map<string, Array<{ target: string; ruleName: string }>>()

        // In CLEAN API V4.0, allocations with entry_condition have rules
        allocationNames.forEach(name => {
            const alloc = allocations[name]
            if (alloc?.entry_condition) {
                const targets = connections.get(name) || []
                targets.push({
                    target: name,
                    ruleName: 'Entry Condition'
                })
                connections.set(name, targets)
            }
        })

        // Determine display order based on canvas positions (left-to-right by x)
        let orderedAllocations: string[]

        if (canvasPositions && Object.keys(canvasPositions).length > 0) {
            // Sort by x position (left to right) to match canvas layout
            orderedAllocations = allocationNames
                .filter(name => canvasPositions[name]) // Only include those with positions
                .sort((a, b) => {
                    const posA = canvasPositions[a]
                    const posB = canvasPositions[b]
                    return (posA?.x || 0) - (posB?.x || 0)
                })

            // Add any allocations without positions at the end
            allocationNames.forEach(name => {
                if (!orderedAllocations.includes(name)) {
                    orderedAllocations.push(name)
                }
            })
        } else {
            // Fallback: start with fallback allocation, then add remaining alphabetically
            orderedAllocations = []
            const visited = new Set<string>()

            if (fallbackAllocation && allocations[fallbackAllocation]) {
                orderedAllocations.push(fallbackAllocation)
                visited.add(fallbackAllocation)
            }

            // Add remaining allocations alphabetically for consistency
            allocationNames
                .filter(name => !visited.has(name))
                .sort()
                .forEach(name => {
                    orderedAllocations.push(name)
                })
        }

        // Create edges between consecutive allocations in the order
        // CLEAN API V4.0: edges come from allocation_order or canvas_edges
        const edges: Array<{ from: string; to: string; ruleName?: string }> = []

        // Use allocation_order to create edges
        for (let i = 0; i < orderedAllocations.length - 1; i++) {
            const from = orderedAllocations[i]
            const to = orderedAllocations[i + 1]
            const hasRule = allocations[from]?.entry_condition
            edges.push({
                from,
                to,
                ruleName: hasRule ? 'Entry Condition' : undefined
            })
        }

        return {
            allocations: orderedAllocations.slice(0, 4), // Limit to 4 for space
            allAllocationData: allocations,
            edges,
            totalAllocations: allocationNames.length,
            hasMore: allocationNames.length > 4
        }
    }, [strategy, fallbackAllocation, canvasPositions])

    // If no allocations, show a placeholder
    if (flowData.allocations.length === 0) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    No allocations defined
                </div>
            </div>
        )
    }

    // Check for connections between consecutive allocations
    const hasConnection = (from: string, to: string): { has: boolean; ruleName?: string } => {
        const edge = flowData.edges.find(e =>
            (e.from === from && e.to === to) || (e.from === to && e.to === from)
        )
        return { has: !!edge, ruleName: edge?.ruleName }
    }

    return (
        <div className={`flex items-start gap-1.5 ${className}`}>
            {flowData.allocations.map((allocName, index) => {
                const allocation = flowData.allAllocationData[allocName]
                const isFallback = allocName === fallbackAllocation

                // Skip if allocation doesn't exist or doesn't have the allocation property
                if (!allocation || !allocation.allocation) {
                    return null
                }

                // Get connection info for the arrow AFTER this allocation
                const nextAlloc = flowData.allocations[index + 1]
                const connection = nextAlloc ? hasConnection(allocName, nextAlloc) : null

                return (
                    <React.Fragment key={allocName}>
                        <MiniDonut
                            allocation={allocation.allocation}
                            name={allocName}
                            isFallback={isFallback}
                            size={52}
                            isDark={isDark}
                        />

                        {/* Show arrow if not the last allocation */}
                        {index < flowData.allocations.length - 1 && (
                            <FlowArrow
                                hasRule={connection?.has || Object.values(strategy.allocations).some((a: any) => a.entry_condition)}
                                ruleName={connection?.ruleName}
                                isDark={isDark}
                                index={index}
                            />
                        )}
                    </React.Fragment>
                )
            })}

            {/* Show "+N more" indicator */}
            {flowData.hasMore && (
                <div className={`ml-1 px-2 py-1 rounded-lg text-[10px] font-medium self-center ${isDark
                    ? 'bg-white/5 text-gray-400 border border-white/10'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                    +{flowData.totalAllocations - 4} more
                </div>
            )}

            {/* Rules count badge - count allocations with entry_condition */}
            {(() => {
                const rulesCount = Object.values(strategy.allocations).filter((a: any) => a.entry_condition).length
                return rulesCount > 0 && (
                    <div className={`ml-2 px-2 py-1 rounded-lg text-[10px] font-medium self-center ${isDark
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-purple-50 text-purple-600 border border-purple-200'
                        }`}>
                        {rulesCount} rule{rulesCount > 1 ? 's' : ''}
                    </div>
                )
            })()}
        </div>
    )
}

export default StrategyFlowPreview

