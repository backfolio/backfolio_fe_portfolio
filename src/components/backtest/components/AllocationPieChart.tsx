import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useTheme } from '../../../context/ThemeContext'

interface AllocationPieChartProps {
    allocationPercentages: Record<string, number>
}

const COLORS = [
    '#8b5cf6', // purple-500
    '#3b82f6', // blue-500
    '#06b6d4', // cyan-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
]

export const AllocationPieChart: React.FC<AllocationPieChartProps> = ({ allocationPercentages }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const data = Object.entries(allocationPercentages).map(([name, value]) => ({
        name,
        value,
        displayValue: value.toFixed(1)
    }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`border rounded-lg shadow-lg p-3 ${isDark ? 'bg-black border-white/[0.15]' : 'bg-white border-gray-200'
                    }`}>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {payload[0].name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {payload[0].value.toFixed(2)}%
                    </p>
                </div>
            )
        }
        return null
    }

    const CustomLegend = (props: any) => {
        const { payload } = props
        return (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {entry.value} ({entry.payload.displayValue}%)
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-white border-gray-200'
            }`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Allocation Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, displayValue }) => `${name}: ${displayValue}%`}
                        labelLine={{ stroke: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af', strokeWidth: 1 }}
                        style={{ fill: isDark ? 'rgba(255,255,255,0.9)' : '#1f2937', fontSize: '12px', fontWeight: 500 }}
                    >
                        {data.map((_entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke={isDark ? '#000' : '#ffffff'}
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
