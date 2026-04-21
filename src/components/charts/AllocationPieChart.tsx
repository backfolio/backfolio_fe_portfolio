import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useTheme } from '../../context/ThemeContext'

interface AllocationData {
    symbol: string
    name: string
    percentage: number
    color?: string
}

interface CenterLabelProps {
    primary: string
    secondary?: string
}

interface AllocationPieChartProps {
    data: AllocationData[]
    size?: 'small' | 'medium' | 'large' | 'xlarge'
    showLegend?: boolean
    centerLabel?: CenterLabelProps
    showPercentageLabels?: boolean
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899']

const AllocationPieChart = ({ 
    data, 
    size = 'medium', 
    showLegend = true,
    centerLabel,
    showPercentageLabels = false
}: AllocationPieChartProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const chartData = data.map((item, index) => ({
        name: item.name || item.symbol,
        symbol: item.symbol,
        value: item.percentage,
        color: item.color || COLORS[index % COLORS.length]
    }))

    const sizeMap = {
        small: 120,
        medium: 200,
        large: 280,
        xlarge: 320
    }

    const radiusMap = {
        small: { inner: 30, outer: 45 },
        medium: { inner: 50, outer: 75 },
        large: { inner: 70, outer: 105 },
        xlarge: { inner: 85, outer: 125 }
    }

    const height = sizeMap[size]
    const { inner: innerRadius, outer: outerRadius } = radiusMap[size]

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`rounded-lg px-3 py-2 shadow-lg ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'
                    }`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {payload[0].payload.symbol}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {payload[0].value.toFixed(1)}%
                    </p>
                </div>
            )
        }
        return null
    }

    const renderLegend = (props: any) => {
        const { payload } = props
        return (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    // Custom label for pie slices showing percentage
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: any) => {
        if (!showPercentageLabels || percent < 0.08) return null // Don't show labels for slices < 8%
        
        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-semibold"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
                {payload.symbol}
            </text>
        )
    }

    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={2}
                        dataKey="value"
                        label={showPercentageLabels ? renderCustomizedLabel : undefined}
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke={isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)'}
                                strokeWidth={1}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && <Legend content={renderLegend} />}
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            {centerLabel && (
                <div 
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    style={{ marginTop: showLegend ? '-20px' : '0' }}
                >
                    <span className={`font-bold ${
                        size === 'xlarge' ? 'text-3xl' : size === 'large' ? 'text-2xl' : 'text-xl'
                    } ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {centerLabel.primary}
                    </span>
                    {centerLabel.secondary && (
                        <span className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {centerLabel.secondary}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export default AllocationPieChart
