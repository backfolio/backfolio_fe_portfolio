import { StrategyDSL } from '../../types/strategy';

/**
 * Pure utility functions for strategy manipulation.
 * These are extracted outside hooks to prevent recreation on each render.
 */

/**
 * CLEAN API V4.0: Normalize and validate strategy structure from parsed JSON.
 * - entry_condition is embedded directly in allocations
 * - No more switching_logic or allocation_rules arrays
 */
export const normalizeStrategy = (parsed: any): StrategyDSL => {
    // Ensure allocations exist
    if (!parsed.allocations) {
        parsed.allocations = {};
    }

    // Ensure allocation_order exists
    if (!parsed.allocation_order || !Array.isArray(parsed.allocation_order)) {
        parsed.allocation_order = Object.keys(parsed.allocations);
    }

    // Normalize each allocation to ensure proper structure
    Object.keys(parsed.allocations).forEach((name) => {
        const alloc = parsed.allocations[name];
        if (alloc && typeof alloc === 'object') {
            // Ensure allocation has nested structure
            if (!alloc.allocation && !alloc.entry_condition) {
                // Flat format - wrap it
                parsed.allocations[name] = {
                    allocation: alloc,
                    rebalancing_frequency: 'none'
                };
            } else if (!alloc.rebalancing_frequency) {
                alloc.rebalancing_frequency = 'none';
            }
        }
    });

    // Preserve cashflow fields (ensure they exist even if undefined -> null)
    if (!('cashflow_amount' in parsed)) {
        parsed.cashflow_amount = null;
    }
    if (!('cashflow_frequency' in parsed)) {
        parsed.cashflow_frequency = null;
    }

    return parsed as StrategyDSL;
};

/**
 * Check if graph has disconnected chains (prevents multi-strategy execution).
 */
export const calculateDisconnectedChains = (
    edges: Array<{ source: string; target: string }>,
    allocations: Record<string, any>
): boolean => {
    const allAllocations = Object.keys(allocations);

    // If no edges, all nodes are disconnected (multiple single-node chains)
    if (edges.length === 0 && allAllocations.length > 1) {
        return true;
    }

    // Build adjacency list for graph traversal
    const graph = new Map<string, Set<string>>();

    // Initialize graph with all allocations
    allAllocations.forEach(alloc => {
        graph.set(alloc, new Set());
    });

    // Add edges (treat as undirected graph)
    edges.forEach(({ source, target }) => {
        const sourceAlloc = source.replace('portfolio-', '');
        const targetAlloc = target.replace('portfolio-', '');

        if (graph.has(sourceAlloc) && graph.has(targetAlloc)) {
            graph.get(sourceAlloc)!.add(targetAlloc);
            graph.get(targetAlloc)!.add(sourceAlloc);
        }
    });

    // Find connected components using DFS
    const visited = new Set<string>();
    let componentCount = 0;

    const dfs = (node: string) => {
        visited.add(node);
        const neighbors = graph.get(node) || new Set();
        neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            }
        });
    };

    // Count connected components
    allAllocations.forEach(alloc => {
        if (!visited.has(alloc)) {
            componentCount++;
            dfs(alloc);
        }
    });

    // If more than 1 connected component, we have disconnected chains
    return componentCount > 1;
};

/**
 * Generate a unique name by appending _1, _2, etc. suffix.
 */
export const generateUniqueName = (baseName: string, existingNames: string[]): string => {
    const lowerCaseNames = existingNames.map(n => n.toLowerCase());

    if (!lowerCaseNames.includes(baseName.toLowerCase())) {
        return baseName;
    }

    let counter = 1;
    let uniqueName = `${baseName}_${counter}`;

    while (lowerCaseNames.includes(uniqueName.toLowerCase())) {
        counter++;
        uniqueName = `${baseName}_${counter}`;
    }

    return uniqueName;
};

