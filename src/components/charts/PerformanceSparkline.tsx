import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../../context/ThemeContext'

interface PerformanceSparklineProps {
    data: { date: string; value: number }[]
    color?: string
    showGrid?: boolean
    showAxis?: boolean
}

const PerformanceSparkline = ({
    data,
    color = '#8b5cf6',
    showGrid = false,
    showAxis = false
}: PerformanceSparklineProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`rounded-lg px-3 py-2 shadow-lg ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'
                    }`}>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {payload[0].payload.date}
                    </p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {payload[0].value > 0 ? '+' : ''}{payload[0].value.toFixed(1)}%
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                {showGrid && (
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    />
                )}
                {showAxis && (
                    <>
                        <XAxis
                            dataKey="date"
                            stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                            style={{ fontSize: '10px' }}
                        />
                        <YAxis
                            stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                            style={{ fontSize: '10px' }}
                        />
                    </>
                )}
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export default PerformanceSparkline
