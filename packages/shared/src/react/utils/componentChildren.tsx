import React from 'react';
import type { ComponentDefinition, SurfaceState } from '../../types';
import { resolvePropValue } from '../../utils';

/**
 * Renders children for a component based on A2UI v0.8 spec
 * Handles explicitList, single child, and template children
 */
export function renderComponentChildren(
  componentDef: ComponentDefinition,
  surface: SurfaceState,
  renderComponent: (id: string) => React.ReactNode,
  onError?: (error: { message: string; code?: string; componentId?: string; context?: Record<string, unknown> }) => void
): React.ReactNode[] {
  const children: React.ReactNode[] = [];
  const component = componentDef.component;
  if (!component || typeof component !== 'object') {
    return children;
  }

  const keys = Object.keys(component);
  if (keys.length === 0) {
    return children;
  }

  const componentTypeKey = keys[0];
  const componentProps = (component as Record<string, Record<string, unknown>>)[componentTypeKey] || {};

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
  // Note: Button should use either 'child' OR 'explicitList', not both
  // If both are present, prefer explicitList (multiple children)
  if ('child' in componentProps && typeof componentProps.child === 'string') {
    // Only add child if explicitList wasn't already used (avoid duplicates)
    if (!('explicitList' in componentProps && Array.isArray(componentProps.explicitList) && componentProps.explicitList.length > 0)) {
      const childNode = renderComponent(componentProps.child);
      if (childNode) {
        children.push(childNode);
      }
    }
  }

  // Handle template children for dynamic lists (A2UI v0.8 spec)
  if (componentDef.template) {
    const dataPath = componentDef.template.dataPath;
    if (dataPath) {
      try {
        const dataArray = resolvePropValue(
          { path: dataPath },
          surface.dataModel
        ) as unknown[];
        if (Array.isArray(dataArray)) {
          dataArray.forEach((item, index) => {
            componentDef.template!.children.forEach((childId) => {
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
          componentId: componentDef.id,
          context: { dataPath },
        });
      }
    } else {
      // Template without dataPath - render template children once
      componentDef.template.children.forEach((childId) => {
        const childNode = renderComponent(childId);
        if (childNode) {
          children.push(childNode);
        }
      });
    }
  }

  return children;
}
