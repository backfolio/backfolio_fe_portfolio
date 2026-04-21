import { useCallback } from 'react';
import { Node, Edge, ReactFlowInstance } from 'reactflow';
import { Allocation } from '../../../types/strategy';
import { useTacticalStrategy } from '../../../hooks/useTacticalStrategy';
import { FIT_VIEW_PADDING, TIMING, FIT_VIEW_MAX_ZOOM, FIT_VIEW_MIN_ZOOM } from '../constants/canvas';

interface NodeCallbackDependencies {
    hook: ReturnType<typeof useTacticalStrategy>;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    nodePositionsRef: React.MutableRefObject<Map<string, { x: number; y: number }>>;
    validatePortfolioTickers: (portfolioName: string, allocation: Allocation) => Promise<void>;
    handleDuplicateNode: (sourceNodeId: string) => void;
    setSelectedAllocationForRule: (name: string | null) => void;
    setShowAssignRuleModal: (show: boolean) => void;
    reactFlowInstance: ReactFlowInstance | null;
}

export interface NodeCallbacks {
    onUpdate: (newAllocation: Allocation, rebalancingFrequency?: string) => void;
    onRename: (newName: string) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onManageRules: () => void;
    onClearRules: () => void;
    onFitView?: () => void;
}

/**
 * Creates a factory function that generates node callbacks for a given node name.
 * This reduces code duplication across node initialization, quick create, and create portfolio handlers.
 */
export function useNodeCallbackFactory(deps: NodeCallbackDependencies) {
    const {
        hook,
        setNodes,
        setEdges,
        nodePositionsRef,
        validatePortfolioTickers,
        handleDuplicateNode,
        setSelectedAllocationForRule,
        setShowAssignRuleModal,
        reactFlowInstance,
    } = deps;

    const createNodeCallbacks = useCallback((nodeName: string, options?: { includeFitView?: boolean }): NodeCallbacks => {
        const callbacks: NodeCallbacks = {
            onUpdate: (newAllocation: Allocation, rebalancingFrequency?: string) => {
                hook.updateAllocation(nodeName, {
                    allocation: newAllocation,
                    rebalancing_frequency: rebalancingFrequency as 'none' | 'monthly' | 'quarterly' | 'yearly' | undefined,
                });
                validatePortfolioTickers(nodeName, newAllocation);
            },
            onRename: (newName: string) => {
                hook.renameAllocation(nodeName, newName);
                // Update position tracking
                const pos = nodePositionsRef.current.get(nodeName);
                if (pos) {
                    nodePositionsRef.current.delete(nodeName);
                    nodePositionsRef.current.set(newName, pos);
                }
                setNodes((nds) =>
                    nds.map((n) => (n.id === nodeName ? { ...n, id: newName, data: { ...n.data, name: newName }, position: n.position } : n))
                );
                setEdges((eds) =>
                    eds.map((e) => ({
                        ...e,
                        source: e.source === nodeName ? newName : e.source,
                        target: e.target === nodeName ? newName : e.target,
                    }))
                );
            },
            onDelete: () => {
                hook.deleteAllocation(nodeName);
                nodePositionsRef.current.delete(nodeName);
                setNodes((nds) => nds.filter((n) => n.id !== nodeName));
                setEdges((eds) =>
                    eds.filter((e) => e.source !== nodeName && e.target !== nodeName)
                );
            },
            onDuplicate: () => {
                handleDuplicateNode(nodeName);
            },
            onManageRules: () => {
                setSelectedAllocationForRule(nodeName);
                setShowAssignRuleModal(true);
            },
            onClearRules: () => {
                hook.removeEntryCondition(nodeName);
            },
        };

        // Only include fitView callback when explicitly requested (for main effect, not for quick create)
        if (options?.includeFitView && reactFlowInstance) {
            callbacks.onFitView = () => {
                reactFlowInstance.fitView({ padding: FIT_VIEW_PADDING, duration: TIMING.FIT_VIEW_ANIMATION, maxZoom: FIT_VIEW_MAX_ZOOM, minZoom: FIT_VIEW_MIN_ZOOM });
            };
        }

        return callbacks;
    }, [
        hook,
        setNodes,
        setEdges,
        nodePositionsRef,
        validatePortfolioTickers,
        handleDuplicateNode,
        setSelectedAllocationForRule,
        setShowAssignRuleModal,
        reactFlowInstance,
    ]);

    return createNodeCallbacks;
}

