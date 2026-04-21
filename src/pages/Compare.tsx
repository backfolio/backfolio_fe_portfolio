import Layout from '../components/Layout'
import { StrategyCompareView } from '../components/portfolios/StrategyCompareView'
import { useTheme } from '../context/ThemeContext'

/**
 * Compare Page - Dedicated page for strategy comparison
 * 
 * Allows users to compare multiple strategies side-by-side:
 * - Select from saved strategies, templates, or individual stocks
 * - Run parallel backtests with unified configuration
 * - View comparative charts and performance metrics
 */
const Compare = () => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Compare
                    </h1>
                    <p className={`text-sm sm:text-base lg:text-lg mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Side-by-side strategy analysis
                    </p>
                </div>

                <StrategyCompareView />
            </div>
        </Layout>
    )
}

export default Compare
