import type { ComponentDefinition, SurfaceState } from '../../types';
import { resolvePropValue } from '../../utils';
import { sanitizeComponentProps } from '../../utils/validation';

/**
 * Extracts component type from nested A2UI v0.8 component structure
 * Per spec: { id: "...", component: { Text: { ... } } }
 */
export function getComponentType(componentDef: ComponentDefinition): string | null {
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
 * Extracts component props from nested A2UI v0.8 component structure
 */
export function getComponentProps(componentDef: ComponentDefinition): Record<string, unknown> {
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

/**
 * Resolves and sanitizes component props with data binding
 */
export function resolveComponentProps(
  componentProps: Record<string, unknown>,
  componentType: string,
  surface: SurfaceState
): {
  resolvedProps: Record<string, unknown>;
  valuePath?: string;
} {
  // Sanitize props to prevent XSS attacks (security requirement)
  const sanitizedProps = sanitizeComponentProps(componentProps);
  const resolvedProps: Record<string, unknown> = {};
  
  // Extract value path for form components (TextField, TextArea, Select, Checkbox) for two-way binding
  let valuePath: string | undefined;
  const formComponents = ['TextField', 'TextArea', 'Select', 'Checkbox'];
  if (formComponents.includes(componentType)) {
    const valueKey = componentType === 'Checkbox' ? 'checked' : 'value';
    if (sanitizedProps[valueKey]) {
      const valueProp = sanitizedProps[valueKey] as any;
      if (typeof valueProp === 'object' && valueProp !== null) {
        if ('path' in valueProp) {
          valuePath = valueProp.path;
        } else if ('literalString' in valueProp || 'literalNumber' in valueProp || 'literalBoolean' in valueProp) {
          // Literal value, no path binding
          valuePath = undefined;
        }
      }
    }
  }
  
  Object.entries(sanitizedProps).forEach(([key, value]) => {
    // Skip special keys that are handled separately
    if (key === 'explicitList' || key === 'template' || key === 'child' || key === 'action') {
      return;
    }
    // For Button components with children, skip 'text' prop to avoid duplication
    // Children should be rendered via 'child' or 'explicitList', not 'text' prop
    if (componentType === 'Button' && key === 'text' && 
        (('child' in sanitizedProps && sanitizedProps.child) || 
         ('explicitList' in sanitizedProps && Array.isArray(sanitizedProps.explicitList) && sanitizedProps.explicitList.length > 0))) {
      return; // Skip text prop when Button has children
    }
    resolvedProps[key] = resolvePropValue(value as any, surface.dataModel);
  });
  
  // Pass value path to form components for two-way binding
  if (formComponents.includes(componentType) && valuePath) {
    resolvedProps._valuePath = valuePath;
  }

  return { resolvedProps, valuePath };
}
