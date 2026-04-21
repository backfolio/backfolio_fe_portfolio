import { useState, useCallback, useDeferredValue, useEffect, useRef } from 'react';
import { StrategyDSL, BacktestConfig } from '../../types/strategy';
import { DEFAULT_DSL } from '../../constants/strategy';
import { normalizeStrategy } from './strategyUtils';

// LocalStorage key for persisting strategy
const STRATEGY_STORAGE_KEY = 'backfolio_current_strategy';

/**
 * Load strategy from localStorage if available
 * CLEAN API V4.0: entry_condition is embedded in allocations
 */
const loadFromLocalStorage = (defaultStrategy: StrategyDSL): StrategyDSL => {
    try {
        const stored = localStorage.getItem(STRATEGY_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validate it has required fields (allocations is the key field now)
            if (parsed.allocations) {
                return normalizeStrategy(parsed);
            }
        }
    } catch (e) {
        console.warn('Failed to load strategy from localStorage:', e);
    }
    return defaultStrategy;
};

/**
 * Save strategy to localStorage
 */
const saveToLocalStorage = (strategy: StrategyDSL): void => {
    try {
        localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(strategy));
    } catch (e) {
        console.warn('Failed to save strategy to localStorage:', e);
    }
};

/**
 * Clear strategy from localStorage
 */
const clearLocalStorage = (): void => {
    try {
        localStorage.removeItem(STRATEGY_STORAGE_KEY);
    } catch (e) {
        console.warn('Failed to clear strategy from localStorage:', e);
    }
};

export interface UseStrategyStateReturn {
    // State
    dslText: string;
    strategy: StrategyDSL;
    activeTab: 'json' | 'visual';
    showNewAllocationForm: boolean;
    newAllocationName: string;
    backtestConfig: BacktestConfig;
    // Version that increments when a NEW strategy is loaded (not on incremental edits)
    // Used by canvas to know when to do a full rebuild vs. incremental update
    strategyLoadVersion: number;

    // Setters
    setActiveTab: (tab: 'json' | 'visual') => void;
    setShowNewAllocationForm: (show: boolean) => void;
    setNewAllocationName: (name: string) => void;
    setBacktestConfig: React.Dispatch<React.SetStateAction<BacktestConfig>>;

    // Handlers
    handleDslChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    updateStrategy: (newStrategy: StrategyDSL) => void;
    resetStrategy: () => void;
    loadStrategyFromTemplate: (newStrategy: StrategyDSL) => void;
    formatJSON: () => boolean;
}

/**
 * Core state management for strategy DSL.
 * Uses useDeferredValue for debounced JSON parsing.
 * Persists strategy to localStorage for session continuity.
 */
export const useStrategyState = (defaultStrategy: StrategyDSL = DEFAULT_DSL): UseStrategyStateReturn => {
    // Load initial strategy from localStorage or use default
    const initialStrategy = useRef(loadFromLocalStorage(defaultStrategy)).current;

    // State for the JSON text editor
    const [dslText, setDslText] = useState<string>(JSON.stringify(initialStrategy, null, 2));

    // State for the visual strategy builder
    const [strategy, setStrategy] = useState<StrategyDSL>(initialStrategy);
    const [activeTab, setActiveTab] = useState<'json' | 'visual'>('visual');
    const [showNewAllocationForm, setShowNewAllocationForm] = useState(false);
    const [newAllocationName, setNewAllocationName] = useState('');

    // Version counter that increments when a NEW strategy is loaded
    // This signals to the canvas that it should do a full rebuild
    const [strategyLoadVersion, setStrategyLoadVersion] = useState(0);

    // Backtest configuration state
    const [backtestConfig, setBacktestConfig] = useState<BacktestConfig>({
        start_date: initialStrategy.start_date,
        end_date: initialStrategy.end_date,
        initial_capital: initialStrategy.initial_capital,
        rebalance_frequency: 'daily'
    });

    // Save to localStorage whenever strategy changes (debounced)
    useEffect(() => {
        saveToLocalStorage(strategy);
    }, [strategy]);

    // Debounced DSL text for parsing (React 18+ useDeferredValue)
    const deferredDslText = useDeferredValue(dslText);

    // Track if update came from updateStrategy to avoid re-parsing our own JSON
    const isInternalUpdate = useRef(false);

    // Parse JSON when deferred text changes (debounced)
    useEffect(() => {
        // Skip if this update came from updateStrategy (we already have the correct state)
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }

        try {
            const parsed = JSON.parse(deferredDslText);
            const normalized = normalizeStrategy(parsed);
            setStrategy(normalized);
        } catch {
            // Don't update the strategy state if the JSON is invalid
        }
    }, [deferredDslText]);

    // Handle DSL text change (no parsing, just update text)
    const handleDslChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDslText(event.target.value);
    }, []);

    // Update JSON when the strategy changes through the visual editor
    const updateStrategy = useCallback((newStrategy: StrategyDSL) => {
        // Mark this as an internal update to prevent the useEffect from re-parsing
        isInternalUpdate.current = true;
        setStrategy(newStrategy);
        const formatted = JSON.stringify(newStrategy, null, 2);
        setDslText(formatted);
    }, []);

    const resetStrategy = useCallback(() => {
        clearLocalStorage(); // Clear persisted strategy
        setDslText(JSON.stringify(defaultStrategy, null, 2));
        setStrategy(defaultStrategy);
        // Increment version to signal canvas to do a full rebuild
        setStrategyLoadVersion(v => v + 1);
    }, [defaultStrategy]);

    const loadStrategyFromTemplate = useCallback((newStrategy: StrategyDSL) => {
        // Mark this as an internal update to prevent the useEffect from re-parsing
        isInternalUpdate.current = true;
        setDslText(JSON.stringify(newStrategy, null, 2));
        setStrategy(newStrategy);
        // Increment version to signal canvas to do a full rebuild
        setStrategyLoadVersion(v => v + 1);
    }, []);

    const formatJSON = useCallback(() => {
        try {
            const parsed = JSON.parse(dslText);
            const formatted = JSON.stringify(parsed, null, 2);
            setDslText(formatted);
            setStrategy(parsed);
            return true;
        } catch {
            return false;
        }
    }, [dslText]);

    return {
        // State
        dslText,
        strategy,
        activeTab,
        showNewAllocationForm,
        newAllocationName,
        backtestConfig,
        strategyLoadVersion,

        // Setters
        setActiveTab,
        setShowNewAllocationForm,
        setNewAllocationName,
        setBacktestConfig,

        // Handlers
        handleDslChange,
        updateStrategy,
        resetStrategy,
        loadStrategyFromTemplate,
        formatJSON
    };
};

