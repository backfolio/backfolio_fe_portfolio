import { useCallback, useRef, useEffect } from 'react';
import { StrategyDSL, AllocationWithRebalancing } from '../../types/strategy';
import { generateUniqueName } from './strategyUtils';

export interface UseAllocationOperationsReturn {
    addAllocation: (name: string) => void;
    addAllocationWithAssets: (name: string, allocationWithRebalancing: AllocationWithRebalancing) => string | undefined;
    deleteAllocation: (name: string) => void;
    duplicateAllocation: (name: string) => string | null;
    renameAllocation: (oldName: string, newName: string) => void;
    updateAllocation: (name: string, allocationWithRebalancing: AllocationWithRebalancing) => void;
    removeSymbolFromAllocation: (allocationName: string, symbol: string) => void;
}

/**
 * Allocation CRUD operations.
 * Uses a ref to always access the latest strategy, preventing stale closure issues
 * that could cause fields like cashflow settings to be lost.
 */
export const useAllocationOperations = (
    strategy: StrategyDSL,
    updateStrategy: (s: StrategyDSL) => void,
    setNewAllocationName: (name: string) => void,
    setShowNewAllocationForm: (show: boolean) => void
): UseAllocationOperationsReturn => {
    // Use a ref to always access the latest strategy
    // This prevents stale closures from losing fields like cashflow_amount/frequency
    const strategyRef = useRef(strategy);
    useEffect(() => {
        strategyRef.current = strategy;
    }, [strategy]);

    const addAllocation = useCallback((name: string) => {
        if (!name.trim()) return;
        const currentStrategy = strategyRef.current;

        // Check for duplicate names (case-insensitive)
        const existingNames = Object.keys(currentStrategy.allocations).map(n => n.toLowerCase());
        if (existingNames.includes(name.toLowerCase())) {
            alert(`An allocation named "${name}" already exists. Please choose a different name.`);
            return;
        }

        // Auto-set as fallback if it's the first allocation
        const isFirstAllocation = Object.keys(currentStrategy.allocations).length === 0;

        const newStrategy = {
            ...currentStrategy,
            allocations: {
                ...currentStrategy.allocations,
                [name]: { allocation: {} }
            },
            fallback_allocation: isFirstAllocation ? name : currentStrategy.fallback_allocation
        };

        updateStrategy(newStrategy);
        setNewAllocationName('');
        setShowNewAllocationForm(false);
    }, [updateStrategy, setNewAllocationName, setShowNewAllocationForm]);

    const addAllocationWithAssets = useCallback((name: string, allocationWithRebalancing: AllocationWithRebalancing) => {
        if (!name.trim()) return;
        const currentStrategy = strategyRef.current;

        const existingNames = Object.keys(currentStrategy.allocations);
        const uniqueName = generateUniqueName(name, existingNames);

        // Auto-set as fallback if it's the first allocation
        const isFirstAllocation = existingNames.length === 0;

        const newStrategy = {
            ...currentStrategy,
            allocations: {
                ...currentStrategy.allocations,
                [uniqueName]: allocationWithRebalancing
            },
            fallback_allocation: isFirstAllocation ? uniqueName : currentStrategy.fallback_allocation
        };

        updateStrategy(newStrategy);

        // Return the unique name that was used (for UI feedback if needed)
        return uniqueName;
    }, [updateStrategy]);

    const deleteAllocation = useCallback((name: string) => {
        const currentStrategy = strategyRef.current;
        const newAllocations = { ...currentStrategy.allocations };
        delete newAllocations[name];

        // Auto-update fallback if deleting the current fallback
        const newFallback = currentStrategy.fallback_allocation === name
            ? Object.keys(newAllocations)[0] || ''
            : currentStrategy.fallback_allocation;

        // Update allocation_order to remove deleted allocation
        const newAllocationOrder = (currentStrategy.allocation_order || []).filter(
            allocName => allocName !== name
        );

        // Clean up canvas_positions for the deleted allocation
        let newCanvasPositions = currentStrategy.canvas_positions;
        if (currentStrategy.canvas_positions && currentStrategy.canvas_positions[name]) {
            newCanvasPositions = { ...currentStrategy.canvas_positions };
            delete newCanvasPositions[name];
        }

        // Clean up canvas_edges that reference the deleted allocation
        const newCanvasEdges = (currentStrategy.canvas_edges || []).filter(
            edge => edge.source !== name && edge.target !== name
        );

        updateStrategy({
            ...currentStrategy,
            allocations: newAllocations,
            fallback_allocation: newFallback,
            allocation_order: newAllocationOrder,
            canvas_positions: newCanvasPositions,
            canvas_edges: newCanvasEdges
        });
    }, [updateStrategy]);

    const duplicateAllocation = useCallback((name: string) => {
        const currentStrategy = strategyRef.current;
        const allocation = currentStrategy.allocations[name];
        if (!allocation) return null;

        const existingNames = Object.keys(currentStrategy.allocations);
        const newName = generateUniqueName(name, existingNames);

        // CLEAN API V4.0: Duplicate the allocation including entry_condition
        const newStrategy: StrategyDSL = {
            ...currentStrategy,
            allocations: {
                ...currentStrategy.allocations,
                [newName]: JSON.parse(JSON.stringify(allocation)) // Deep clone
            }
        };

        updateStrategy(newStrategy);
        return newName;
    }, [updateStrategy]);

    const renameAllocation = useCallback((oldName: string, newName: string) => {
        if (oldName === newName || !newName.trim()) return;
        const currentStrategy = strategyRef.current;

        // Create new allocations object with renamed key
        const newAllocations = { ...currentStrategy.allocations };
        newAllocations[newName] = newAllocations[oldName];
        delete newAllocations[oldName];

        // Auto-update fallback if renaming the current fallback
        const newFallback = currentStrategy.fallback_allocation === oldName ? newName : currentStrategy.fallback_allocation;

        // Update allocation_order with renamed allocation
        const newAllocationOrder = (currentStrategy.allocation_order || []).map(name =>
            name === oldName ? newName : name
        );

        // Update canvas_positions if they exist
        let newCanvasPositions = currentStrategy.canvas_positions;
        if (currentStrategy.canvas_positions && currentStrategy.canvas_positions[oldName]) {
            newCanvasPositions = { ...currentStrategy.canvas_positions };
            newCanvasPositions[newName] = newCanvasPositions[oldName];
            delete newCanvasPositions[oldName];
        }

        // Update canvas_edges with renamed allocation
        const newCanvasEdges = (currentStrategy.canvas_edges || []).map(edge => ({
            ...edge,
            source: edge.source === oldName ? newName : edge.source,
            target: edge.target === oldName ? newName : edge.target
        }));

        updateStrategy({
            ...currentStrategy,
            allocations: newAllocations,
            fallback_allocation: newFallback,
            allocation_order: newAllocationOrder,
            canvas_positions: newCanvasPositions,
            canvas_edges: newCanvasEdges
        });
    }, [updateStrategy]);

    const updateAllocation = useCallback((name: string, allocationWithRebalancing: AllocationWithRebalancing) => {
        const currentStrategy = strategyRef.current;
        const existingAllocation = currentStrategy.allocations[name];

        // Auto-set as fallback if fallback_allocation is empty
        const needsFallback = !currentStrategy.fallback_allocation || currentStrategy.fallback_allocation.trim() === '';

        // CLEAN API V4.0: Preserve entry_condition when updating allocation
        const updatedAllocation: AllocationWithRebalancing = {
            ...existingAllocation,
            ...allocationWithRebalancing
        };

        const newStrategy = {
            ...currentStrategy,
            allocations: {
                ...currentStrategy.allocations,
                [name]: updatedAllocation
            },
            fallback_allocation: needsFallback ? name : currentStrategy.fallback_allocation
        };

        updateStrategy(newStrategy);
    }, [updateStrategy]);

    const removeSymbolFromAllocation = useCallback((allocationName: string, symbol: string) => {
        const currentStrategy = strategyRef.current;
        const allocationWithRebalancing = { ...currentStrategy.allocations[allocationName] };
        const updatedAllocation = { ...allocationWithRebalancing.allocation };
        delete updatedAllocation[symbol];

        updateStrategy({
            ...currentStrategy,
            allocations: {
                ...currentStrategy.allocations,
                [allocationName]: { ...allocationWithRebalancing, allocation: updatedAllocation }
            }
        });
    }, [updateStrategy]);

    return {
        addAllocation,
        addAllocationWithAssets,
        deleteAllocation,
        duplicateAllocation,
        renameAllocation,
        updateAllocation,
        removeSymbolFromAllocation
    };
};

