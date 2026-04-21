import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    Node,
    Edge,
    Connection,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    BackgroundVariant,
    Panel,
    MarkerType,
    ConnectionMode,
    ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AllocationNode, TickerValidationStatus } from './nodes/AllocationNode';
import { RuleEdge } from './edges/RuleEdge';
import { PortfolioCreationModal } from './modals/PortfolioCreationModal';
import { RuleCreationModal } from './modals/RuleCreationModal';
import { RuleAssignmentModal } from './modals/RuleAssignmentModal';
import { JsonEditorModal } from './modals/JsonEditorModal';
import { DocumentationModal } from './modals/DocumentationModal';
import { ConfirmDialog } from './modals/ConfirmDialog';
import { AdvancedSettingsModal } from './modals/AdvancedSettingsModal';
import { ToastContainer, useToast } from './components/Toast';
import { EmptyCanvasState } from './components/EmptyCanvasState';
import { useTacticalStrategy } from '../../hooks/useTacticalStrategy';
import { Allocation, AllocationWithRebalancing, Condition, CompositeCondition } from '../../types/strategy';
import { useTheme } from '../../context/ThemeContext';
import { getEarliestCommonDate, createShare } from '../../services/api';
import { STRATEGY_PRESETS, STRATEGY_PRESET_METRICS } from '../../constants/strategy';
import { useRuleLibrary } from '../../hooks/useRuleLibrary';
import {
    MAX_PORTFOLIOS_PER_STRATEGY,
    TIMING,
    DEFAULT_VIEWPORT,
    CANVAS_BOUNDS,
    DEFAULT_PORTFOLIO_ALLOCATION,
    EDGE_COLORS,
    FIT_VIEW_PADDING,
    PRESET_FIT_VIEW_PADDING,
    FIT_VIEW_MAX_ZOOM,
    FIT_VIEW_MIN_ZOOM,
    DUPLICATE_NODE_OFFSET,
    getDefaultNodePosition,
} from './constants/canvas';

/**
 * StrategyCanvas - Visual node-based editor for portfolio strategies
 * 
 * Architecture:
 * - Uses ReactFlow for canvas rendering and node/edge management
 * - Maintains persistent position tracking via nodePositionsRef to prevent layout resets
 * - Syncs with useTacticalStrategy hook for strategy state management
 * - Supports drag-and-drop, duplicate, delete, rename operations
 * - Implements linked-list connection constraints (max 1 in/out per node)
 * - Auto-detects fallback portfolios based on rule assignments
 */

const nodeTypes = {
    allocation: AllocationNode,
};

const edgeTypes = {
    rule: RuleEdge,
};

interface StrategyCanvasProps {
    hook: ReturnType<typeof useTacticalStrategy>;
    onRunBacktest?: () => void;
    onRunMonteCarlo?: () => void;
    isBacktestLoading?: boolean;
    isMonteCarloLoading?: boolean;
    onEdgesChange?: (edges: Array<{ source: string; target: string }>) => void;
    onNodePositionsChange?: (positions: Map<string, { x: number; y: number }>) => void;
    onValidationStatusChange?: (hasInvalid: boolean, invalidPortfolios: { name: string; tickers: string[] }[]) => void;
    onRestoringStatusChange?: (isRestoring: boolean) => void;
}

