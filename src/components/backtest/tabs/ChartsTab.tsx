import React, { memo } from 'react'
import { ReturnsChart } from '../components/ReturnsChart'
import { DrawdownChart } from '../components/DrawdownChart'

interface ChartsTabProps {
    returnsData: any[]
    drawdownData: any[]
}

const ChartsTabComponent: React.FC<ChartsTabProps> = ({ returnsData, drawdownData }) => {
    return (
        <div className="relative space-y-6">
            <DrawdownChart data={drawdownData} />
            <ReturnsChart data={returnsData} />
        </div>
    )
}

// Memoize with explicit comparison to prevent re-renders when switching tabs
export const ChartsTab = memo(ChartsTabComponent, (prevProps, nextProps) => {
    // Compare by reference (data is memoized in useBacktestChartData)
    return prevProps.returnsData === nextProps.returnsData && 
           prevProps.drawdownData === nextProps.drawdownData
})
