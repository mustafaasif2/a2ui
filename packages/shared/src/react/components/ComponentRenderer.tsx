import React from 'react';
import type { ComponentDefinition, SurfaceState } from '../../types';
import { resolvePropValue } from '../../utils';

export interface ComponentProps {
  componentId: string;
  onAction?: (action: { name: string; context?: Record<string, unknown> }) => void;
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
  onAction?: (action: { name: string; context?: Record<string, unknown> }) => void;
}

export default function ComponentRenderer({
  componentId,
  surface,
  componentRegistry,
  onAction,
}: ComponentRendererProps) {
  const renderComponent = (id: string): React.ReactNode => {
    const comp = surface.components.get(id);
    if (!comp) {
      return null;
    }

    const Comp = componentRegistry.get(comp.type);
    if (!Comp) {
      console.warn(`Unknown component type: ${comp.type}`);
      return <div>Unknown component: {comp.type}</div>;
    }

    // Resolve props with data binding
    const resolvedProps: Record<string, unknown> = {};
    if (comp.props) {
      Object.entries(comp.props).forEach(([key, value]) => {
        resolvedProps[key] = resolvePropValue(value, surface.dataModel);
      });
    }

    // Handle children
    const children: React.ReactNode[] = [];
    if (comp.children) {
      comp.children.forEach((childId) => {
        const childNode = renderComponent(childId);
        if (childNode) {
          children.push(childNode);
        }
      });
    }

    // Handle template children for dynamic lists
    if (comp.template) {
      const dataPath = comp.template.dataPath;
      if (dataPath) {
        try {
          const dataArray = resolvePropValue(
            { path: dataPath },
            surface.dataModel
          ) as unknown[];
          if (Array.isArray(dataArray)) {
            dataArray.forEach((item, index) => {
              comp.template!.children.forEach((childId) => {
                const childNode = renderComponent(childId);
                if (childNode) {
                  children.push(<div key={`${childId}-${index}`}>{childNode}</div>);
                }
              });
            });
          }
        } catch (error) {
          console.error('Failed to render template:', error);
        }
      }
    }

    return (
      <Comp
        key={id}
        {...resolvedProps}
        componentId={id}
        onAction={onAction}
      >
        {children.length > 0 ? children : null}
      </Comp>
    );
  };

  return <>{renderComponent(componentId)}</>;
}