export const StrategyCanvas: React.FC<StrategyCanvasProps> = ({
    hook,
    onRunBacktest,
    onRunMonteCarlo,
    isBacktestLoading = false,
    isMonteCarloLoading = false,
    onEdgesChange: notifyEdgesChange,
    onNodePositionsChange: notifyNodePositionsChange,
    onValidationStatusChange,
    onRestoringStatusChange,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    // Rule library hook for accessing saved rules
    const { rules: libraryRules } = useRuleLibrary();

    // Position tracking: persists node positions across re-renders to prevent layout resets
    // - Stores positions when nodes are dragged or duplicated
    // - Prioritizes: stored position > existing position > default grid layout
    const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

    // Note: Node callbacks (onUpdate, onRename, onDelete, etc.) are recreated when 
    // allocationsKey changes, which provides fresh closures with current hook state.
    // The callbacks use hook methods (updateAllocation, renameAllocation, etc.) which
    // internally access the current strategy, avoiding stale closure issues.

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [showAssignRuleModal, setShowAssignRuleModal] = useState(false);
    const [showJsonEditor, setShowJsonEditor] = useState(false);
    const [showDocumentation, setShowDocumentation] = useState(false);
    const [showPresetModal, setShowPresetModal] = useState(false);

    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [selectedAllocationForRule, setSelectedAllocationForRule] = useState<string | null>(null);

    // Toast notifications (replaces blocking alert() calls)
    const { toasts, showToast, dismissToast } = useToast();

    // Confirm dialog state (replaces blocking window.confirm())
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Ticker validation state - tracks validation status per portfolio
    const [tickerValidationStatus, setTickerValidationStatus] = useState<Map<string, TickerValidationStatus>>(new Map());
    const [invalidTickersMap, setInvalidTickersMap] = useState<Map<string, string[]>>(new Map());

    // Share button state
    const [isSharing, setIsSharing] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    // AbortController map for cancelling in-flight validation requests (prevents race conditions)
    const validationAbortRef = useRef<Map<string, AbortController>>(new Map());

    // Validate tickers for a specific portfolio
    const validatePortfolioTickers = useCallback(async (portfolioName: string, allocation: Allocation) => {
        const tickers = Object.keys(allocation).filter(t => t && t.trim());

        if (tickers.length === 0) {
            setTickerValidationStatus(prev => new Map(prev).set(portfolioName, 'valid'));
            setInvalidTickersMap(prev => {
                const next = new Map(prev);
                next.delete(portfolioName);
                return next;
            });
            return;
        }

        // Cancel any previous validation for this portfolio (prevents race conditions)
        validationAbortRef.current.get(portfolioName)?.abort();
        const controller = new AbortController();
        validationAbortRef.current.set(portfolioName, controller);

        // Set validating status
        setTickerValidationStatus(prev => new Map(prev).set(portfolioName, 'validating'));

        try {
            const result = await getEarliestCommonDate(tickers, { signal: controller.signal });

            if (result.tickers_missing && result.tickers_missing.length > 0) {
                setTickerValidationStatus(prev => new Map(prev).set(portfolioName, 'invalid'));
                setInvalidTickersMap(prev => new Map(prev).set(portfolioName, result.tickers_missing));
            } else {
                setTickerValidationStatus(prev => new Map(prev).set(portfolioName, 'valid'));
                setInvalidTickersMap(prev => {
                    const next = new Map(prev);
                    next.delete(portfolioName);
                    return next;
                });
            }
        } catch (err: unknown) {
            // Ignore aborted requests (they were superseded by a newer request)
            if (err instanceof Error && err.name === 'AbortError') return;
            console.error('Ticker validation error for', portfolioName, err);
            // On error, mark as unknown (don't block user)
            setTickerValidationStatus(prev => new Map(prev).set(portfolioName, 'unknown'));
        }
    }, []);

    // Check if all portfolios have valid tickers (for blocking backtest)
    const hasInvalidPortfolios = useCallback(() => {
        const allocationNames = Object.keys(hook.strategy.allocations);
        for (const name of allocationNames) {
            const status = tickerValidationStatus.get(name);
            if (status === 'invalid') {
                return true;
            }
        }
        return false;
    }, [hook.strategy.allocations, tickerValidationStatus]);

    // Get list of portfolios with invalid tickers (for error message)
    const getInvalidPortfoliosList = useCallback(() => {
        const invalid: { name: string; tickers: string[] }[] = [];
        invalidTickersMap.forEach((tickers, name) => {
            if (tickers.length > 0) {
                invalid.push({ name, tickers });
            }
        });
        return invalid;
    }, [invalidTickersMap]);

    // Cleanup abort controllers on unmount
    React.useEffect(() => {
        return () => {
            // Abort with a reason to prevent unhandled promise rejections
            validationAbortRef.current.forEach(controller => {
                try {
                    controller.abort('Component unmounted');
                } catch {
                    // Ignore errors during cleanup
                }
            });
            validationAbortRef.current.clear();
        };
    }, []);

    // Keyboard shortcut for documentation (? key)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open documentation on ? key (shift + / or just ? on some keyboards)
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                // Don't trigger if user is typing in an input
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return;
                }
                e.preventDefault();
                setShowDocumentation(true);
            }
            // Close documentation on Escape
            if (e.key === 'Escape' && showDocumentation) {
                setShowDocumentation(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showDocumentation]);

    // ============================================================================
    // Effects
    // ============================================================================

    // Track node position changes to persist them across renders
    React.useEffect(() => {
        nodes.forEach(node => {
            nodePositionsRef.current.set(node.id, node.position);
        });

        // Notify parent of position changes for allocation_order generation
        if (notifyNodePositionsChange) {
            notifyNodePositionsChange(nodePositionsRef.current);
        }
    }, [nodes, notifyNodePositionsChange]);

    // Notify parent of edge changes for disconnected chain validation
    React.useEffect(() => {
        if (notifyEdgesChange) {
            const simpleEdges = edges.map(e => ({ source: e.source, target: e.target }));
            notifyEdgesChange(simpleEdges);
        }
    }, [edges, notifyEdgesChange]);

    // Notify parent when validation status changes
    React.useEffect(() => {
        if (onValidationStatusChange) {
            const hasInvalid = hasInvalidPortfolios();
            const invalidList = getInvalidPortfoliosList();
            onValidationStatusChange(hasInvalid, invalidList);
        }
    }, [tickerValidationStatus, invalidTickersMap, onValidationStatusChange, hasInvalidPortfolios, getInvalidPortfoliosList]);

    // ============================================================================
    // Strategy Load & Sync (Simplified)
    // ============================================================================

    // Track the last loaded version to detect when a NEW strategy is loaded
    const lastLoadedVersionRef = useRef(hook.strategyLoadVersion);
    const hasInitializedCanvasState = useRef(false);
    const hasRestoredViewport = useRef(false);
    // Track if canvas is currently restoring state (prevents false validation errors during load)
    const [isRestoringCanvas, setIsRestoringCanvas] = useState(false);
    // Synchronous ref to guard edge sync effect from running during restoration
    // (state updates are async, but we need sync guard to prevent race conditions)
    const isRestoringCanvasRef = useRef(false);
    const skipAutoFallbackRef = useRef(false);
    const initialViewportRef = useRef(hook.strategy.canvas_viewport);

    // Notify parent when canvas restoration status changes (to suppress validation during load)
    React.useEffect(() => {
        if (onRestoringStatusChange) {
            onRestoringStatusChange(isRestoringCanvas);
        }
    }, [isRestoringCanvas, onRestoringStatusChange]);

    // Helper to build edges from strategy canvas_edges
    const buildEdgesFromStrategy = useCallback((strategyEdges: typeof hook.strategy.canvas_edges, allocations: typeof hook.strategy.allocations) => {
        if (!strategyEdges || strategyEdges.length === 0) return [];

        return strategyEdges
            .filter(edge => allocations[edge.source] && allocations[edge.target])
            .map(edge => {
                // Auto-correct handle IDs if they don't match node names
                // This handles the case where portfolios were renamed but edges weren't updated
                let sourceHandle = edge.sourceHandle;
                let targetHandle = edge.targetHandle;

                // Extract handle position (e.g., "right" from "OldName-right")
                if (sourceHandle && !sourceHandle.startsWith(edge.source + '-')) {
                    const parts = sourceHandle.split('-');
                    const handlePos = parts[parts.length - 1]; // Get last part (right, left, top, bottom)
                    sourceHandle = `${edge.source}-${handlePos}`;
                }
                if (targetHandle && !targetHandle.startsWith(edge.target + '-')) {
                    const parts = targetHandle.split('-');
                    const handlePos = parts[parts.length - 1];
                    targetHandle = `${edge.target}-${handlePos}`;
                }

                return {
                    id: `${edge.source}-${edge.target}`,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle,
                    targetHandle,
                    type: 'rule' as const,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: EDGE_COLORS.ARROW,
                    },
                    data: {
                        onDelete: () => {
                            setEdges((eds) => eds.filter((e) => e.id !== `${edge.source}-${edge.target}`));
                        },
                    },
                };
            });
    }, [setEdges]);

    // MAIN EFFECT: Load/rebuild canvas when a NEW strategy is loaded
    // This runs on initial mount AND when strategyLoadVersion changes (new strategy loaded)
    React.useEffect(() => {
        const isNewStrategyLoad = hook.strategyLoadVersion !== lastLoadedVersionRef.current;
        const isInitialMount = !hasInitializedCanvasState.current;

        if (!isInitialMount && !isNewStrategyLoad) {
            return;
        }

        // Track timeouts for cleanup
        const timeoutIds: ReturnType<typeof setTimeout>[] = [];

        // Mark that we're restoring canvas state to prevent false validation errors
        // Use BOTH state (for React effects) and ref (for synchronous guards)
        isRestoringCanvasRef.current = true;
        setIsRestoringCanvas(true);

        // Update tracking refs
        lastLoadedVersionRef.current = hook.strategyLoadVersion;
        hasInitializedCanvasState.current = true;

        const { canvas_edges, canvas_positions, canvas_viewport, allocations } = hook.strategy;

        // 1. Restore positions
        if (isNewStrategyLoad) {
            nodePositionsRef.current.clear(); // Clear old positions for new strategy
        }
        if (canvas_positions) {
            Object.entries(canvas_positions).forEach(([name, pos]) => {
                nodePositionsRef.current.set(name, pos);
            });
        }

        // 2. Restore edges
        if (canvas_edges && canvas_edges.length > 0 && Object.keys(allocations).length > 0) {
            const restoredEdges = buildEdgesFromStrategy(canvas_edges, allocations);
            if (restoredEdges.length > 0) {
                setEdges(restoredEdges);
            }
        } else if (isNewStrategyLoad) {
            setEdges([]); // Clear edges for new strategy without saved edges
        }

        // 3. Restore viewport
        if (canvas_viewport) {
            initialViewportRef.current = canvas_viewport;
            hasRestoredViewport.current = false;

            if (reactFlowInstance) {
                timeoutIds.push(setTimeout(() => {
                    reactFlowInstance.setViewport(canvas_viewport, { duration: isInitialMount ? 0 : TIMING.VIEWPORT_ANIMATION });
                    hasRestoredViewport.current = true;
                }, isInitialMount ? 0 : TIMING.VIEWPORT_RESTORE_DELAY));
            }
        }

        // Note: isRestoringCanvas is reset by a separate effect that monitors when
        // the edges state matches the expected strategy edges (see below)

        // Cleanup timeouts on effect re-run or unmount
        return () => {
            timeoutIds.forEach(clearTimeout);
        };
    }, [hook.strategyLoadVersion, hook.strategy, buildEdgesFromStrategy, reactFlowInstance]);

    // Effect to detect when canvas restoration is complete
    // This fires when edges state matches the expected edges from strategy
    React.useEffect(() => {
        if (!isRestoringCanvas) return;

        const expectedEdges = hook.strategy.canvas_edges || [];
        const currentEdgeCount = edges.length;
        const expectedEdgeCount = expectedEdges.length;

        // Check if edges match expected state (or both are empty)
        const edgesMatch = currentEdgeCount === expectedEdgeCount;

        // Also ensure nodes exist if we have allocations
        const allocationCount = Object.keys(hook.strategy.allocations).length;
        const nodesExist = allocationCount === 0 || nodes.length >= allocationCount;

        if (edgesMatch && nodesExist) {
            // Use a longer delay to ensure:
            // 1. React has flushed all state updates
            // 2. The edges notification effect has run and propagated to parent
            // This prevents race conditions where parent sees isRestoring=false before edges are synced
            const timeoutId = setTimeout(() => {
                isRestoringCanvasRef.current = false;
                setIsRestoringCanvas(false);
            }, 150);
            return () => clearTimeout(timeoutId);
        }
    }, [isRestoringCanvas, edges.length, nodes.length, hook.strategy.canvas_edges, hook.strategy.allocations]);

    // Track the last synced edges to detect user-initiated changes
    const lastSyncedEdgesRef = useRef<string>('');

    // CLEAN API V4.0: Compute fallback from chain structure
    // The fallback is the first portfolio in the chain that doesn't have entry_condition
    const computeFallbackFromEdges = useCallback((currentEdges: typeof edges, allocations: typeof hook.strategy.allocations) => {
        const allocationNames = Object.keys(allocations);
        if (allocationNames.length === 0) return hook.strategy.fallback_allocation;

        // If no edges, find first allocation without entry_condition (by name order)
        if (currentEdges.length === 0) {
            for (const name of allocationNames) {
                if (!allocations[name]?.entry_condition) {
                    return name;
                }
            }
            return allocationNames[0];
        }

        // Build adjacency map to traverse chain
        const outgoingEdges = new Map<string, string>(); // source -> target
        const hasIncoming = new Set<string>();

        currentEdges.forEach(edge => {
            outgoingEdges.set(edge.source, edge.target);
            hasIncoming.add(edge.target);
        });

        // Find chain start: node with outgoing edge but no incoming edge
        const chainStart = allocationNames.find(name =>
            outgoingEdges.has(name) && !hasIncoming.has(name)
        ) || allocationNames.find(name => outgoingEdges.has(name)) || allocationNames[0];

        // Walk the chain from start, find FIRST node without entry_condition = fallback
        const visited = new Set<string>();
        let current = chainStart;

        while (current && !visited.has(current)) {
            visited.add(current);

            // CLEAN API V4.0: Check if allocation has entry_condition
            const hasEntryCondition = !!allocations[current]?.entry_condition;

            if (!hasEntryCondition) {
                // First node without entry_condition is the fallback (stopping point)
                return current;
            }

            current = outgoingEdges.get(current) || '';
        }

        // If all nodes have entry_condition, return chain start as fallback
        return chainStart;
    }, [hook.strategy.fallback_allocation, hook.strategy.allocations]);

    // Sync edges to strategy ONLY when user adds/removes connections (not during strategy load)
    React.useEffect(() => {
        if (!hasInitializedCanvasState.current) return;

        // Skip during canvas restoration (edges were just restored from strategy)
        // Use BOTH ref (sync guard for same-render-cycle) and state (for subsequent renders)
        if (isRestoringCanvasRef.current || isRestoringCanvas) return;

        const currentEdgesKey = JSON.stringify(edges.map(e => ({ source: e.source, target: e.target })));

        // Skip if edges haven't actually changed (prevents loops)
        if (currentEdgesKey === lastSyncedEdgesRef.current) return;

        lastSyncedEdgesRef.current = currentEdgesKey;

        const canvasEdges = edges.map(e => ({
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle || undefined,
            targetHandle: e.targetHandle || undefined,
        }));

        const canvasPositions: { [key: string]: { x: number; y: number } } = {};
        nodePositionsRef.current.forEach((pos, name) => {
            canvasPositions[name] = pos;
        });

        const viewport = reactFlowInstance?.getViewport();

        // Compute fallback from chain structure (prevents separate effect cascade)
        const computedFallback = computeFallbackFromEdges(edges, hook.strategy.allocations);

        hook.updateStrategy({
            ...hook.strategy,
            canvas_edges: canvasEdges,
            canvas_positions: canvasPositions,
            canvas_viewport: viewport,
            fallback_allocation: computedFallback,
        });
    }, [edges, reactFlowInstance, hook, computeFallbackFromEdges, isRestoringCanvas]);

    // Sync viewport when user pans/zooms
    const handleMoveEnd = useCallback(() => {
        if (!hasInitializedCanvasState.current || !reactFlowInstance) return;

        const viewport = reactFlowInstance.getViewport();
        hook.updateStrategy({
            ...hook.strategy,
            canvas_viewport: viewport,
        });
    }, [reactFlowInstance, hook]);

    // Sync node positions when user drags a node
    const handleNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
        if (!hasInitializedCanvasState.current) return;

        // Update position ref
        nodePositionsRef.current.set(node.id, node.position);

        // Sync all positions to strategy
        const canvasPositions: { [key: string]: { x: number; y: number } } = {};
        nodePositionsRef.current.forEach((pos, name) => {
            canvasPositions[name] = pos;
        });

        hook.updateStrategy({
            ...hook.strategy,
            canvas_positions: canvasPositions,
        });
    }, [hook]);

    // Handler for ReactFlow initialization - set viewport immediately
    const handleInit = useCallback((instance: any) => {
        setReactFlowInstance(instance);

        // Immediately restore viewport if we have one saved
        if (initialViewportRef.current && !hasRestoredViewport.current) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                instance.setViewport(initialViewportRef.current!, { duration: 0 });
                hasRestoredViewport.current = true;
            });
        }
    }, []);

    // Fallback: if no saved viewport and we have nodes, fit view after nodes render
    React.useEffect(() => {
        if (hasRestoredViewport.current || !reactFlowInstance) return;
        if (initialViewportRef.current) return; // We have a saved viewport, handled in onInit

        // No saved viewport - wait for nodes then fit
        if (nodes.length > 0) {
            const timeoutId = setTimeout(() => {
                reactFlowInstance.fitView({ padding: FIT_VIEW_PADDING, duration: TIMING.VIEWPORT_ANIMATION, maxZoom: FIT_VIEW_MAX_ZOOM, minZoom: FIT_VIEW_MIN_ZOOM });
                hasRestoredViewport.current = true;
            }, TIMING.FIT_VIEW_DELAY);
            return () => clearTimeout(timeoutId);
        }
    }, [reactFlowInstance, nodes.length]);

    // ============================================================================
    // Node Management Handlers
    // ============================================================================

    const handleDuplicateNode = useCallback((sourceNodeId: string) => {
        // Safety check: limit portfolios per strategy
        if (Object.keys(hook.strategy.allocations).length >= MAX_PORTFOLIOS_PER_STRATEGY) {
            return;
        }

        const sourceNode = nodes.find(n => n.id === sourceNodeId);
        if (!sourceNode) return;

        // Create duplicate allocation via hook
        const newName = hook.duplicateAllocation(sourceNodeId);
        if (!newName) return;

        // Pre-store position for the new node (300px to the right of source)
        // The initialization effect will pick this up when the allocation is created
        nodePositionsRef.current.set(newName, {
            x: sourceNode.position.x + DUPLICATE_NODE_OFFSET.X,
            y: sourceNode.position.y + DUPLICATE_NODE_OFFSET.Y,
        });
    }, [hook, nodes]);

    // Handle sharing strategy with copy to clipboard
    const handleShare = useCallback(async () => {
        if (isSharing) return;

        setIsSharing(true);
        setShareCopied(false);

        try {
            // Build canvas state from current positions and edges
            const canvasState = {
                edges: edges.map(e => ({ source: e.source, target: e.target })),
                positions: Object.fromEntries(nodePositionsRef.current),
                viewport: reactFlowInstance?.getViewport(),
            };

            const response = await createShare({
                strategy_dsl: hook.strategy as unknown as Record<string, unknown>,
                canvas_state: canvasState as Record<string, unknown>,
            });

            if (response.success && response.share_url) {
                // Try to copy to clipboard
                let copied = false;
                try {
                    await navigator.clipboard.writeText(response.share_url);
                    copied = true;
                } catch (clipboardError) {
                    // Fallback for Safari: use a temporary textarea
                    try {
                        const textArea = document.createElement('textarea');
                        textArea.value = response.share_url;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-9999px';
                        document.body.appendChild(textArea);
                        textArea.select();
                        const success = document.execCommand('copy');
                        document.body.removeChild(textArea);
                        copied = success;
                    } catch (fallbackError) {
                        console.error('Fallback copy failed:', fallbackError);
                    }
                }

                if (copied) {
                    setShareCopied(true);
                    showToast('Link copied to clipboard!', 'success');
                    setTimeout(() => setShareCopied(false), 3000);
                } else {
                    // Safari fallback: prompt user to copy manually
                    const manualCopy = window.prompt('Copy this share link:', response.share_url);
                    if (manualCopy !== null) {
                        showToast('Share link ready!', 'success');
                    }
                }
            } else {
                throw new Error(response.error || 'Failed to create share link');
            }
        } catch (error) {
            console.error('Share error:', error);
            showToast('Failed to create share link', 'error');
        } finally {
            setIsSharing(false);
        }
    }, [isSharing, edges, reactFlowInstance, hook.strategy, showToast]);

    // ============================================================================
    // Node Initialization & Synchronization Effects
    // ============================================================================

    // Initialize nodes from strategy allocations
    // Use a stable key to prevent unnecessary re-renders
    const allocationsKey = React.useMemo(() =>
        JSON.stringify(Object.keys(hook.strategy.allocations).sort()),
        [hook.strategy.allocations]
    );

    React.useEffect(() => {
        const allocationNames = Object.keys(hook.strategy.allocations);
        if (allocationNames.length === 0) return;

        // Mark canvas as initialized after first node render
        hasInitializedCanvasState.current = true;

        setNodes((currentNodes) => {
            const existingNodeMap = new Map(currentNodes.map(n => [n.id, n]));

            return allocationNames.map((name, index) => {
                const allocationWithRebalancing = hook.strategy.allocations[name];

                // isFallback is computed by the sync effect below based on chain analysis
                // Initialize to false here - the sync effect will set the correct value
                // This prevents multiple nodes from being marked as fallback simultaneously
                const existingNode = existingNodeMap.get(name);
                const isFallback = false; // Sync effect will set the correct fallback

                // Priority: stored position > existing position > default grid position
                const storedPosition = nodePositionsRef.current.get(name);

                const position = storedPosition || existingNode?.position || getDefaultNodePosition(index);

                // Store this position for future reference
                if (!storedPosition && existingNode?.position) {
                    nodePositionsRef.current.set(name, existingNode.position);
                } else if (!storedPosition) {
                    nodePositionsRef.current.set(name, position);
                }

                return {
                    id: name,
                    type: 'allocation',
                    position,
                    data: {
                        name,
                        allocation: allocationWithRebalancing.allocation,
                        isFallback,
                        entryCondition: allocationWithRebalancing.entry_condition,
                        rebalancingFrequency: allocationWithRebalancing.rebalancing_frequency,
                        canDuplicate: allocationNames.length < MAX_PORTFOLIOS_PER_STRATEGY,
                        validationStatus: tickerValidationStatus.get(name) || 'unknown',
                        invalidTickers: invalidTickersMap.get(name) || [],
                        onUpdate: (newAllocation: Allocation, rebalancingFrequency?: string) => {
                            hook.updateAllocation(name, {
                                allocation: newAllocation,
                                rebalancing_frequency: rebalancingFrequency as any,
                            });
                            // Trigger async validation after save
                            validatePortfolioTickers(name, newAllocation);
                        },
                        onRename: (newName: string) => {
                            hook.renameAllocation(name, newName);
                            // Update position tracking
                            const pos = nodePositionsRef.current.get(name);
                            if (pos) {
                                nodePositionsRef.current.delete(name);
                                nodePositionsRef.current.set(newName, pos);
                            }
                            setNodes((nds) =>
                                nds.map((n) => (n.id === name ? { ...n, id: newName, data: { ...n.data, name: newName }, position: n.position } : n))
                            );
                            setEdges((eds) =>
                                eds.map((e) => ({
                                    ...e,
                                    source: e.source === name ? newName : e.source,
                                    target: e.target === name ? newName : e.target,
                                    // Update handle IDs when renaming
                                    sourceHandle: e.source === name && e.sourceHandle
                                        ? e.sourceHandle.replace(name, newName)
                                        : e.sourceHandle,
                                    targetHandle: e.target === name && e.targetHandle
                                        ? e.targetHandle.replace(name, newName)
                                        : e.targetHandle,
                                }))
                            );
                        },
                        onDelete: () => {
                            hook.deleteAllocation(name);
                            nodePositionsRef.current.delete(name); // Clean up position tracking
                            setNodes((nds) => nds.filter((n) => n.id !== name));
                            setEdges((eds) =>
                                eds.filter((e) => e.source !== name && e.target !== name)
                            );
                        },
                        onDuplicate: () => {
                            handleDuplicateNode(name);
                        },
                        onManageRules: () => {
                            setSelectedAllocationForRule(name);
                            setShowAssignRuleModal(true);
                        },
                        onClearRules: () => {
                            hook.removeEntryCondition(name);
                        },
                        onFitView: () => {
                            if (reactFlowInstance) {
                                reactFlowInstance.fitView({ padding: FIT_VIEW_PADDING, duration: TIMING.FIT_VIEW_ANIMATION, maxZoom: FIT_VIEW_MAX_ZOOM, minZoom: FIT_VIEW_MIN_ZOOM });
                            }
                        },
                    },
                };
            });
        });
        // Note: fallback_allocation is NOT in dependencies because fallback status updates are 
        // handled incrementally by the node sync effect below, which avoids full node recreation.
        // CLEAN API V4.0: entry_condition is embedded in allocations, tracked via allocationsKey
    }, [allocationsKey, hook.strategy.allocations, tickerValidationStatus, invalidTickersMap, validatePortfolioTickers, reactFlowInstance]);

    // Sync nodes with strategy changes (for entry_condition and fallback status)
    const edgesKey = React.useMemo(
        () => JSON.stringify(edges.map(e => ({ source: e.source, target: e.target }))),
        [edges]
    );

    React.useEffect(() => {
        // CLEAN API V4.0: Sync nodes with entry_condition from allocations
        // This effect sets entryCondition and isFallback on nodes

        setNodes((nds) => {
            // No fallback needed for single node (per requirements)
            if (nds.length <= 1) {
                return nds.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        entryCondition: hook.strategy.allocations[node.id]?.entry_condition,
                        isFallback: false,
                    },
                }));
            }

            const incomingMap = new Map<string, number>();
            const outgoingMap = new Map<string, number>();

            // Count incoming and outgoing edges for each node
            edges.forEach((edge) => {
                outgoingMap.set(edge.source, (outgoingMap.get(edge.source) || 0) + 1);
                incomingMap.set(edge.target, (incomingMap.get(edge.target) || 0) + 1);
            });

            const fallbackNodes = new Set<string>();

            // Case 1: No edges at all - find first node without entry_condition
            if (edges.length === 0) {
                for (const node of nds) {
                    const hasEntryCondition = !!hook.strategy.allocations[node.id]?.entry_condition;
                    if (!hasEntryCondition) {
                        fallbackNodes.add(node.id);
                        break; // Only one fallback
                    }
                }
            } else {
                // Case 2: Edges exist - build chains and find fallback in each chain
                const chains: string[][] = [];
                const visited = new Set<string>();

                // Find chain starts (nodes with no incoming edges but have outgoing)
                nds.forEach((node) => {
                    const hasIncoming = (incomingMap.get(node.id) || 0) > 0;
                    const hasOutgoing = (outgoingMap.get(node.id) || 0) > 0;

                    if (!hasIncoming && hasOutgoing && !visited.has(node.id)) {
                        // This is a chain start - traverse the chain
                        const chain: string[] = [];
                        let current = node.id;

                        while (current && !visited.has(current)) {
                            chain.push(current);
                            visited.add(current);

                            // Find next node in chain
                            const edge = edges.find(e => e.source === current);
                            current = edge?.target || '';
                        }

                        if (chain.length > 0) {
                            chains.push(chain);
                        }
                    }
                });

                // For each chain, find the FIRST node without entry_condition = fallback (stopping point)
                chains.forEach((chain) => {
                    for (const nodeId of chain) {
                        // CLEAN API V4.0: Check entry_condition directly on allocation
                        const hasEntryCondition = !!hook.strategy.allocations[nodeId]?.entry_condition;

                        if (!hasEntryCondition) {
                            // First node in chain without entry_condition = fallback
                            fallbackNodes.add(nodeId);
                            break; // Only one fallback per chain
                        }
                    }
                });
            }

            return nds.map((node) => {
                // CLEAN API V4.0: Get entry_condition from allocation
                const entryCondition = hook.strategy.allocations[node.id]?.entry_condition;
                const isFallback = fallbackNodes.has(node.id);

                return {
                    ...node,
                    data: {
                        ...node.data,
                        entryCondition,
                        isFallback,
                    },
                };
            });
        });
    }, [allocationsKey, edgesKey, hook.strategy.allocations, hook.strategy.fallback_allocation]);

    // Note: fallback_allocation is now computed automatically in the edge sync effect above
    // (computeFallbackFromEdges) - no separate effect needed, which prevents cascading updates

    // ============================================================================
    // Connection Handlers
    // ============================================================================

    const onConnect = useCallback(
        (params: Connection) => {
            if (!params.source || !params.target) return;
            if (params.source === params.target) return;

            const sourceNode = nodes.find((n) => n.id === params.source);
            const targetNode = nodes.find((n) => n.id === params.target);
            if (!sourceNode || !targetNode) return;

            // Check if edge already exists
            const edgeExists = edges.some(
                (e) => e.source === params.source && e.target === params.target
            );
            if (edgeExists) return;

            // Linked-list constraint: max 1 outgoing edge per node
            const sourceHasOutgoing = edges.some((e) => e.source === params.source);
            if (sourceHasOutgoing) {
                showToast('This portfolio already has an outgoing connection. Each portfolio can only have one outgoing arrow (linked-list structure).', 'warning');
                return;
            }

            // Linked-list constraint: max 1 incoming edge per node
            const targetHasIncoming = edges.some((e) => e.target === params.target);
            if (targetHasIncoming) {
                showToast('Target portfolio already has an incoming connection. Each portfolio can only have one incoming arrow (linked-list structure).', 'warning');
                return;
            }

            // Create edge with SPECIFIC handle IDs to preserve which sides are connected
            const newEdge: Edge = {
                id: `${params.source}-${params.target}`,
                source: params.source,
                target: params.target,
                sourceHandle: params.sourceHandle,  // CRITICAL: preserve which handle on source
                targetHandle: params.targetHandle,  // CRITICAL: preserve which handle on target
                type: 'rule',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: EDGE_COLORS.ARROW,
                },
                data: {
                    onDelete: () => {
                        setEdges((eds) => eds.filter((e) => e.id !== `${params.source}-${params.target}`));
                    },
                },
            };

            setEdges((eds) => {
                const updatedEdges = [...eds, newEdge];
                return updatedEdges;
            });
        },
        [nodes, edges, showToast, setEdges]
    );

    // ============================================================================
    // Portfolio Creation Handlers
    // ============================================================================

    // Quick create - adds empty portfolio to canvas for inline configuration
    const handleQuickCreatePortfolio = () => {
        const count = Object.keys(hook.strategy.allocations).length;

        // Limit portfolios per strategy
        if (count >= MAX_PORTFOLIOS_PER_STRATEGY) {
            showToast(`Maximum of ${MAX_PORTFOLIOS_PER_STRATEGY} portfolios per strategy reached.`, 'warning');
            return;
        }

        const name = `Portfolio ${count + 1}`;
        const allocation: Allocation = { ...DEFAULT_PORTFOLIO_ALLOCATION }; // Default single asset

        const actualName = hook.addAllocationWithAssets(name, { allocation, rebalancing_frequency: 'none' });

        if (actualName) {
            const position = reactFlowInstance
                ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 100 })
                : getDefaultNodePosition(count);

            const newNode: Node = {
                id: actualName,
                type: 'allocation',
                position,
                data: {
                    name: actualName,
                    allocation,
                    isFallback: false,
                    entryCondition: undefined,
                    rebalancingFrequency: 'yearly',
                    isNewlyCreated: true, // Flag to auto-open edit mode
                    canDuplicate: (count + 1) < MAX_PORTFOLIOS_PER_STRATEGY, // After adding this one, check if we can still duplicate
                    validationStatus: 'unknown' as TickerValidationStatus,
                    invalidTickers: [],
                    onUpdate: (newAllocation: Allocation, rebalancingFrequency?: string) => {
                        hook.updateAllocation(actualName, {
                            allocation: newAllocation,
                            rebalancing_frequency: rebalancingFrequency as any,
                        });
                        // Trigger async validation after save
                        validatePortfolioTickers(actualName, newAllocation);
                    },
                    onRename: (newName: string) => {
                        hook.renameAllocation(actualName, newName);
                        setNodes((nds) =>
                            nds.map((n) => (n.id === actualName ? { ...n, id: newName, data: { ...n.data, name: newName }, position: n.position } : n))
                        );
                        setEdges((eds) =>
                            eds.map((e) => ({
                                ...e,
                                source: e.source === actualName ? newName : e.source,
                                target: e.target === actualName ? newName : e.target,
                                // Update handle IDs when renaming
                                sourceHandle: e.source === actualName && e.sourceHandle
                                    ? e.sourceHandle.replace(actualName, newName)
                                    : e.sourceHandle,
                                targetHandle: e.target === actualName && e.targetHandle
                                    ? e.targetHandle.replace(actualName, newName)
                                    : e.targetHandle,
                            }))
                        );
                    },
                    onDelete: () => {
                        hook.deleteAllocation(actualName);
                        setNodes((nds) => nds.filter((n) => n.id !== actualName));
                        setEdges((eds) =>
                            eds.filter((e) => e.source !== actualName && e.target !== actualName)
                        );
                    },
                    onDuplicate: () => {
                        handleDuplicateNode(actualName);
                    },
                    onManageRules: () => {
                        setSelectedAllocationForRule(actualName);
                        setShowAssignRuleModal(true);
                    },
                    onClearRules: () => {
                        hook.removeEntryCondition(actualName);
                    },
                },
            };

            setNodes((nds) => nds.concat(newNode));

            // Auto-fit view after adding node
            setTimeout(() => {
                if (reactFlowInstance) {
                    reactFlowInstance.fitView({ padding: FIT_VIEW_PADDING, duration: TIMING.FIT_VIEW_ANIMATION, maxZoom: FIT_VIEW_MAX_ZOOM, minZoom: FIT_VIEW_MIN_ZOOM });
                }
            }, TIMING.FIT_VIEW_DELAY);
        }
    };

    const handleCreatePortfolio = (name: string, allocationWithRebalancing: AllocationWithRebalancing) => {
        // Limit portfolios per strategy
        if (Object.keys(hook.strategy.allocations).length >= MAX_PORTFOLIOS_PER_STRATEGY) {
            showToast(`Maximum of ${MAX_PORTFOLIOS_PER_STRATEGY} portfolios per strategy reached.`, 'warning');
            setShowPortfolioModal(false);
            return;
        }

        // Use the provided name directly (which comes from template or custom input)
        const actualName = hook.addAllocationWithAssets(name, allocationWithRebalancing);

        if (actualName) {
            const position = getDefaultNodePosition(Object.keys(hook.strategy.allocations).length);

            const newNode: Node = {
                id: actualName,
                type: 'allocation',
                position,
                data: {
                    name: actualName,
                    allocation: allocationWithRebalancing.allocation,
                    isFallback: false,
                    entryCondition: allocationWithRebalancing.entry_condition,
                    rebalancingFrequency: allocationWithRebalancing.rebalancing_frequency || 'yearly',
                    isNewlyCreated: false,
                    canDuplicate: Object.keys(hook.strategy.allocations).length < MAX_PORTFOLIOS_PER_STRATEGY,
                    validationStatus: 'unknown' as TickerValidationStatus,
                    invalidTickers: [],
                    onUpdate: (newAllocation: Allocation, rebalancingFrequency?: string) => {
                        hook.updateAllocation(actualName, {
                            allocation: newAllocation,
                            rebalancing_frequency: rebalancingFrequency as any,
                        });
                        // Trigger async validation after save
                        validatePortfolioTickers(actualName, newAllocation);
                    },
                    onRename: (newName: string) => {
                        hook.renameAllocation(actualName, newName);
                        setNodes((nds) =>
                            nds.map((n) => (n.id === actualName ? { ...n, id: newName, data: { ...n.data, name: newName }, position: n.position } : n))
                        );
                        setEdges((eds) =>
                            eds.map((e) => ({
                                ...e,
                                source: e.source === actualName ? newName : e.source,
                                target: e.target === actualName ? newName : e.target,
                                // Update handle IDs when renaming
                                sourceHandle: e.source === actualName && e.sourceHandle
                                    ? e.sourceHandle.replace(actualName, newName)
                                    : e.sourceHandle,
                                targetHandle: e.target === actualName && e.targetHandle
                                    ? e.targetHandle.replace(actualName, newName)
                                    : e.targetHandle,
                            }))
                        );
                    },
                    onDelete: () => {
                        hook.deleteAllocation(actualName);
                        setNodes((nds) => nds.filter((n) => n.id !== actualName));
                        setEdges((eds) =>
                            eds.filter((e) => e.source !== actualName && e.target !== actualName)
                        );
                    },
                    onDuplicate: () => {
                        handleDuplicateNode(actualName);
                    },
                    onManageRules: () => {
                        setSelectedAllocationForRule(actualName);
                        setShowAssignRuleModal(true);
                    },
                    onClearRules: () => {
                        hook.removeEntryCondition(actualName);
                    },
                },
            };

            setNodes((nds) => nds.concat(newNode));

            // Trigger validation for the new portfolio
            validatePortfolioTickers(actualName, allocationWithRebalancing.allocation);

            // Auto-fit view after adding node
            setTimeout(() => {
                if (reactFlowInstance) {
                    reactFlowInstance.fitView({ padding: FIT_VIEW_PADDING, duration: TIMING.FIT_VIEW_ANIMATION, maxZoom: FIT_VIEW_MAX_ZOOM, minZoom: FIT_VIEW_MIN_ZOOM });
                }
            }, TIMING.FIT_VIEW_DELAY);
        }
        setShowPortfolioModal(false);
    };

    // ============================================================================
    // Rule Management Handlers (CLEAN API V4.0)
    // entry_condition is embedded directly in allocations
    // ============================================================================

    const handleCreateRule = (ruleData: any) => {
        // In CLEAN API V4.0, rules are entry_condition embedded in allocations
        // If there's a target allocation, set the entry_condition on it
        if (ruleData.target_allocation && ruleData.condition) {
            hook.setEntryCondition(ruleData.target_allocation, ruleData.condition);
        }

        // Store rule in session_rules for reuse (if it has a name)
        if (ruleData.name && ruleData.condition) {
            hook.addSessionRule({
                name: ruleData.name,
                condition: ruleData.condition,
                target_allocation: ruleData.target_allocation || ''
            });
        }

        // Don't close modal - let users add multiple rules
    };

    /**
     * Parse rule expression like "Rule1 AND Rule2 OR Rule3" into a CompositeCondition
     * Converts rule names to their actual condition objects from:
     * 1. Library rules (saved via API for authenticated users)
     * 2. Session rules (stored in strategy.session_rules)
     */
    const parseRuleExpression = useCallback((
        ruleExpression: string
    ): Condition | CompositeCondition | undefined => {
        if (!ruleExpression || !ruleExpression.trim()) return undefined;

        // Build a map of rule names to their conditions from all sources
        const ruleMap = new Map<string, Condition | CompositeCondition>();

        // 1. Add library rules (authenticated users only, from API)
        libraryRules.forEach(rule => {
            ruleMap.set(rule.name, rule.condition);
        });

        // 2. Add session rules (stored in strategy JSON, available to all users)
        const sessionRules = hook.getSessionRules();
        sessionRules.forEach(rule => {
            if (rule.name && rule.condition) {
                ruleMap.set(rule.name, rule.condition);
            }
        });

        // Parse the expression - split by AND/OR while preserving operators
        const tokens = ruleExpression.split(/\s+(AND|OR)\s+/i);

        if (tokens.length === 1) {
            // Single rule
            const ruleName = tokens[0].trim();
            return ruleMap.get(ruleName);
        }

        // Multiple rules with operators
        const conditions: Array<Condition | CompositeCondition> = [];
        const operators: Array<'AND' | 'OR'> = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].trim();
            if (token === 'AND' || token === 'OR') {
                operators.push(token.toUpperCase() as 'AND' | 'OR');
            } else {
                const condition = ruleMap.get(token);
                if (condition) {
                    conditions.push(condition);
                }
            }
        }

        if (conditions.length === 0) return undefined;
        if (conditions.length === 1) return conditions[0];

        // For simplicity, if all operators are the same, create a flat composite
        const allAnd = operators.every(op => op === 'AND');
        const allOr = operators.every(op => op === 'OR');

        if (allAnd) {
            return { op: 'AND', conditions };
        } else if (allOr) {
            return { op: 'OR', conditions };
        } else {
            // Mixed operators - build nested structure left-to-right
            let result: Condition | CompositeCondition = conditions[0];
            for (let i = 1; i < conditions.length; i++) {
                const operator = operators[i - 1];
                result = {
                    op: operator,
                    conditions: [result, conditions[i]]
                };
            }
            return result;
        }
    }, [libraryRules, hook]);

    /**
     * Handle rule assignment from the RuleAssignmentModal
     */
    const handleAssignRule = useCallback((ruleExpression: string) => {
        if (!selectedAllocationForRule) return;

        // Parse the expression into a proper Condition/CompositeCondition
        // Uses both library rules and session rules
        const condition = parseRuleExpression(ruleExpression);

        if (condition) {
            hook.setEntryCondition(selectedAllocationForRule, condition);
            showToast('Rule assigned successfully', 'success');
        } else {
            showToast('Failed to parse rule expression - ensure all rules exist', 'error');
        }

        setShowAssignRuleModal(false);
        setSelectedAllocationForRule(null);
    }, [selectedAllocationForRule, hook, parseRuleExpression, showToast]);

    // Check if canvas is empty (no portfolios)
    const hasNoPortfolios = Object.keys(hook.strategy.allocations).length === 0;

    // Canvas validity status for the indicator
    // - 'ready': All good, can run backtest
    // - 'invalid': Has invalid tickers (red status dots)
    // - 'warning': Has issues (disconnected chains) but user can still work
    // - 'empty': No portfolios yet
    // - 'loading': Canvas is restoring state from a loaded strategy
    const canvasStatus = React.useMemo(() => {
        // During canvas restoration, don't show validation errors (edges may not be loaded yet)
        if (isRestoringCanvas) return 'ready';

        const allocations = Object.keys(hook.strategy.allocations);
        if (allocations.length === 0) return 'empty';

        // Check for invalid tickers (highest priority error)
        if (hasInvalidPortfolios()) return 'invalid';

        // Check for disconnected chains
        const edgeData = edges.map(e => ({ source: e.source, target: e.target }));
        const hasDisconnected = hook.hasDisconnectedChains(edgeData);

        if (hasDisconnected && allocations.length > 1) return 'warning';
        return 'ready';
    }, [hook.strategy.allocations, edges, hook.hasDisconnectedChains, hasInvalidPortfolios, isRestoringCanvas]);

    return (
        <div className={`h-screen w-full relative ${isDark ? 'dark bg-[#121212]' : 'bg-slate-50'}`}>
            {/* Empty State - 3 Choices */}
            {hasNoPortfolios && (
                <EmptyCanvasState
                    onBuildOwn={handleQuickCreatePortfolio}
                    onLoadPresets={() => setShowPresetModal(true)}
                    onLoadSaved={() => navigate('/portfolios?tab=saved')}
                />
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={handleInit}
                onMoveEnd={handleMoveEnd}
                onNodeDragStop={handleNodeDragStop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                connectionMode={ConnectionMode.Loose}
                defaultViewport={initialViewportRef.current || { x: DEFAULT_VIEWPORT.X, y: DEFAULT_VIEWPORT.Y, zoom: DEFAULT_VIEWPORT.ZOOM }}
                minZoom={DEFAULT_VIEWPORT.MIN_ZOOM}
                maxZoom={DEFAULT_VIEWPORT.MAX_ZOOM}
                zoomOnScroll={true}
                zoomOnPinch={true}
                zoomOnDoubleClick={true}
                panOnScroll={true}
                translateExtent={[[CANVAS_BOUNDS.MIN_X, CANVAS_BOUNDS.MIN_Y], [CANVAS_BOUNDS.MAX_X, CANVAS_BOUNDS.MAX_Y]]}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    color={isDark ? "#2a2a2a" : "#cbd5e1"}
                    gap={20}
                    size={1.5}
                    variant={BackgroundVariant.Dots}
                />
                <Controls showZoom={true} showInteractive={true} />


                {/* Top Center Toolbar - Clean & Professional */}
                <Panel position="top-center" className="mt-2 md:mt-4" style={{ zIndex: 20 }}>
                    <div className={`flex items-center gap-1 md:gap-1.5 rounded-md shadow-md px-2 md:px-3 py-1.5 md:py-2 ${isDark ? 'bg-slate-900/95 border border-slate-700/80' : 'bg-white border border-slate-200'
                        }`}>
                        {/* Add Portfolio */}
                        <div className="relative group">
                            <button
                                onClick={handleQuickCreatePortfolio}
                                disabled={Object.keys(hook.strategy.allocations).length >= MAX_PORTFOLIOS_PER_STRATEGY}
                                aria-label={Object.keys(hook.strategy.allocations).length >= MAX_PORTFOLIOS_PER_STRATEGY ? `Maximum ${MAX_PORTFOLIOS_PER_STRATEGY} portfolios reached` : 'Add new portfolio'}
                                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs md:text-sm font-medium ${isDark
                                    ? 'hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 disabled:hover:bg-transparent'
                                    : 'hover:bg-purple-100 text-purple-600 hover:text-purple-700 disabled:hover:bg-transparent'
                                    }`}
                                title="Add Portfolio"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="hidden sm:inline">Portfolio</span>
                            </button>
                            {Object.keys(hook.strategy.allocations).length >= MAX_PORTFOLIOS_PER_STRATEGY && (
                                <div className={`hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                                    }`}>
                                    Max {MAX_PORTFOLIOS_PER_STRATEGY} portfolios reached
                                </div>
                            )}
                        </div>

                        {/* Add Rule */}
                        <button
                            onClick={() => setShowRuleModal(true)}
                            aria-label="Create new switching rule"
                            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 rounded transition-colors group relative text-xs md:text-sm font-medium ${isDark
                                ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300'
                                : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'
                                }`}
                            title="Create Rule"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="hidden sm:inline">Rule</span>
                        </button>

                        {/* Divider - Desktop only */}
                        <div className={`h-5 w-px hidden lg:block ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

                        {/* Inline Settings - Desktop only */}
                        <div className="hidden lg:flex items-center gap-2">
                            {/* Date Range Inputs */}
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="date"
                                    value={hook.strategy.start_date}
                                    onChange={(e) => hook.updateStrategy({ ...hook.strategy, start_date: e.target.value })}
                                    className={`text-xs px-2 py-1.5 rounded-md border ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-500'
                                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                                        } focus:outline-none w-32`}
                                    title="Start Date (optional) — Leave empty to use the earliest available data for your tickers"
                                />
                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>to</span>
                                <input
                                    type="date"
                                    value={hook.strategy.end_date}
                                    onChange={(e) => hook.updateStrategy({ ...hook.strategy, end_date: e.target.value })}
                                    className={`text-xs px-2 py-1.5 rounded-md border ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-500'
                                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                                        } focus:outline-none w-32`}
                                    title="End Date (optional) — Leave empty to use the most recent available data for your tickers"
                                />
                            </div>

                            {/* Divider */}
                            <div className={`h-5 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

                            {/* Initial Capital Input */}
                            <div className="relative">
                                <div className={`absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    $
                                </div>
                                <input
                                    type="number"
                                    value={hook.strategy.initial_capital}
                                    onChange={(e) => hook.updateStrategy({ ...hook.strategy, initial_capital: parseFloat(e.target.value) || 100000 })}
                                    className={`text-xs px-2 pl-5 py-1.5 rounded-md border ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-500'
                                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                                        } focus:outline-none w-28`}
                                    min="1000"
                                    step="1000"
                                    title="Initial Capital"
                                />
                            </div>
                        </div>

                        {/* Settings Button */}
                        <button
                            onClick={() => setShowAdvancedSettings(true)}
                            aria-label="Open strategy settings"
                            className={`p-2 md:p-2.5 rounded transition-colors group relative ${isDark
                                ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                                }`}
                            title="Strategy Settings"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div className={`h-5 w-px hidden sm:block ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

                        {/* JSON Editor - Hidden on mobile */}
                        <button
                            onClick={() => setShowJsonEditor(true)}
                            aria-label="Edit strategy JSON"
                            className={`hidden sm:block p-2 md:p-2.5 rounded transition-colors group relative ${isDark
                                ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                                }`}
                            title="Edit JSON"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <div className={`hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                                }`}>
                                Edit JSON
                            </div>
                        </button>

                        {/* Reset Canvas */}
                        <button
                            onClick={() => {
                                setConfirmDialog({
                                    isOpen: true,
                                    title: 'Clear Canvas',
                                    message: 'This will remove all portfolios. Are you sure?',
                                    onConfirm: () => {
                                        // CLEAN API V4.0: Just preserve config settings
                                        const preservedConfig = {
                                            start_date: hook.strategy.start_date,
                                            end_date: hook.strategy.end_date,
                                            initial_capital: hook.strategy.initial_capital,
                                            evaluation_frequency: hook.strategy.evaluation_frequency,
                                            cashflow_amount: hook.strategy.cashflow_amount,
                                            cashflow_frequency: hook.strategy.cashflow_frequency,
                                        };

                                        // Update strategy to clear canvas elements
                                        hook.updateStrategy({
                                            ...preservedConfig,
                                            allocations: {},
                                            fallback_allocation: '',
                                            allocation_order: [],
                                            canvas_edges: [],
                                            canvas_positions: {},
                                            canvas_viewport: undefined,
                                        });

                                        // Clear visual state
                                        nodePositionsRef.current.clear();
                                        hasRestoredViewport.current = false;
                                        initialViewportRef.current = undefined;
                                        setNodes([]);
                                        setEdges([]);

                                        // Reset viewport to default
                                        if (reactFlowInstance) {
                                            reactFlowInstance.setViewport({ x: DEFAULT_VIEWPORT.X, y: DEFAULT_VIEWPORT.Y, zoom: DEFAULT_VIEWPORT.ZOOM });
                                        }

                                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                                    },
                                });
                            }}
                            aria-label="Reset canvas and clear all portfolios"
                            className={`hidden sm:block p-2 md:p-2.5 rounded transition-colors group relative ${isDark
                                ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                                }`}
                            title="Reset Canvas"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <div className={`hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                                }`}>
                                Reset Canvas
                            </div>
                        </button>

                        {/* Divider */}
                        <div className={`h-5 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

                        {/* Run Backtest Button - Primary CTA */}
                        {onRunBacktest && (
                            <button
                                onClick={onRunBacktest}
                                disabled={isBacktestLoading || isMonteCarloLoading}
                                aria-label={isBacktestLoading ? 'Running backtest...' : 'Run Backtest'}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded font-medium transition-colors disabled:cursor-not-allowed group relative overflow-hidden ${isDark
                                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                title="Run Backtest"
                            >
                                {isBacktestLoading ? (
                                    <>
                                        <svg className="w-4 h-4 md:w-5 md:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-xs md:text-sm">Running...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        <span className="text-xs md:text-sm">Backtest</span>
                                    </>
                                )}
                            </button>
                        )}

                        {/* Monte Carlo Simulation Button - Core Feature */}
                        {onRunMonteCarlo && (
                            <button
                                onClick={onRunMonteCarlo}
                                disabled={isBacktestLoading || isMonteCarloLoading}
                                aria-label={isMonteCarloLoading ? 'Running Monte Carlo...' : 'Run Monte Carlo Simulation (75 simulations × 10 years)'}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded font-medium transition-colors disabled:cursor-not-allowed group relative overflow-hidden whitespace-nowrap ${isDark
                                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-500 hover:to-teal-500'
                                    : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-500 hover:to-teal-500'
                                    }`}
                                title="Monte Carlo Simulation"
                            >
                                {isMonteCarloLoading ? (
                                    <>
                                        <svg className="w-4 h-4 md:w-5 md:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-xs md:text-sm">Simulating...</span>
                                    </>
                                ) : (
                                    <>
                                        {/* Monte Carlo / Probability Distribution Icon */}
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className="text-xs md:text-sm">Monte Carlo</span>
                                    </>
                                )}
                                {/* Tooltip with description */}
                                <div className={`hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'}`}>
                                    <div className="font-medium">Monte Carlo Simulation</div>
                                    <div className="text-slate-400 text-[10px]">75 simulations × 10 years</div>
                                </div>
                            </button>
                        )}

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            disabled={isSharing || Object.keys(hook.strategy.allocations).length === 0}
                            aria-label={shareCopied ? 'Link copied!' : 'Share strategy'}
                            className={`p-2 md:p-2.5 rounded transition-colors group relative ${shareCopied
                                ? isDark
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-emerald-50 text-emerald-600'
                                : isDark
                                    ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
                                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={shareCopied ? 'Link copied!' : 'Share Strategy'}
                        >
                            {isSharing ? (
                                <svg className="w-4 h-4 md:w-5 md:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : shareCopied ? (
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            )}
                            <div className={`hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                                }`}>
                                {shareCopied ? 'Link copied!' : 'Share Strategy'}
                            </div>
                        </button>
                    </div>
                </Panel>

                {/* Canvas Validity Status Indicator - Top Right */}
                <Panel position="top-right" className="!m-4" style={{ zIndex: 10 }}>
                    <div className="relative group/status">
                        {/* Status Dot */}
                        <div className="relative cursor-default">
                            <div
                                className={`w-2 h-2 rounded-full transition-colors ${canvasStatus === 'ready'
                                    ? 'bg-emerald-500'
                                    : canvasStatus === 'invalid'
                                        ? 'bg-red-500'
                                        : canvasStatus === 'warning'
                                            ? 'bg-amber-500'
                                            : 'bg-slate-400'
                                    }`}
                            />
                            {/* Pulse animation for ready state */}
                            {canvasStatus === 'ready' && (
                                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                            )}
                        </div>
                        {/* Expanded Tooltip on Hover */}
                        <div className={`absolute top-full mt-2 right-0 text-xs px-3 py-2 rounded-md opacity-0 group-hover/status:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg ${isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'
                            }`}>
                            {canvasStatus === 'ready' && 'All portfolios connected, ready to run'}
                            {canvasStatus === 'invalid' && 'Fix invalid tickers before running'}
                            {canvasStatus === 'warning' && 'Connect all portfolios before running'}
                            {canvasStatus === 'empty' && 'Add portfolios to get started'}
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Modals */}
            <PortfolioCreationModal
                isOpen={showPortfolioModal}
                onClose={() => setShowPortfolioModal(false)}
                onCreate={handleCreatePortfolio}
            />

            <RuleCreationModal
                isOpen={showRuleModal}
                onClose={() => setShowRuleModal(false)}
                onCreate={handleCreateRule}
            />

            <RuleAssignmentModal
                isOpen={showAssignRuleModal}
                onClose={() => {
                    setShowAssignRuleModal(false);
                    setSelectedAllocationForRule(null);
                }}
                onAssign={handleAssignRule}
                onClear={() => {
                    if (selectedAllocationForRule) {
                        hook.removeEntryCondition(selectedAllocationForRule);
                    }
                    setShowAssignRuleModal(false);
                    setSelectedAllocationForRule(null);
                }}
                onCreateRule={() => setShowRuleModal(true)}
                targetAllocation={selectedAllocationForRule}
                temporaryRules={hook.getSessionRules()}
            />

            <JsonEditorModal
                isOpen={showJsonEditor}
                onClose={() => setShowJsonEditor(false)}
                strategy={hook.strategy}
                edges={edges.map(e => ({
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle || undefined,
                    targetHandle: e.targetHandle || undefined,
                }))}
                nodePositions={nodePositionsRef.current}
                viewport={reactFlowInstance?.getViewport()}
                onSave={(updatedStrategy, canvasEdges, canvasPositions, canvasViewport) => {
                    // Merge canvas state into the strategy
                    const strategyWithCanvas = {
                        ...updatedStrategy,
                        canvas_edges: canvasEdges || [],
                        canvas_positions: canvasPositions ? Object.fromEntries(canvasPositions) : {},
                        canvas_viewport: canvasViewport,
                    };

                    // Use loadStrategyFromTemplate to trigger proper rebuild
                    // This increments strategyLoadVersion which triggers the load effect
                    hook.loadStrategyFromTemplate(strategyWithCanvas);
                }}
            />

            {/* Advanced Settings Modal */}
            <AdvancedSettingsModal
                isOpen={showAdvancedSettings}
                onClose={() => setShowAdvancedSettings(false)}
                strategy={hook.strategy}
                onUpdateStrategy={hook.updateStrategy}
                isDark={isDark}
            />

            {/* Documentation Button - Bottom Right */}
            <button
                onClick={() => setShowDocumentation(true)}
                aria-label="Open documentation"
                className={`fixed bottom-6 right-6 z-50 p-3 backdrop-blur-sm rounded-md shadow-md hover:shadow-lg border transition-all hover:scale-105 ${isDark
                    ? 'bg-black/80 border-white/[0.15] hover:bg-black/90 hover:shadow-purple-500/20'
                    : 'bg-white/95 border-slate-200/50 hover:bg-white'
                    } ${hasNoPortfolios ? 'animate-pulse ring-2 ring-purple-500/50' : ''}`}
                title="Documentation (Press ? for help)"
            >
                <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {/* Documentation Modal */}
            <DocumentationModal
                isOpen={showDocumentation}
                onClose={() => setShowDocumentation(false)}
                isDark={isDark}
            />

            {/* Strategy Presets Modal - Using portal to render at body level for proper z-index */}
            {showPresetModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md shadow-xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'}`}>
                        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDark ? 'bg-zinc-900 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Strategy Presets
                                    </h2>
                                    <p className={`text-sm mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                                        Historical performance · 2015–2024 · Monthly rebalancing
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPresetModal(false)}
                                    className={`p-2 rounded-md transition-colors ${isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(STRATEGY_PRESETS).map(([name, preset]) => (
                                <button
                                    key={name}
                                    onClick={() => {
                                        // Generate auto-layout positions and edges
                                        const allocationNames = Object.keys(preset.allocations);
                                        const numPortfolios = allocationNames.length;
                                        const canvas_positions: Record<string, { x: number; y: number }> = {};
                                        const canvas_edges: Array<{ source: string; target: string }> = [];

                                        // Helper function to find the closest edge (left, right, top, bottom) between two nodes
                                        const findClosestEdge = (
                                            source: string,
                                            target: string,
                                            positions: Record<string, { x: number; y: number }>
                                        ) => {
                                            const sourcePos = positions[source];
                                            const targetPos = positions[target];

                                            // Calculate center-to-center direction
                                            const dx = targetPos.x - sourcePos.x;
                                            const dy = targetPos.y - sourcePos.y;

                                            // Determine primary direction and choose appropriate handles
                                            if (Math.abs(dx) > Math.abs(dy)) {
                                                // Horizontal connection
                                                return { source, target };
                                            } else {
                                                // Vertical connection
                                                return { source, target };
                                            }
                                        };

                                        // Auto-layout logic based on number of portfolios
                                        if (numPortfolios === 2) {
                                            // 2 portfolios: diagonal layout with explicit handles
                                            canvas_positions[allocationNames[0]] = { x: 139, y: 236 };
                                            canvas_positions[allocationNames[1]] = { x: 654, y: 340 };
                                            canvas_edges.push({
                                                source: allocationNames[0],
                                                target: allocationNames[1],
                                                sourceHandle: `${allocationNames[0]}-right`,
                                                targetHandle: `${allocationNames[1]}-left`
                                            } as any);
                                        } else if (numPortfolios === 3) {
                                            // 3 portfolios: V-shape layout with sequential right→left connections
                                            canvas_positions[allocationNames[0]] = { x: 30, y: 296 };
                                            canvas_positions[allocationNames[1]] = { x: 451, y: 591 };
                                            canvas_positions[allocationNames[2]] = { x: 850, y: 269 };
                                            canvas_edges.push({
                                                source: allocationNames[0],
                                                target: allocationNames[1],
                                                sourceHandle: `${allocationNames[0]}-right`,
                                                targetHandle: `${allocationNames[1]}-left`
                                            } as any);
                                            canvas_edges.push({
                                                source: allocationNames[1],
                                                target: allocationNames[2],
                                                sourceHandle: `${allocationNames[1]}-right`,
                                                targetHandle: `${allocationNames[2]}-left`
                                            } as any);
                                        } else if (numPortfolios >= 4) {
                                            // Grid layout with smart connections
                                            const cols = Math.ceil(Math.sqrt(numPortfolios));
                                            const rows = Math.ceil(numPortfolios / cols);
                                            const spacingX = 350;
                                            const spacingY = 280;

                                            // Position all nodes in grid
                                            allocationNames.forEach((name, idx) => {
                                                const row = Math.floor(idx / cols);
                                                const col = idx % cols;
                                                canvas_positions[name] = {
                                                    x: 120 + col * spacingX,
                                                    y: 120 + row * spacingY
                                                };
                                            });

                                            // Create edges connecting to nearest neighbors
                                            allocationNames.forEach((name, idx) => {
                                                const row = Math.floor(idx / cols);
                                                const col = idx % cols;

                                                // Connect to right neighbor in same row
                                                if (col < cols - 1 && idx + 1 < numPortfolios) {
                                                    canvas_edges.push(findClosestEdge(name, allocationNames[idx + 1], canvas_positions));
                                                }

                                                // Connect to node below in same column
                                                if (row < rows - 1 && idx + cols < numPortfolios) {
                                                    canvas_edges.push(findClosestEdge(name, allocationNames[idx + cols], canvas_positions));
                                                }
                                            });
                                        } else {
                                            // Single portfolio - center it
                                            canvas_positions[allocationNames[0]] = { x: 400, y: 250 };
                                        }

                                        // Skip auto-fallback detection - preset already has explicit fallback
                                        skipAutoFallbackRef.current = true;

                                        // Reset viewport restoration flag to allow fitView
                                        hasRestoredViewport.current = false;

                                        // Load with canvas layout (no viewport to avoid conflicts)
                                        hook.loadStrategyFromTemplate({
                                            ...preset,
                                            canvas_positions,
                                            canvas_edges,
                                            canvas_viewport: undefined // Don't restore viewport, let fitView handle it
                                        });
                                        setShowPresetModal(false);

                                        // Center and fit everything in view after edges render
                                        setTimeout(() => {
                                            if (reactFlowInstance) {
                                                reactFlowInstance.fitView({ padding: PRESET_FIT_VIEW_PADDING, duration: TIMING.FIT_VIEW_ANIMATION, maxZoom: FIT_VIEW_MAX_ZOOM, minZoom: FIT_VIEW_MIN_ZOOM });
                                                hasRestoredViewport.current = true;
                                            }
                                        }, TIMING.PRESET_FIT_VIEW_DELAY);
                                    }}
                                    className={`p-5 rounded-md text-left transition-all group ${isDark
                                        ? 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-purple-500/40'
                                        : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-300 shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className={`text-[15px] font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {name}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${Object.values(preset.allocations).some((a: any) => a.entry_condition)
                                            ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600')
                                            : (isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600')
                                            }`}>
                                            {Object.values(preset.allocations).some((a: any) => a.entry_condition) ? 'Tactical' : 'Static'}
                                        </span>
                                    </div>

                                    {/* Metrics display */}
                                    {STRATEGY_PRESET_METRICS[name] && (
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <div>
                                                <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>CAGR</div>
                                                <div className={`text-sm font-semibold ${STRATEGY_PRESET_METRICS[name].cagr >= 10 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-white' : 'text-slate-900')}`}>
                                                    {STRATEGY_PRESET_METRICS[name].cagr.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Max DD</div>
                                                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    -{STRATEGY_PRESET_METRICS[name].maxDrawdown.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Sharpe</div>
                                                <div className={`text-sm font-semibold ${STRATEGY_PRESET_METRICS[name].sharpeRatio >= 0.8 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-white' : 'text-slate-900')}`}>
                                                    {STRATEGY_PRESET_METRICS[name].sharpeRatio.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                                        {Object.keys(preset.allocations).length} portfolio{Object.keys(preset.allocations).length > 1 ? 's' : ''} {Object.values(preset.allocations).filter((a: any) => a.entry_condition).length > 0 ? `• ${Object.values(preset.allocations).filter((a: any) => a.entry_condition).length} rule${Object.values(preset.allocations).filter((a: any) => a.entry_condition).length > 1 ? 's' : ''}` : ''}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Toast notifications */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            {/* Confirm dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant="danger"
                confirmLabel="Clear Canvas"
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
