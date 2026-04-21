// Monte Carlo Utility Functions

export const formatReturn = (value: number): string => {
    const pct = (value * 100).toFixed(1)
    return value >= 0 ? `+${pct}%` : `${pct}%`
}

export const formatCurrency = (val: number): string => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`
    return `$${val.toFixed(0)}`
}

export const formatCurrencyDetailed = (val: number): string => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`
    return `$${val.toFixed(0)}`
}

export const formatPercent = (val: number): string => {
    const pct = val * 100
    return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`
}

// ============================================================================
// INTELLIGENT MULTI-FACTOR RISK SCORING SYSTEM
// ============================================================================
// This system evaluates strategy risk across 5 dimensions, each capturing
// a different aspect of what makes a strategy "risky" from an investor's 
// perspective. The goal is to answer: "How likely am I to panic-sell during
// this strategy's worst moments?"
//
// Market Context (S&P 500 historical reference):
// - Typical annual volatility: ~15-20%
// - Median max drawdown over 10yr periods: ~25-35%
// - Worst drawdowns: 50%+ (2008: -56%, 2020: -34%, 2022: -25%)
// - Long-term CAGR: ~7-10%
// ============================================================================

export interface RiskComponent {
    name: string
    score: number        // 0-100, higher = safer
    weight: number       // Weight in final calculation
    description: string  // What this measures
    detail?: string      // Specific insight for this strategy
}

export interface RiskInsight {
    type: 'warning' | 'strength' | 'neutral'
    icon: 'shield' | 'alert' | 'trending' | 'target' | 'zap' | 'chart'
    text: string
    severity?: 'critical' | 'concerning' | 'minor' | 'positive'
}

export interface RiskScore {
    score: number                    // 1-10 final score
    label: string                    // "Excellent", "Good", etc.
    color: 'emerald' | 'blue' | 'amber' | 'red'
    components: RiskComponent[]      // Breakdown of all risk factors
    insights: RiskInsight[]          // Specific warnings and strengths
    confidenceNote?: string          // Note about score reliability
}

/**
 * Sigmoid-like transformation for smoother risk curves.
 * Maps input to 0-100 range with configurable midpoint and steepness.
 */
const sigmoid = (x: number, midpoint: number, steepness: number = 10): number => {
    const normalized = (x - midpoint) * steepness
    return 100 / (1 + Math.exp(normalized))
}

/**
 * Inverse exponential decay - penalizes high values more severely
 */
const exponentialPenalty = (x: number, threshold: number): number => {
    if (x <= 0) return 100
    const ratio = x / threshold
    return Math.max(0, 100 * Math.exp(-ratio * 1.5))
}

/**
 * Calculate the Survival Score (25% weight)
 * Measures: How likely are you to end with more money than you started?
 * 
 * This is the most fundamental risk measure - did you lose money over the period?
 * Uses a sigmoid curve because the psychological impact of loss probability isn't linear:
 * - 5% loss probability feels very different from 0%
 * - 40% vs 45% feels similar (both feel bad)
 */
const calculateSurvivalScore = (lossProbability: number): RiskComponent => {
    // Sigmoid centered at 15% loss probability
    // <5% = excellent (>90), 5-15% = good (70-90), 15-30% = concerning (40-70), >30% = poor (<40)
    const score = sigmoid(lossProbability, 0.15, 15)
    
    let detail: string
    if (lossProbability < 0.05) {
        detail = `Only ${(lossProbability * 100).toFixed(1)}% chance of loss over the period`
    } else if (lossProbability < 0.15) {
        detail = `${(lossProbability * 100).toFixed(0)}% loss probability is acceptable for growth strategies`
    } else if (lossProbability < 0.30) {
        detail = `${(lossProbability * 100).toFixed(0)}% loss probability requires strong conviction`
    } else {
        detail = `${(lossProbability * 100).toFixed(0)}% chance of loss - consider if risk matches goals`
    }
    
    return {
        name: 'Capital Preservation',
        score: Math.round(score),
        weight: 0.25,
        description: 'Probability of ending with profit vs loss',
        detail
    }
}

/**
 * Calculate the Pain Tolerance Score (25% weight)
 * Measures: How much temporary loss will you need to endure?
 * 
 * Uses both median and P90 drawdowns because:
 * - Median = what you'll typically experience
 * - P90 = what you might face in bad scenarios
 * 
 * Market context: S&P 500 median drawdown over 10 years is ~30%
 */
const calculatePainToleranceScore = (
    drawdownAnalysis?: { worst?: number; p90?: number; median?: number }
): RiskComponent => {
    const medianDD = Math.abs(drawdownAnalysis?.median || 0.25)
    const p90DD = Math.abs(drawdownAnalysis?.p90 || 0.40)
    
    // Score median drawdown (weight: 40%)
    // <15% median = excellent, 15-25% = good, 25-40% = moderate, >40% = severe
    const medianScore = sigmoid(medianDD, 0.25, 8)
    
    // Score P90 drawdown (weight: 60%) - we care more about bad cases
    // <25% p90 = excellent, 25-40% = good, 40-55% = concerning, >55% = severe
    const p90Score = sigmoid(p90DD, 0.40, 6)
    
    const combinedScore = medianScore * 0.4 + p90Score * 0.6
    
    let detail: string
    if (medianDD < 0.15 && p90DD < 0.25) {
        detail = 'Very stable - minimal drawdowns expected'
    } else if (medianDD < 0.25 && p90DD < 0.40) {
        detail = `Expect ~${(medianDD * 100).toFixed(0)}% typical drawdowns, manageable for most`
    } else if (medianDD < 0.35 && p90DD < 0.50) {
        detail = `${(medianDD * 100).toFixed(0)}% typical, ${(p90DD * 100).toFixed(0)}% in rough years - requires discipline`
    } else {
        detail = `Large swings likely (${(p90DD * 100).toFixed(0)}%+ in bad years) - only for high risk tolerance`
    }
    
    return {
        name: 'Drawdown Resilience',
        score: Math.round(combinedScore),
        weight: 0.25,
        description: 'Typical and worst-case portfolio declines',
        detail
    }
}

/**
 * Calculate the Tail Risk Score (20% weight)
 * Measures: How bad are the catastrophic scenarios?
 * 
 * This focuses on the worst 1-5% of outcomes. These are the scenarios that
 * cause investors to abandon strategies at the worst time.
 */
const calculateTailRiskScore = (
    scenarios?: { worst_case?: { final_value?: number; cagr?: number }; pessimistic?: { cagr?: number } },
    initialCapital: number = 100000
): RiskComponent => {
    const worstCaseValue = scenarios?.worst_case?.final_value || initialCapital * 0.5
    const pessimisticCAGR = scenarios?.pessimistic?.cagr || scenarios?.worst_case?.cagr || -0.10
    
    // Calculate worst-case loss percentage
    const worstCaseLoss = (initialCapital - worstCaseValue) / initialCapital
    
    // Score based on worst-case loss
    // <10% worst loss = excellent, 10-25% = good, 25-50% = concerning, >50% = severe
    const worstCaseScore = exponentialPenalty(Math.max(0, worstCaseLoss), 0.30)
    
    // Also consider pessimistic CAGR (P10)
    // Positive P10 = great, slightly negative = okay, deeply negative = bad
    const p10Score = sigmoid(-pessimisticCAGR, 0.05, 20)
    
    const combinedScore = worstCaseScore * 0.6 + p10Score * 0.4
    
    let detail: string
    if (worstCaseLoss < 0.10) {
        detail = 'Minimal tail risk - worst cases still acceptable'
    } else if (worstCaseLoss < 0.25) {
        detail = `Worst 1% could lose ~${(worstCaseLoss * 100).toFixed(0)}% - within normal bounds`
    } else if (worstCaseLoss < 0.50) {
        detail = `Worst outcomes could lose ${(worstCaseLoss * 100).toFixed(0)}% - significant tail risk`
    } else {
        detail = `Extreme tail risk: worst 1% could lose ${(worstCaseLoss * 100).toFixed(0)}%+`
    }
    
    return {
        name: 'Tail Risk Protection',
        score: Math.round(combinedScore),
        weight: 0.20,
        description: 'Severity of worst-case scenarios (P1, P5)',
        detail
    }
}

/**
 * Calculate the Consistency Score (15% weight)
 * Measures: How predictable are the outcomes?
 * 
 * A wide P10-P90 range means highly uncertain outcomes. Some investors
 * prefer lower but consistent returns over higher but wildly variable ones.
 */
const calculateConsistencyScore = (
    cagrP10?: number,
    cagrP90?: number,
    stdCAGR?: number
): RiskComponent => {
    const p10 = cagrP10 ?? -0.05
    const p90 = cagrP90 ?? 0.15
    const spread = p90 - p10
    const std = stdCAGR ?? spread / 2.5
    
    // Score based on CAGR spread
    // <15% spread = very consistent, 15-25% = normal, 25-40% = variable, >40% = wild
    const spreadScore = sigmoid(spread, 0.25, 8)
    
    // Also consider standard deviation
    const stdScore = sigmoid(std, 0.08, 15)
    
    const combinedScore = spreadScore * 0.6 + stdScore * 0.4
    
    let detail: string
    if (spread < 0.15) {
        detail = 'Highly predictable outcomes - narrow range of results'
    } else if (spread < 0.25) {
        detail = `Reasonable uncertainty: ${(p10 * 100).toFixed(0)}% to ${(p90 * 100).toFixed(0)}% CAGR range`
    } else if (spread < 0.40) {
        detail = `Wide outcome range (${(spread * 100).toFixed(0)}% spread) - results will vary significantly`
    } else {
        detail = 'Highly unpredictable - outcomes span a very wide range'
    }
    
    return {
        name: 'Outcome Consistency',
        score: Math.round(combinedScore),
        weight: 0.15,
        description: 'Predictability of returns (P10-P90 spread)',
        detail
    }
}

/**
 * Calculate the Risk Efficiency Score (15% weight)
 * Measures: Are you being compensated for the risk you're taking?
 * 
 * Uses the Sharpe ratio distribution to assess risk-adjusted returns.
 * A high-risk strategy is more acceptable if it delivers proportionally high returns.
 */
const calculateRiskEfficiencyScore = (
    sharpeDistribution?: { median?: number; p10?: number; p90?: number }
): RiskComponent => {
    const medianSharpe = sharpeDistribution?.median ?? 0.5
    const p10Sharpe = sharpeDistribution?.p10 ?? 0.2
    
    // Score based on median Sharpe using a custom curve
    // >1.0 = excellent (85-100), 0.7-1.0 = good (65-85), 0.4-0.7 = acceptable (40-65), <0.4 = poor (0-40)
    // Using negative steepness makes sigmoid give HIGH scores for HIGH Sharpe values
    const medianScore = sigmoid(medianSharpe, 0.6, -10)
    
    // P10 Sharpe matters too - how efficient is the strategy in bad scenarios?
    const p10Score = sigmoid(p10Sharpe, 0.3, -12)
    
    const combinedScore = medianScore * 0.6 + p10Score * 0.4
    
    let detail: string
    if (medianSharpe > 1.0) {
        detail = `Excellent risk-adjusted returns (Sharpe: ${medianSharpe.toFixed(2)})`
    } else if (medianSharpe > 0.7) {
        detail = `Good risk efficiency (Sharpe: ${medianSharpe.toFixed(2)}) - well compensated for risk`
    } else if (medianSharpe > 0.4) {
        detail = `Moderate risk efficiency (Sharpe: ${medianSharpe.toFixed(2)}) - acceptable`
    } else {
        detail = `Low Sharpe (${medianSharpe.toFixed(2)}) - returns may not justify the volatility`
    }
    
    return {
        name: 'Risk-Reward Efficiency',
        score: Math.round(Math.max(0, Math.min(100, combinedScore))),
        weight: 0.15,
        description: 'Risk-adjusted returns (Sharpe ratio distribution)',
        detail
    }
}

/**
 * Generate actionable insights based on the risk analysis
 */
const generateInsights = (
    _components: RiskComponent[],
    lossProbability: number,
    drawdownAnalysis?: { worst?: number; p90?: number; median?: number; prob_30pct_drawdown?: number },
    drawdownProbabilities?: { prob_30pct_drawdown?: number; prob_40pct_drawdown?: number; prob_50pct_drawdown?: number },
    sharpeDistribution?: { median?: number; p10?: number },
    cagrP10?: number,
    _cagrMedian?: number
): RiskInsight[] => {
    const insights: RiskInsight[] = []
    const p90DD = Math.abs(drawdownAnalysis?.p90 || 0.40)
    const prob30 = drawdownProbabilities?.prob_30pct_drawdown ?? 0
    const prob50 = drawdownProbabilities?.prob_50pct_drawdown ?? 0
    
    // CRITICAL WARNINGS
    if (lossProbability > 0.35) {
        insights.push({
            type: 'warning',
            icon: 'alert',
            text: `High loss probability: ${(lossProbability * 100).toFixed(0)}% chance of ending below starting capital`,
            severity: 'critical'
        })
    }
    
    if (prob50 > 0.15) {
        insights.push({
            type: 'warning',
            icon: 'alert',
            text: `${(prob50 * 100).toFixed(0)}% chance of experiencing a 50%+ drawdown`,
            severity: 'critical'
        })
    }
    
    // CONCERNING WARNINGS
    if (lossProbability > 0.20 && lossProbability <= 0.35) {
        insights.push({
            type: 'warning',
            icon: 'trending',
            text: `${(lossProbability * 100).toFixed(0)}% probability of loss - moderate risk`,
            severity: 'concerning'
        })
    }
    
    if (prob30 > 0.40 && prob50 <= 0.15) {
        insights.push({
            type: 'warning',
            icon: 'chart',
            text: `${(prob30 * 100).toFixed(0)}% chance of 30%+ drawdown - prepare for volatility`,
            severity: 'concerning'
        })
    }
    
    const sharpeP10 = sharpeDistribution?.p10 ?? 0.3
    if (sharpeP10 < 0.2) {
        insights.push({
            type: 'warning',
            icon: 'zap',
            text: 'Poor risk efficiency in bad scenarios - returns may not justify volatility',
            severity: 'concerning'
        })
    }
    
    // STRENGTHS
    if (lossProbability < 0.08) {
        insights.push({
            type: 'strength',
            icon: 'shield',
            text: `Strong capital preservation: only ${(lossProbability * 100).toFixed(1)}% loss probability`,
            severity: 'positive'
        })
    }
    
    if (p90DD < 0.30) {
        insights.push({
            type: 'strength',
            icon: 'shield',
            text: `Well-controlled drawdowns: even P90 stays under ${(p90DD * 100).toFixed(0)}%`,
            severity: 'positive'
        })
    }
    
    const medianSharpe = sharpeDistribution?.median ?? 0.5
    if (medianSharpe > 0.9) {
        insights.push({
            type: 'strength',
            icon: 'target',
            text: `Excellent risk efficiency: median Sharpe ratio of ${medianSharpe.toFixed(2)}`,
            severity: 'positive'
        })
    }
    
    if ((cagrP10 ?? -0.05) > 0) {
        insights.push({
            type: 'strength',
            icon: 'trending',
            text: 'Even pessimistic scenarios (P10) show positive returns',
            severity: 'positive'
        })
    }
    
    // NEUTRAL OBSERVATIONS
    if (insights.length === 0) {
        insights.push({
            type: 'neutral',
            icon: 'chart',
            text: 'Risk profile is within typical ranges for diversified strategies'
        })
    }
    
    // Limit to top 4 most relevant insights
    return insights.slice(0, 4)
}

/**
 * Main risk score calculation function
 * 
 * Calculates a comprehensive risk score by combining 5 dimensions:
 * 1. Capital Preservation (25%) - probability of ending with profit
 * 2. Drawdown Resilience (25%) - typical and worst-case drawdowns  
 * 3. Tail Risk Protection (20%) - severity of catastrophic scenarios
 * 4. Outcome Consistency (15%) - predictability of results
 * 5. Risk-Reward Efficiency (15%) - Sharpe ratio distribution
 */
export const calculateRiskScore = (
    lossProbability: number,
    drawdownAnalysis?: { worst?: number; p90?: number; median?: number },
    statistics?: { std_cagr?: number; initial_capital?: number },
    // Extended inputs for intelligent scoring
    scenarios?: { worst_case?: { final_value?: number; cagr?: number }; pessimistic?: { cagr?: number } },
    sharpeDistribution?: { median?: number; p10?: number; p90?: number },
    cagrP10?: number,
    cagrP90?: number,
    cagrMedian?: number,
    drawdownProbabilities?: { prob_30pct_drawdown?: number; prob_40pct_drawdown?: number; prob_50pct_drawdown?: number }
): RiskScore => {
    const initialCapital = statistics?.initial_capital ?? 100000
    
    // Calculate each risk component
    const survivalComponent = calculateSurvivalScore(lossProbability)
    const painComponent = calculatePainToleranceScore(drawdownAnalysis)
    const tailComponent = calculateTailRiskScore(scenarios, initialCapital)
    const consistencyComponent = calculateConsistencyScore(cagrP10, cagrP90, statistics?.std_cagr)
    const efficiencyComponent = calculateRiskEfficiencyScore(sharpeDistribution)
    
    const components = [
        survivalComponent,
        painComponent,
        tailComponent,
        consistencyComponent,
        efficiencyComponent
    ]
    
    // Calculate weighted average (0-100 scale)
    const weightedScore = components.reduce(
        (sum, c) => sum + c.score * c.weight,
        0
    )
    
    // Convert to 1-10 scale with non-linear mapping
    // This ensures the score distribution feels meaningful:
    // 90-100 → 9-10, 75-90 → 7-8.5, 50-75 → 5-7, 25-50 → 3-5, 0-25 → 1-3
    const normalized = Math.max(0, Math.min(100, weightedScore))
    const finalScore = Math.max(1, Math.min(10, Math.round(normalized / 10)))
    
    // Generate insights
    const insights = generateInsights(
        components,
        lossProbability,
        drawdownAnalysis,
        drawdownProbabilities,
        sharpeDistribution,
        cagrP10,
        cagrMedian
    )
    
    // Determine label and color
    let label: string
    let color: 'emerald' | 'blue' | 'amber' | 'red'
    
    if (finalScore >= 8) {
        label = 'Low Risk'
        color = 'emerald'
    } else if (finalScore >= 6) {
        label = 'Moderate'
        color = 'blue'
    } else if (finalScore >= 4) {
        label = 'Elevated'
        color = 'amber'
    } else {
        label = 'High Risk'
        color = 'red'
    }
    
    return {
        score: finalScore,
        label,
        color,
        components,
        insights,
        confidenceNote: components.length === 5 
            ? 'Full analysis - all risk factors evaluated'
            : 'Partial analysis - some data unavailable'
    }
}

export const getRiskScoreColor = (color: string, isDark: boolean): string => {
    switch (color) {
        case 'emerald': return isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        case 'blue': return isDark ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
        case 'amber': return isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
        default: return isDark ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
    }
}

