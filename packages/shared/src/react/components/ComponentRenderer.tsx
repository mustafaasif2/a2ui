import React from 'react';
import type { ComponentDefinition, SurfaceState, ComponentTypeDefinition } from '../../types';
import { resolvePropValue } from '../../utils';

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
}

/**
 * Extract component type from nested A2UI v0.8 component structure
 * Per spec: { id: "...", component: { Text: { ... } } }
 */
function getComponentType(componentDef: ComponentDefinition): string | null {
  const component = componentDef.component;
  if (!component || typeof component !== 'object') {
    return null;
  }

  // Get the first key (which is the component type)
  const keys = Object.keys(component);
  if (keys.length === 0) {
    return null;
  }

  return keys[0];
}

/**
 * Extract component props from nested A2UI v0.8 component structure
 */
function getComponentProps(componentDef: ComponentDefinition): Record<string, unknown> {
  const component = componentDef.component;
  if (!component || typeof component !== 'object') {
    return {};
  }

  const keys = Object.keys(component);
  if (keys.length === 0) {
    return {};
  }

  // Get props from the component type object
  // Use type assertion since ComponentTypeDefinition is a union type
  const componentTypeKey = keys[0];
  return (component as Record<string, Record<string, unknown>>)[componentTypeKey] || {};
}

export default function ComponentRenderer({
  componentId,
  surface,
  componentRegistry,
  onAction,
  onError,
  updateDataModel,
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

    const Comp = componentRegistry.get(componentType);
    if (!Comp) {
      const errorMsg = `Unknown component type: ${componentType}`;
      console.warn(errorMsg);
      onError?.({
        message: errorMsg,
        code: 'UNKNOWN_COMPONENT_TYPE',
        componentId: id,
        context: { componentType },
      });
      return <div>Unknown component: {componentType}</div>;
    }

    // Extract and resolve props with data binding
    const componentProps = getComponentProps(comp);
    const resolvedProps: Record<string, unknown> = {};
    
    // Extract value path for TextField two-way binding
    let valuePath: string | undefined;
    if (componentType === 'TextField' && componentProps.value) {
      const valueProp = componentProps.value as any;
      if (typeof valueProp === 'object' && valueProp !== null) {
        if ('path' in valueProp) {
          valuePath = valueProp.path;
        } else if ('literalString' in valueProp || 'literalNumber' in valueProp || 'literalBoolean' in valueProp) {
          // Literal value, no path binding
          valuePath = undefined;
        }
      }
    }
    
    Object.entries(componentProps).forEach(([key, value]) => {
      // Skip special keys that are handled separately
      if (key === 'explicitList' || key === 'template' || key === 'child' || key === 'action') {
        return;
      }
      resolvedProps[key] = resolvePropValue(value as any, surface.dataModel);
    });
    
    // Pass value path to TextField for two-way binding
    if (componentType === 'TextField' && valuePath) {
      resolvedProps._valuePath = valuePath;
    }

    // Handle children per A2UI v0.8 spec
    const children: React.ReactNode[] = [];

    // Handle explicitList for static children (Row, Column, Card, List, Button)
    if ('explicitList' in componentProps && Array.isArray(componentProps.explicitList)) {
      componentProps.explicitList.forEach((childId: string) => {
        const childNode = renderComponent(childId);
        if (childNode) {
          children.push(childNode);
        }
      });
    }

    // Handle single child for Button
    if ('child' in componentProps && typeof componentProps.child === 'string') {
      const childNode = renderComponent(componentProps.child);
      if (childNode) {
        children.push(childNode);
      }
    }

    // Handle template children for dynamic lists (A2UI v0.8 spec)
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
          const errorMsg = `Failed to render template: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          onError?.({
            message: errorMsg,
            code: 'TEMPLATE_RENDER_ERROR',
            componentId: id,
            context: { dataPath },
          });
        }
      } else {
        // Template without dataPath - render template children once
        comp.template.children.forEach((childId) => {
          const childNode = renderComponent(childId);
          if (childNode) {
            children.push(childNode);
          }
        });
      }
    }

    // Handle action for Button components
    // Per A2UI v0.8 spec: resolve context values with bound data and include required fields
    if ('action' in componentProps && componentProps.action) {
      const action = componentProps.action as { name: string; context?: Record<string, unknown> };
      resolvedProps.onAction = (() => {
        if (onAction) {
          // Resolve context values with bound data from data model
          let finalContext = action.context;
          if (action.context) {
            const resolvedContext: Record<string, unknown> = {};
            Object.entries(action.context).forEach(([key, value]) => {
              // If value is a path or combined value, resolve it
              if (typeof value === 'object' && value !== null && 'path' in value) {
                resolvedContext[key] = resolvePropValue(value as any, surface.dataModel);
              } else {
                // Otherwise, try to resolve it as a prop value
                resolvedContext[key] = resolvePropValue(value as any, surface.dataModel);
              }
            });
            finalContext = Object.keys(resolvedContext).length > 0 ? resolvedContext : action.context;
          }
          
          onAction({
            name: action.name,
            sourceComponentId: id,
            surfaceId: surface.surfaceId,
            timestamp: new Date().toISOString(),
            context: finalContext,
          });
        }
      }) as any;
    }
    
    // Handle TextField input changes - wrap onAction with proper format
    // TextField calls onAction with action object, so we wrap it
    if (componentType === 'TextField' && onAction) {
      resolvedProps.onAction = ((action: { name: string; context?: Record<string, unknown> }) => {
        // Wrap the action with required fields per A2UI v0.8 spec
        onAction({
          name: action.name,
          sourceComponentId: id,
          surfaceId: surface.surfaceId,
          timestamp: new Date().toISOString(),
          context: action.context,
        });
      }) as any;
    }

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
