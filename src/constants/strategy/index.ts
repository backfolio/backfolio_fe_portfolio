// Barrel export for all strategy constants
// This maintains backward compatibility with existing imports
import { StrategyDSL } from '../../types/strategy';
import { STATIC_STRATEGIES } from './static-strategies';
import { TACTICAL_STRATEGIES } from './tactical-strategies';

export { ALLOCATION_PRESETS } from './allocation-presets';
export { RULE_PRESETS } from './rule-presets';
export { DEFAULT_DSL, TACTICAL_EXAMPLE_STRATEGY } from './defaults';
export { STATIC_STRATEGIES } from './static-strategies';
export { TACTICAL_STRATEGIES } from './tactical-strategies';
export { STRATEGY_PRESET_METRICS } from './metrics';

// Combined strategy presets for backward compatibility
export const STRATEGY_PRESETS: Record<string, StrategyDSL> = {
    ...STATIC_STRATEGIES,
    ...TACTICAL_STRATEGIES
};
