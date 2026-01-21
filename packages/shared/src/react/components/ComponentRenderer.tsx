import React from 'react';
import type { SurfaceState } from '../../types';
import { getComponentType, getComponentProps, resolveComponentProps } from '../utils/componentProps';
import { renderComponentChildren } from '../utils/componentChildren';
import { createButtonActionHandler } from '../utils/componentActions';

export interface ComponentProps {
  componentId: string;
  onAction?: (action: { name: string; sourceComponentId?: string; surfaceId?: string; timestamp?: string; context?: Record<string, unknown> }) => void;
  updateDataModel?: (path: string, value: unknown) => void;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export type ComponentType = React.ComponentType<ComponentProps>;

export interface ComponentRegistry {
  get(type: string): ComponentType | undefined;
  has(type: string): boolean;
}

interface ComponentRendererProps {
  componentId: string;
  surface: SurfaceState;
  componentRegistry: ComponentRegistry;
  onAction?: (action: { name: string; sourceComponentId: string; surfaceId: string; timestamp: string; context?: Record<string, unknown> }) => void;
  onError?: (error: { message: string; code?: string; componentId?: string; context?: Record<string, unknown> }) => void;
  updateDataModel?: (path: string, value: unknown) => void;
  isActionLoading?: boolean;
}

export default function ComponentRenderer({
  componentId,
  surface,
  componentRegistry,
  onAction,
  onError,
  updateDataModel,
  isActionLoading = false,
}: ComponentRendererProps) {
  const renderComponent = (id: string): React.ReactNode => {
    const comp = surface.components.get(id);
    if (!comp) {
      return null;
    }

    // Extract component type from nested structure (A2UI v0.8 spec)
    const componentType = getComponentType(comp);
    if (!componentType) {
      const errorMsg = `Component ${id} has invalid structure`;
      console.warn(errorMsg);
      onError?.({
        message: errorMsg,
        code: 'INVALID_COMPONENT_STRUCTURE',
        componentId: id,
      });
      return null;
    }

    // Validate component type against catalog (security requirement)
    if (!componentRegistry.has(componentType)) {
      const errorMsg = `Unknown component type: ${componentType}. Component not in catalog.`;
      console.warn(errorMsg);
      onError?.({
        message: errorMsg,
        code: 'UNKNOWN_COMPONENT_TYPE',
        componentId: id,
        context: { componentType },
      });
      // Return fallback UI instead of rendering unknown component (security)
      return (
        <div style={{ padding: '8px', border: '1px solid #ff6b6b', borderRadius: '4px', color: '#ff6b6b' }}>
          Unknown component: {componentType}
        </div>
      );
    }

    const Comp = componentRegistry.get(componentType);
    if (!Comp) {
      const errorMsg = `Component type ${componentType} registered but not available`;
      console.error(errorMsg);
      onError?.({
        message: errorMsg,
        code: 'COMPONENT_REGISTRY_ERROR',
        componentId: id,
        context: { componentType },
      });
      return null;
    }

    // Extract and resolve props with data binding
    const componentProps = getComponentProps(comp);
    const { resolvedProps } = resolveComponentProps(componentProps, componentType, surface);

    // Handle children per A2UI v0.8 spec
    const children = renderComponentChildren(comp, surface, renderComponent, onError);

    // Handle action for Button components
    const buttonActionProps = createButtonActionHandler(
      id,
      componentType,
      componentProps,
      surface,
      onAction,
      isActionLoading
    );
    
    // Merge button action props into resolved props
    Object.assign(resolvedProps, buttonActionProps);

    return (
      <Comp
        key={id}
        {...resolvedProps}
        componentId={id}
        updateDataModel={updateDataModel}
      >
        {children.length > 0 ? children : null}
      </Comp>
    );
  };

  return <>{renderComponent(componentId)}</>;
}
