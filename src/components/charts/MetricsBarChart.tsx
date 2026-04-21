import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTheme } from '../../context/ThemeContext'

interface MetricsBarChartProps {
    data: { label: string; value: number; target?: number }[]
    color?: string
    showTarget?: boolean
}

const MetricsBarChart = ({ data, color = '#8b5cf6', showTarget = false }: MetricsBarChartProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload
            return (
                <div className={`rounded-lg px-3 py-2 shadow-lg ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'
                    }`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.label}
                    </p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.value.toFixed(1)}%
                    </p>
                    {showTarget && item.target && (
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Target: {item.target.toFixed(1)}%
                        </p>
                    )}
                </div>
            )
        }
        return null
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                />
                <XAxis
                    dataKey="label"
                    stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                    style={{ fontSize: '11px' }}
                />
                <YAxis
                    stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                    style={{ fontSize: '11px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={showTarget && entry.target && entry.value < entry.target
                                ? '#ef4444'
                                : color
                            }
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export default MetricsBarChart
